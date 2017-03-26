/**
 * PLEASE READ:
 *
 * There are several issues with Chrome that stop the SpeechSynthesis api from continuing to speak on
 * long text. Bascially anything over 14-15 seconds or 200-300 characters of text. For more information,
 * please read the issue on Chromes bug list: 
 *
 * https://bugs.chromium.org/p/chromium/issues/detail?id=369472
 *
 * So, you'll see some console.log's which help this issue. DO NOT REMOVE THEM. I also found that instead
 * of using the chunking method described in the gist below, you can set a timer to pause/resume the
 * synthesis api to fix the issue. But, it still remains that we need to keep the logging to assure the
 * `onend` event fires.
 *
 * https://gist.github.com/hsed/ef4a2d17f76983588cb6d2a11d4566d6
 */
import Ember from 'ember';

const {
	computed,
	run: {
		next,
		later,
		cancel: cancelTimer,
	},
} = Ember;

const PAUSE_RESUME_TIMER = 10000;

export default Ember.Object.extend(Ember.Evented, {
  isPaused: computed.bool('_paused').readOnly(),
  isPlaying: computed.bool('_playing').readOnly(),
	isPlayable: computed.not('_canceled').readOnly(),
	_canceled: false,
  _paused: false,
  _playing: false,
	_didPlay: false,
  _pauseResumeTimer: null,
  _utterance: null,
	_synth: null,
	init,
	play,
	pause,
	resume,
	cancel,
	willDestroy,
	_clearTimer,
	_clearEvents,
	_startTimer,
});

/**
 * Overrides the init method. Here we set the event callbacks with the current context so we can add
 * and remove them later during the destroying phase.
 * @public
 * @overrides
 * @memberOf {Reader}
 * @return {undefined}
 */
function init() {
	this._super(...arguments);

	this.setProperties({
		onEnd: () => {
			this._clearTimer();
			this._clearEvents();
			this.setProperties({
				_paused: false,
				_playing: false,
			});
		},
		onPlay: () => {
			this.setProperties({
				_paused: false,
				_playing: true,
			});
		},
		onError: (event) => {
			this.trigger('error', event);
		},
	});

	const utter = this.get('_utterance');
	utter.addEventListener('start', this.get('onPlay'));
	utter.addEventListener('resume', this.get('onPlay'));
	utter.addEventListener('end', this.get('onEnd'));
	utter.addEventListener('error', this.get('onError'));
}

/**
 * Starts playing the desired text.
 * @public
 * @memberOf {Reader}
 * @return {undefined}
 */
function play() {
	if (this.get('_didPlay')) {
		this.resume();
		return;
	}

	this.set('_didPlay', true);
	const utter = this.get('_utterance'),
		synth = this.get('_synth');

	synth.cancel();

	//IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
	console.log(utter);
	// Placing the speak invocation inside a callback fixes ordering and onend issues
	next(() => {
		synth.speak(utter); 
	});

	this._startTimer();
}

/**
 * Pauses the reader.
 * @public
 * @memberOf {Reader}
 * @return {undefined}
 */
function pause() {
	this._clearTimer();
	this.get('_synth').pause();
	this.setProperties({
		_paused: true,
		_playing: false,
	});
}

/**
 * Resumes the reader.
 * @public
 * @memberOf {Reader}
 * @return {undefined}
 */
function resume() {
	if (!this.get('_paused')) {
		return;
	}

	const utter = this.get('_utterance'),
		synth = this.get('_synth');

	this.setProperties({
		_paused: false,
		_playing: true,
	});

	//IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
	console.log(utter);
	// Placing the speak invocation inside a callback fixes ordering and onend issues
	next(() => {
		synth.resume();
	});

	this._startTimer();
}

/**
 * Cancel a reader.
 * @public
 * @memberOf {Reader}
 * @return {undefined}
 */
function cancel() {
	this._clearTimer();
	this._clearEvents();
	this.get('_synth').cancel();
	this.setProperties({
		_canceled: true,
		_playing: false,
		_paused: false,
	});
}

/**
 * Overrides the willDestroy method so we can clear the timer and events so we dont leak them into oblivion.
 * @public
 * @memberOf {Reader}
 * @return {undefined}
 */
function willDestroy() {
	this._super(...arguments);
	this._clearTimer();
	this._clearEvents();
}

/**
 * Clear the pause/resume timer.
 * @private
 * @memberOf {Reader}
 * @return {undefined}
 */
function _clearTimer() {
	cancelTimer(this.get('_pauseResumeTimer'));
}

/**
 * Remove all events from the SpeechSynthesisUtterance instance.
 * @private
 * @memberOf {Reader}
 * @return {undefined}
 */
function _clearEvents() {
	const utter = this.get('_utterance');
	utter.removeEventListener('start', this.get('onPlay'));
	utter.removeEventListener('resume', this.get('onPlay'));
	utter.removeEventListener('end', this.get('onEnd'));
	utter.removeEventListener('error', this.get('onError'));
}

/**
 * Start a timer that will pause/resume the speech synthesis so that it keeps reading long text due
 * to the chrome bug (see top of file).
 * @private
 * @memberOf {Reader}
 * @return {undefined}
 */
function _startTimer() {
	const synth = this.get('_synth'),
		utter = this.get('_utterance'),
		that = this;

	this.set('_pauseResumeTimer', later(function pauseResumeTimer() {
		that._clearTimer();
		synth.pause();

		//IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
		console.log(utter);
		// Placing the speak invocation inside a callback fixes ordering and onend issues
		next(() => {
			synth.resume();
		});

		that.set('_pauseResumeTimer', later(pauseResumeTimer, PAUSE_RESUME_TIMER));
	}, PAUSE_RESUME_TIMER));
}
