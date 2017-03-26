import Ember from 'ember';
import Reader from 'ember-speak/-privates/reader';

const {
	assert,
	computed,
} = Ember;

// Base reader object.

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

function getNewReader(text = '') {
	assert(text, `${ERROR_PREFIX} must be a valid string`);

	const isAvailable = this.get('isAvailable');

	if (!isAvailable) {
		return Ember.Object.create();
	}

	const utterance = this._getNewUtterance(text);
	const synth = this.get('_SynthAPI');

	const read = Reader.create({
		_synth: synth,
		_utterance: utterance,
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
