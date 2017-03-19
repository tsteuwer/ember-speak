import Ember from 'ember';

const {
	inject: {
		service,
	},
} = Ember;

export default Ember.Route.extend({
	speechRecorder: service(),
	speechReader: service(),
	model() {
		const speechRecorder = this.get('speechRecorder');
		const speechReader = this.get('speechReader');
		speechRecorder.setLanguage('en-US');
		speechReader.setLanguage('en-US');
		
		return Ember.Object.create({
			isAvailable: speechRecorder.get('isAvailable'),
			readerAvailable: speechReader.get('isAvailable'),
		});
	},
	setupController(controller, model) {
		controller.setProperties({model});
	},
});
