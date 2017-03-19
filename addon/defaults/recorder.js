import Ember from 'ember';

const {
	computed,
} = Ember;

export default Ember.Object.extend(Ember.Evented, {
	fullTranscript: '',
	isAvailable: computed.bool('_available').readOnly(),
	isRecording: computed.bool('_recording').readOnly(),
	_available: false,
	_recording: false,
});
