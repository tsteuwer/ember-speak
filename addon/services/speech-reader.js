import Ember from 'ember';

const {
	assert,
	computed,
} = Ember;

export default Ember.Service.extend({
	isAvailable: computed.and('_UtterAPI', '_SynthAPI').readOnly(),
	_lang: 'en-US',
	_lastReader: null,
	init,
	getNewReader,
	setLanguage,
	_getNewUtterance,
});

const ERROR_PREFIX = '[SpeechReader] ';

/**
 * Initializer function. Basically just sets the API if available.
 * @public
 * @return {undefined}
 * @overrides
 */
function init() {
  this._super(...arguments);
	this.setProperties({
		_UtterAPI: window.SpeechSynthesisUtterance,
		_SynthAPI: window.speechSynthesis,
	});
}

function getNewReader(text) {
	assert(text, `${ERROR_PREFIX} must be a valid string`);
	const isAvailable = this.get('isAvailable');

	if (!isAvailable) {
		return Ember.Object.create();
	}

	const utterance = this._getNewUtterance(text);
	const synth = this.get('_SynthAPI');
	const Reader = Ember.Object.extend(Ember.Evented, {
		isPaused: computed.bool('_paused').readOnly(),
		isPlaying: computed.bool('_playing').readOnly(),
		_paused: false,
		_playing: false,
	});
	let pauseResumeTimer;

	function onPlay() {
		read.setProperties({
			_paused: false,
			_playing: true,
		});

	}

	function onEnd() {
		read.setProperties({
			_paused: false,
			_playing: false,
		});

		clearTimeout(pauseResumeTimer);
		utterance.removeEventListener('start', onPlay);
		utterance.removeEventListener('resume', onPlay);
		utterance.removeEventListener('end', onEnd);
		utterance.removeEventListener('error', onError);
	}

	function onError(event) {
		read.trigger('error', event);
	}

	utterance.addEventListener('start', onPlay);
	utterance.addEventListener('resume', onPlay);
	utterance.addEventListener('end', onEnd);
	utterance.addEventListener('error', onError);

	const read = Reader.create({
		play() {
			clearTimeout(pauseResumeTimer);
			const lastReader = this.get('_lastReader');
			if (lastReader) {
				lastReader.destroy();
			}

			synth.cancel();
			synth.speak(utterance);
			console.log(utterance); // IMPORTANT!!! This must be here as it helps with the events firing. I dont know why, but chrome needs this.

			pauseResumeTimer = setTimeout(function startTimerAgain() {
				clearTimeout(pauseResumeTimer);
				synth.pause();
				synth.resume();
				pauseResumeTimer = setTimeout(startTimerAgain, 10000);
			}, 10000);
		},
		pause() {
			clearTimeout(pauseResumeTimer);
			synth.pause();
			read.setProperties({
				_paused: true,
				_playing: false,
			});
		},
		resume() {
			clearTimeout(pauseResumeTimer);
			synth.resume();
			console.log(utterance); // IMPORTANT!!! This must be here as it helps with the events firing. I dont know why, but chrome needs this.

			pauseResumeTimer = setTimeout(function startTimerAgainResume() {
				clearTimeout(pauseResumeTimer);
				synth.pause();
				synth.resume();
				pauseResumeTimer = setTimeout(startTimerAgainResume, 10000);
			}, 10000);
		},
		cancel() {
			clearTimeout(pauseResumeTimer);
			synth.cancel();
		},
		willDestroy() {
			clearTimeout(pauseResumeTimer);
			utterance.removeEventListener('start', onPlay);
			utterance.removeEventListener('resume', onPlay);
			utterance.removeEventListener('end', onEnd);
			utterance.removeEventListener('error', onError);
		}
	});
	
	this.set('_lastReader', read);

	return read;
}

function _getNewUtterance(text) {
	const Utterance = this.get('_UtterAPI');
	const utter = new Utterance(text);
	utter.lang = this.get('_lang');

	return utter;
}

/**
 * Set the desired language.
 * @public
 * @return {undefined}
 * @param {String} lang A valid BCP 47 language tag
 *    Note: If a falsy value is provided it will default to en-US
 */
function setLanguage(lang) {
  assert(lang, `${ERROR_PREFIX} Language must provide a valid language`);
  this.set('_lang', lang || 'en-US');
}
