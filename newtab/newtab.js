import {InputType, mapKey, storageKey} from '../util/util.js';

document.getElementById('shorthand-input').onkeydown = async e => {
  if (e.key === 'Enter') {
    const {[storageKey]: mapping} = await chrome.storage.sync.get([storageKey]);
    const shorthand = e.target.value;

    const matchingMapping = mapping[mapKey].find(m => shorthand.startsWith(m[InputType.SHORT]));
    let redirectUrl;
    if (!matchingMapping) {
      redirectUrl = shorthand;
    } else {
    redirectUrl = matchingMapping[InputType.LONG] + shorthand.slice(matchingMapping[InputType.SHORT].length);
    }
    chrome.tabs.update({url: redirectUrl});
  }
};
