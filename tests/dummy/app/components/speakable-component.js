import Ember from 'ember';
import layout from '../templates/components/speakable-component';

export default Ember.Component.extend({
	reader: null,
	classNames: ['well', 'well-sm'],
	speechReader: Ember.inject.service(),
	readingAvailable: Ember.computed.alias('speechReader.isAvailable'),
  layout,
	actions: {
		togglePlaying,
	}
});

function togglePlaying() {
	const reader = this.get('reader');
	if (reader) {
		reader.cancel();
		reader.destroy();
		this.set('reader', null);
	} else {
		const speechReader = this.get('speechReader');
		const newReader = speechReader.getNewReader(this.$().text().trim());
		this.set('reader', newReader);
		newReader.play();
	}
}
// END-SNIPPET
