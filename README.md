# go

This is a simple extension that lets you add a mapping from short links to normal online URLs. If the beginning of any text entered in the URL bar matches a short mapping it will be replaced by the full URL, leaving the trailing end intact.

f.e. `go/gl/mr/` could map to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/`. By entering `go/gl/mr/116433` the user gets taken to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/116433` instead.

## User Manual

Enter the short text in the left input and the long URL in the right input. A new empty mapping is added when any of the two fields in the empty mapping have text in them. A mapping without any text is automatically removed.

Changes are saved to chrome's synchronised storage on every key press.

## Basic Internal Workflow

This is a conceptual description of how the extension popup works. State is a synonym for sync storage here. on State doesn't just remove all inputs and reintroduce them to avoid excessive rerendering, which may cause lag.

```
onStart:
  get state,
  maybe write init state
  
onInput:
  get state
  update state with new input value
  if no empty mapping left:
    add new mapping to state
  if empty which is not last exists:
    remove mapping for said input
  write new state
  
onStateChange:
  get current inputs
  maybe remove inputs with no matching mapping object
  maybe add new empty input
```
