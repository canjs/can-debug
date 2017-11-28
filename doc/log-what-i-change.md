@function can-debug.logWhatIChange logWhatIChange
@parent can-debug

@description Log what a observable changes.

@signature `debug.logWhatIChange(observable, [key])`

  Logs what the observable changes.  If a `key` is provided,
  logs what that key changes.

  ```js
  EXAPLE!
  ```

  Logs

  <pre>
  MUTATE enqueuing: onInfoChanged &#x25B6; { ... }
  MUTATE running  : onInfoChanged &#x25B6; { ... }
  </pre>

  @param {Object} observable An observable.
  @param {Any} [key] A key value.
