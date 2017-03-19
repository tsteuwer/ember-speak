import Ember from 'ember';

export default Ember.Route.extend({
	speechRecognizer: Ember.inject.service(),
	model() {
		const speechRecognizer = this.get('speechRecognizer');
		speechRecognizer.setLanguage('en-US');
		
		return Ember.Object.create({
			isAvailable: speechRecognizer.get('isAvailable'),
		});
	},
	setupController(controller, model) {
		controller.setProperties({model});
	},
});
