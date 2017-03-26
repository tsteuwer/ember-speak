# ember-speak

[![Build Status][build-status-img]][build-status-link]

Add speech-to-text (STT) and text-to-speech (TTS) to your Ember app.

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
<div {{action 'read' "This is your profile"}}>
  Profile
</div>
{{#if model.reader.isPlaying}}
  Playing... <button {{action "pause"}}>Pause</button>
{{else if model.reader.isPaused}}
  Paused... <button {{action "resume"}}>Resume</button>
{{/if}}
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
