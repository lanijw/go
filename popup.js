const storageKey = 'shortLinkMapping';
const mappingLinks = document.getElementById('mapping-links');

const InputType = {
  SHORT: 'short',
  LONG: 'long'
};

chrome.storage.sync.get([storageKey]).then((result) => {
  const mapping = result[storageKey];
  mapping.forEach((m, i) => {
    mappingLinks.append(generateInput(m, i));
  });
});

const generateInput = ({short, long}, i) => {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('class', 'map-item-wrapper');

  const shortInput = document.createElement('input');
  shortInput.setAttribute('id', `short-input-${i}`);
  shortInput.setAttribute('placeholder', 'go/gh');
  shortInput.setAttribute('value', short);
  shortInput.addEventListener('input', e => inputChanged(e, i, InputType.SHORT));
  const longInput = document.createElement('input');
  longInput.setAttribute('id', `long-input-${i}`);
  longInput.setAttribute('placeholder', 'https://github.com');
  longInput.setAttribute('value', long);
  longInput.addEventListener('input', e => inputChanged(e, i, InputType.LONG));
  [shortInput, longInput].forEach(i => {
    i.setAttribute('type', 'text');
    wrapper.append(i);
  });

  return wrapper;
};

const inputChanged = ({currentTarget: {value: v}}, i, type) => {
  chrome.storage.sync.get([storageKey]).then(r => {
    const newMapping = [...r[storageKey]];
    newMapping[i] = {...newMapping[i], [type]: v};
    console.log(r[storageKey], newMapping);
    chrome.storage.sync.set({[storageKey]: newMapping}).then(() => {
      // TODO(laniw): Add notification.
    });
  });
};
