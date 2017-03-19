import Ember from 'ember';
import Recorder from 'ember-speak/defaults/recorder';

const {
	assert,
	computed,
} = Ember;

/**
 * Default export.
 * @public
 * @example
 *		Inject it into your component, route, controller or whatever.
 *
 *		const speechRecognizer = this.get('speechRecgonizer');
 *		speechRecognizer.setLanugage('en-US');
 *		speechRecognizer.record().then(result => {
 *			// success!
 *			alert(result.transcript);
 *		}).catch(err => {
 *			console.log(err.msg);
 *		});
 */
export default Ember.Service.extend({
	_API: null,
	_lang: 'en-US',
	_recording: false,
	isAvailable: computed.bool('_API').readOnly(),
	isRecording: computed.bool('_recording').readOnly(),
	init,
	getRecorder,
	setLanguage,
	_getNewRecorder,
});

const ERROR_PREFIX = '[SpeechRecognizer] ';

/**
 * Initializer function. Basically just sets the API if available.
 * @public
 * @return {undefined}
 * @overrides
 */
function init() {
	this._super(...arguments);
	this.set('_API', window.SpeechRecognition || window.webkitSpeechRecognition);
}

function getRecorder() {
	const isAvailable = this.get('isAvailable');

	if (!isAvailable) {
		return Recorder.create();
	}

	const recognizer = this._getNewRecorder();
	const recorder = Recorder.create({
		_available: true,
		start: () => {
			recognizer.start();
		},
		stop: function() {
			recognizer.stop();
		},
	});

	recognizer.onresult = (event) => {
		let text = '';
		for (let i = event.resultIndex; i < event.results.length; i++) {
			if (event.results[i].isFinal) {
				text += event.results[i][0].transcript;
			}
		}

		recorder.trigger('transcribed', text);
		recorder.set('fullTranscript', recorder.get('fullTranscript') + text);
	};

	recognizer.onerror = event => {
		recognizer.stop();
		recorder.trigger('error', {
			msg: `${ERROR_PREFIX} ${event.error}`,
			event,
		});
	};

	recognizer.addEventListener('start', () => {
		recorder.set('_recording', true);
	});

	recognizer.addEventListener('end', () => {
		recorder.set('_recording', false);
	});

	return recorder;
}

/**
 * Set the desired language.
 * @public
 * @return {undefined}
 * @param {String} lang A valid BCP 47 language tag
 *		Note: If a falsy value is provided it will default to en-US
 */
function setLanguage(lang) {
	assert(lang, `${ERROR_PREFIX} Language must provide a valid language`);
	this.set('_lang', lang || 'en-US');
}

/**
 * Returns a new recorder object. This must only be called if its actually available. Otherwise, kabooom!
 * @private
 * @return {WebkitSpeechRecognition|SpeechRecognition}
 */
function _getNewRecorder() {
	const API = this.get('_API'),
		recorder = new API();

	recorder.interimResults = false;
	recorder.lang = this.get('_lang');
	recorder.continuous = true;

	return recorder;
}
