import Ember from 'ember';
import Reader from 'ember-speak/-privates/reader';

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
 * @overrides
 * @memberOf {SpeechReader}
 * @return {undefined}
 */
function init() {
  this._super(...arguments);
	this.setProperties({
		_UtterAPI: window.SpeechSynthesisUtterance,
		_SynthAPI: window.speechSynthesis,
	});
}

/**
 * Returns a new reader instance.
 * @public
 * @memberOf {SpeechReader}
 * @return {Reader}
 */
function getNewReader(text = '') {
	assert(text, `${ERROR_PREFIX} must be a valid string`);

	if (!this.get('isAvailable')) {
		return Ember.Object.create();
	}

	return Reader.create({
		_synth: this.get('_SynthAPI'),
		_utterance: this._getNewUtterance(text),
	});
}

/**
 * Returns a new SpeechSynthesisUtterance instance with the desired text
 * @public
 * @memberOf {SpeechReader}
 * @return {SpeechSynthesisUtterance}
 */
function _getNewUtterance(text) {
	const Utterance = this.get('_UtterAPI');
	const utter = new Utterance(text);
	utter.lang = this.get('_lang');

	return utter;
}

/**
 * Set the desired language.
 * @public
 * @memberOf {SpeechReader}
 * @param {String} lang A valid BCP 47 language tag
 *    Note: If a falsy value is provided it will default to en-US
 * @return {undefined}
 */
function setLanguage(lang) {
  assert(lang, `${ERROR_PREFIX} Language must provide a valid language`);
  this.set('_lang', lang || 'en-US');
}
