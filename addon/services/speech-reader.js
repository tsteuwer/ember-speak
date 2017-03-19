import Ember from 'ember';

const {
	assert,
	computed,
} = Ember;

export default Ember.Service.extend({
	isAvailable: computed.and('_UtterAPI', '_SynthAPI').readOnly(),
	_lang: 'en-US',
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

	function onPause() {
		read.setProperties({
			_paused: true,
			_playing: false,
		});
	}

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
	}

	function onError(event) {
		read.trigger('error', event);
	}

	utterance.addEventListener('pause', onPause);
	utterance.addEventListener('resume', onPlay);
	utterance.addEventListener('cancel', onEnd);
	utterance.addEventListener('end', onEnd);
	utterance.addEventListener('error', onError);
	utterance.addEventListener('start', onPlay);

	const read = Reader.create({
		play() {
			synth.cancel();
			synth.speak(utterance);	
		},
		pause() {
			synth.pause();
		},
		resume() {
			synth.resume();
		},
		cancel() {
			synth.cancel();
		},
		willDestroy() {
			utterance.removeEventListener('pause', onPause);
			utterance.removeEventListener('resume', onPlay);
			utterance.removeEventListener('cancel', onEnd);
			utterance.removeEventListener('end', onEnd);
			utterance.removeEventListener('error', onError);
			utterance.removeEventListener('start', onPlay);
		}
	});

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
