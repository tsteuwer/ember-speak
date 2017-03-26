import { module, test } from 'qunit';
import Reader from 'ember-speak/-privates/reader';
import Ember from 'ember';

const {
	run,
} = Ember;

let reader;

module('-privates/reader Unit | Reader', {
  // Specify the other units that are required for this test.
  beforeEach() {
		reader = Reader.create({
			init(){},
		});
	},
});

// Replace this with your real tests.
test('init sets bound functions `onPlay`, `onEnd`, and `onError`', function(assert) {
	assert.expect(3);

	reader = Reader.create({
		_utterance: {
			addEventListener(){}
		},
	});

	assert.ok(typeof reader.get('onPlay') === 'function', 'it should create the `onPlay` callback');
	assert.ok(typeof reader.get('onEnd') === 'function', 'it should create the `onEnd` callback');
	assert.ok(typeof reader.get('onError') === 'function', 'it should create the `onError` callback');
});

test('init adds event listeners to the SpeechSynthesisUtterance instance', function(assert) {
	assert.expect(8);

	const eventsAdded = {
		start: false,
		resume: false,
		end: false,
		error: false,
	};

	reader = Reader.create({
		_utterance: {
			addEventListener(type, callback) {
				eventsAdded[type] = true;
				assert.equal(typeof callback, 'function', 'it should have a callback');
			}
		},
	});

	assert.ok(eventsAdded.start, 'the `onstart` event was added');
	assert.ok(eventsAdded.resume, 'the `onresume` event was added');
	assert.ok(eventsAdded.end, 'the `onend` event was added');
	assert.ok(eventsAdded.error, 'the `onerror` event was added');
});

test('play should call resume if already played before', function(assert) {
	assert.expect(1);

	reader = Reader.create({
		init(){},
		_utterance: {},
		_synth: {
			speak: () => {
				assert.ok(false, 'this function should never be called');
			},
		},
		resume() {
			assert.ok(true, 'it should call resume instead of the `speechSynthesis`s `speak` method');
		}
	});
	
	reader.set('_didPlay', true);
	reader.play();
});

test('play should cancel any current `speechSynthesis` speeches, speak the new utterance, and start the timer', function(assert) {
	const done = assert.async();

	assert.expect(4);

	reader = Reader.create({
		init(){},
		_utterance: {
			text: 'testing',
		},
		_synth: {
			cancel () {
				assert.ok(true, 'cancel should be called');
			},
			speak(utter) {
				assert.deepEqual(utter, { text: 'testing' }, 'speak should be called with the same utterance');
			},
		},
		_startTimer() {
			assert.ok(true, 'start timer was called');
		}
	});

	reader.play();

	assert.ok(reader.get('_didPlay'), 'it should set the `didPlay` property to true');

	run.later(done, 10);
});

test('pause should clear the timer, pause the `speechSynthesis` and set the correct status properties', function(assert) {
	assert.expect(4);

	reader = Reader.create({
		init(){},
		_synth: {
			pause () {
				assert.ok(true, 'pause should be called');
			},
		},
		_clearTimer() {
			assert.ok(true, 'start timer was called');
		},
	});

	reader.pause();

	assert.ok(reader.get('_paused'), '`paused` status should be true');
	assert.notOk(reader.get('_playing'), '`playing` status should be false');
});

test('resume should not continue unless its `paused`', function(assert) {
	assert.expect(0);

	reader = Reader.create({
		init(){},
		_synth: {
			resume () {
				assert.ok(false, 'resume was called');
			},
		},
		_startTimer() {
			assert.ok(false, 'start timer was called');
		},
	});

	reader.set('_paused', false);
	reader.resume();
});

test('resume should resume the utterance if paused, and start the timer, and update the status properties', function(assert) {
	const done = assert.async();

	assert.expect(4);

	reader = Reader.create({
		init(){},
		_utterance: {
			text: 'testing',
		},
		_synth: {
			resume() {
				assert.ok(true, 'resume called');
			},
		},
		_startTimer() {
			assert.ok(true, 'start timer was called');
		}
	});

	reader.set('_paused', true);
	reader.resume();

	assert.notOk(reader.get('_paused'), 'it should set the `_paused` property to false');
	assert.ok(reader.get('_playing'), 'it should set the `_playing` property to true');

	run.later(done, 10);
});

test('cancel should clear the timer, events, cancel the `speechSynthesis` and set the propert status properties', function(assert) {
	assert.expect(6);

	reader = Reader.create({
		init(){},
		_synth: {
			cancel() {
				assert.ok(true, 'cancel called');
			},
		},
		_clearTimer() {
			assert.ok(true, 'clear timer was called');
		},
		_clearEvents() {
			assert.ok(true, 'clear events was called');
		}
	});

	reader.cancel();

	assert.notOk(reader.get('_paused'), 'it should set the `_paused` property to false');
	assert.notOk(reader.get('_playing'), 'it should set the `_playing` property to false');
	assert.ok(reader.get('_canceled'), 'it should set the `_canceled` property to true');
});

test('willDestroy should clear the timer and events', function(assert) {
	assert.expect(2);

	reader = Reader.create({
		init(){},
		_clearTimer() {
			assert.ok(true, 'clear timer called');
		},
		_clearEvents() {
			assert.ok(true, 'clear events called');
		},
	});

	reader.willDestroy();
});

test('_clearEvents removes event listeners on the SpeechSynthesisUtterance instance', function(assert) {
	assert.expect(8);

	const eventsRemoved = {
		start: false,
		resume: false,
		end: false,
		error: false,
	};

	reader = Reader.create({
		_utterance: {
			addEventListener(){},
			removeEventListener(type, callback) {
				eventsRemoved[type] = true;
				assert.equal(typeof callback, 'function', 'it should have the callback to be removed');
			}
		},
	});

	reader._clearEvents();
	assert.ok(eventsRemoved.start, 'the `onstart` event was removed');
	assert.ok(eventsRemoved.resume, 'the `onresume` event was removed');
	assert.ok(eventsRemoved.end, 'the `onend` event was removed');
	assert.ok(eventsRemoved.error, 'the `onerror` event was removed');
});

test('_startTimer should set a timer that pauses and resumes the `speechSynthesis` api every 10 seconds', function(assert) {
	const done = assert.async();

	assert.expect(3);

	reader = Reader.create({
		init(){},
		_utterance: {},
		_synth: {
			pause() {
				assert.ok(true, 'paused called');
			},
			resume() {
				assert.ok(true, 'resume called');
			}
		},
		_clearTimer() {
			assert.ok(true, 'clear timer called');
		}
	});

	reader._startTimer();

	run.later(() => {
		run.cancel(reader.get('_pauseResumeTimer'));
		done();
	}, 10500);
});
