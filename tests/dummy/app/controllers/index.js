import Ember from 'ember';

const {
	inject: {
		service,
	},
} = Ember;

export default Ember.Controller.extend({
	speechRecorder: service(),
	speechReader: service(),
	actions: {
		record,
		reset,
		stop,
		read,
		pause,
		resume,
	},
});

function record() {
	this.send('stop');
	this.send('reset');

	const model = this.get('model');
	const speechRecorder = this.get('speechRecorder');
	const recorder = speechRecorder.getRecorder();

	recorder.on('transcribed', (text) => {
		model.set('transcript', model.get('transcript') + text);
	});
	recorder.on('error', (err) => {
		model.set('error', err.msg);
	});

	recorder.start();

	model.set('recorder', recorder);
}

function reset() {
	this.get('model').setProperties({
		confidence: '',
		transcript: '',
		error: '',
	});
}

function stop() {
	const recorder = this.get('model.recorder');
	if (recorder) {
		recorder.stop();
	}
}

function read() {
	const currentReader = this.get('model.reader');
	if (currentReader) {
		console.log('destroying');
		currentReader.destroy();
	}

	const speechReader = this.get('speechReader');
	const reader = speechReader.getNewReader(this.get('model.textToRead'));
	
	this.set('model.reader', reader);
	reader.play();
}

function pause() {
	this.get('model.reader').pause();
}

function resume() {
	this.get('model.reader').resume();
}
