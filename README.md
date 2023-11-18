# go

This is a simple extension that lets you add a mapping from short links to normal online URLs. If the beginning of any text entered in the URL bar matches a short mapping it will be replaced by the full URL, leaving the trailing end intact.

f.e. `go/gl/mr/` could map to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/`. By entering `go/gl/mr/116433` the user gets taken to `https://gitlab.com/gitlab-org/gitlab/-/merge_requests/116433` instead.

## Installation

Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/go/mahkmjlcgkcpkdoonpgjgbbocgegfjhn).

## User Manual

To add a new mapping, click the extension icon. It's recommended to pin the extension. Enter the short text in the left field and the long URL in the right field. Empty fields are added automatically when necessary. A set of fields is removed when both fields are empty. Changes are saved automatically.

To use the configured mappings, place your cursor in the address bar, type 'go', press Tab and start typing. Matching results are suggested automatically.

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
