import {InputType, mapKey, storageKey} from '../util/util.js';

const errorMsgContainer = document.getElementById('error-msg-container');

document.getElementById('shorthand-input').onkeydown = async e => {
  if (e.key === 'Enter') {
    const {[storageKey]: mapping} = await chrome.storage.sync.get([storageKey]);
    const shorthand = e.target.value;

    const matchingMapping = mapping[mapKey].filter(m => m[InputType.SHORT] !==
        '').find(m => shorthand.startsWith(m[InputType.SHORT]));
    if (matchingMapping) {
      const redirectUrl = matchingMapping[InputType.LONG] +
          shorthand.slice(matchingMapping[InputType.SHORT].length);
      chrome.tabs.update({
        url: redirectUrl
      });
    } else {
      setErrorText(`The shorthand "${shorthand}" doesn't match a value or the matching value is an empty string.`);
    }
  }
};

Array.from(document.getElementsByClassName('umlaut__button'))
    .forEach(b => b.addEventListener('click', e =>
        navigator.clipboard.writeText(e.currentTarget.innerText)
    ));

const setErrorText = (text) => {
  errorMsgContainer.innerText = text;
};
