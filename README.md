# ember-speak

[![Build Status][build-status-img]][build-status-link]
[![NPM][npm-badge-img]][npm-badge-link]
[![Ember Observer Score][ember-observer-badge]][ember-observer-url]

Add speech-to-text (STT) and text-to-speech (TTS) to your Ember app.

## Browser Support

[Can I Use?](http://caniuse.com/#feat=speech-synthesis)

Most browsers have pretty decent support for the [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) API. However, there are some things to note in regards to Chrome -- specifically in regards to [this](https://bugs.chromium.org/p/chromium/issues/detail?id=369472) and [this](https://bugs.chromium.org/p/chromium/issues/detail?id=335907).

**TLDR**
Chrome has a bug where speech would stop reading after about 15 seconds or 200-300 characters. I found a way around this by periodically pausing and resuming the ``speechSynthesis`` instance. This makes it read 100% of the text.

However, I also found another bug in Chrome which stops all sound from occuring if you pause the utterance for more than 15 seconds. It basically stops reading aloud the text when you resume. This is also filed in those same tickets above. If you do end up using this addon, you may (eek) want to prevent pausing for Chrome users.

You can also use the ``isAvailable`` computed properties in both ``SpeechRecorder`` and ``SpeechReader`` services.

```
export default Ember.Controller.extend({
  speechReader: Ember.inject.service(),
  speechRecorder: Ember.inject.service(),
  [...]
  init() {
    this._super(...arguments);
    this.get('model').setProperties({
      readingAvailable: this.get('speechReader.isAvailable'),
      recordingAvailable: this.get('speechRecorder.isAvailable'),
    });
});
```

## Text-To-Speech (TTS)

Allow the browser to read text to your users using the [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) and [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance) APIs.


## Example

### Controller

```
export default Ember.Controller.extend({
  speechReader: Ember.inject.service(),
  // [...]
  actions: {
    read(text) {
      const currentReader = this.get('model.reader');
      const speechReader = this.get('speechReader');

      // Always destroy the old reader if used. It will remove events attached to the old utterance since it will be removed from the speechSyntehsis queue
      if (currentReader) currentReader.destroy(); 

      const reader = speechReader.getNewReader(text);
      this.set('model.reader', reader);

      reader.play();
    },
    pause() {
      this.get('model.reader').pause();
    },
    resume() {
      this.get('model.reader').resume();
    },
  }
});
```

### Template
```
<button {{action 'read' "This is your profile"}}>
  Read Profile
</button>
{{#if model.reader.isPlaying}}
  Playing... <button {{action "pause"}}>Pause</button>
{{else if model.reader.isPaused}}
  Paused... <button {{action "resume"}}>Resume</button>
{{/if}}
```

## Speech-To-Text (STT)

Allow the browser transcribe what your users are saying via the [SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) API.

## Example

### Controller

```
export default Ember.Controller.extend({
  speechRecorder: Ember.inject.service(),
  // [...]
  actions: {  
    reset() {
      this.get('model').setProperties({
        transcript: '',
        error: '',
      });
    },
    stop() {
      const recorder = this.get('model.recorder');
      if (recorder) {
        recorder.stop();
      }
    },
    record() {
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
    },
  }
});

```

### Template
```
<button {{action 'record'}}>
  Start Recording
</button>
{{#if model.recorder.isRecording}}
  Recording... <button {{action "stop"}}>Stop</button>
{{/if}}

<hr />
What you've said: {{model.transcript}}
```

## Addon Maintenance

### Installation

* `git clone <repository-url>` this repository
* `cd ember-speak`
* `npm install`
* `bower install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

[build-status-img]: https://travis-ci.org/tsteuwer/ember-speak.svg?branch=master
[build-status-link]: https://travis-ci.org/tsteuwer/ember-speak
[npm-badge-img]: https://badge.fury.io/js/ember-speak.svg
[npm-badge-link]: http://badge.fury.io/js/ember-speak
[ember-observer-badge]: http://emberobserver.com/badges/ember-speak.svg
[ember-observer-url]: http://emberobserver.com/addons/ember-speak
