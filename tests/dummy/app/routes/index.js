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
			githubLink: 'https://github.com/tsteuwer/ember-speak',
			travisBadge: 'https://travis-ci.org/tsteuwer/ember-speak.svg?branch=master',
			travisLink: 'https://travis-ci.org/tsteuwer/ember-speak',
			npmBadge: 'https://badge.fury.io/js/ember-speak.svg',
			npmLink: 'http://badge.fury.io/js/ember-speak',
			isAvailable: speechRecorder.get('isAvailable'),
			readerAvailable: speechReader.get('isAvailable'),
		});
	},
	setupController(controller, model) {
		controller.setProperties({model});
	},
});
