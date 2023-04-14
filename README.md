# go

This is a simple extension that lets you add a mapping from short links to normal online URLs. If the beginning of any text entered in the URL bar matches a short mapping it will be replaced by the full URL, leaving the trailing end intact.

f.e. `go/gl/mr/` could map to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/`. By entering `go/gl/mr/116433` the user gets taken to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/116433` instead.

## Installation

Because I'm too stingy to spend 5 bucks on registering as a Developer on the Chrome Webstore you will have to load this extension unpacked, but don't worry it's very easy.

1. Clone this repository wherever you'd like.
2. Follow the instructions on [Chrome Developers](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) to install (load) the extension.
3. That's it. You've already completed the process. Wasn't that easy?

## User Manual

Enter the short text in the left input and the long URL in the right input. A new empty mapping is added when any of the two fields in the empty mapping have text in them. A mapping without any text is automatically removed.

Changes are saved to chrome's synchronised storage on every key press.

## Basic Internal Workflow

This is a conceptual description of how the extension popup works. State is a synonym for sync storage here. on State doesn't just remove all inputs and reintroduce them to avoid excessive rerendering, which may cause lag.

```
onStart:
  get state,
  maybe write init state
  create input fields
  
onInputChange:
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

Mapping datastructure example

```json
{
  "map": [
    {
      "short": "go/gh",
      "long": "https://github.com",
      "id": 1
    },
    {
      "short": "",
      "long": "",
      "id": 2
    }
  ],
  "nextId": 3
}
```
