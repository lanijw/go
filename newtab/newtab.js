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
        url: redirectUrl.endsWith('/') ? redirectUrl : redirectUrl + '/'
      });
    } else {
      setErrorText(`The shorthand "${shorthand}" doesn't match a value or the matching value is an empty string.`);
    }
  }
};

const setErrorText = (text) => {
  errorMsgContainer.innerText = text;
};
