import Ember from 'ember';

export default Ember.Route.extend({
	speechRecorder: Ember.inject.service(),
	model() {
		const speechRecorder = this.get('speechRecorder');
		speechRecorder.setLanguage('en-US');
		
		return Ember.Object.create({
			isAvailable: speechRecorder.get('isAvailable'),
		});
	},
	setupController(controller, model) {
		controller.setProperties({model});
	},
});
