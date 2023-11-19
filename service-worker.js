const storageKey = 'shortLinkMapping';
const mapKey = 'map';

const state = chrome.storage.sync;

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  state.get([storageKey]).then(result => {
    const mapping = result[storageKey][mapKey];
    if (mappingFormatCorrect(result[storageKey])) {
      const [firstUrl, ...otherUrls] = getMatchingSuggestions(text, mapping);
      chrome.omnibox.setDefaultSuggestion({description: firstUrl.description});
      suggest(otherUrls);
    } else {
      chrome.omnibox.setDefaultSuggestion(outdatedLinkSuggestion);
    }
  });
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  state.get([storageKey]).then(result => {
    const mapping = result[storageKey][mapKey];
    if (mappingFormatCorrect(result[storageKey])) {
      const [firstUrl] = getMatchingSuggestions(text, mapping);
      switch (disposition) {
        case 'currentTab':
          chrome.tabs.update({url: firstUrl.description});
          break;
        case 'newForegroundTab':
          chrome.tabs.create({url: firstUrl.description});
          break;
        case 'newBackgroundTab':
          chrome.tabs.create({url: firstUrl.description, active: false});
          break;
        default:
          // All cases exhausted.
      }
    }
  });
});

// --- util ---

const outdatedLinkSuggestion = {description: 'It seems that you have an outdated version of your links. Please click on the icon of the extension. This will automatically resolve the issue.'};

const createSuggestion = (content, description) => {
  return {content, description, deletable: false};
};

const matchToSuggestion = (text, short, long) => {
  const connectionText = "will send you to";
  if (text.length < short.length) {
    const desc = `<match>${text}</match>${short.slice(text.length)} <dim>${connectionText}</dim> <url>${long}</url>`;
    return createSuggestion(short, desc);
  } else {
    const desc = `<match>${short}</match>${text.slice(short.length)} <dim>${connectionText}</dim> <url>${long}</url>${text.slice(short.length)}`;
    return createSuggestion(short, desc);
  }
};

const getMatchingSuggestions = (text, mapping) => {
  const beginningsOverlapNonEmpty = (short, text) => short.startsWith(text)
                                                     || text.startsWith(short)
                                                     && '' !== short
                                                     && '' !== text;
  const res = mapping.filter(({short}) => beginningsOverlapNonEmpty(short, text))
                .sort(({short: shortA}, {short: shortB}) => {
                  // Swap if first element is longer and first element is substring of text.
                  // This means that if two possible matches start the same and one option is a
                  // substring of text and text is a substring of the other, the first item will
                  // take precedence. Once both options are substrings of text, the option that is
                  // longer takes precedence.
                  return shortA.length > shortB.length && text.length > shortA.length ? -1 : 0;
                })
                .map(({short, long}) => matchToSuggestion(text, short, long));
  console.log(res);
  return res;
};


// --- foreign util ---
// Simply copies from popup/popup.js, because ES6 imports are not possible in service-worker.

const mappingFormatCorrect = mapping => {
  if (!(mapping?.nextId && mapping?.[mapKey])) {
    return false;
  }

  const lastMappingEmpty = ms => shortAndLongSafelyEmpty(ms[ms.length - 1]);
  const oneMappingEmpty = ms => ms.filter(shortAndLongSafelyEmpty).length === 1;
  return Array.isArray(mapping[mapKey]) &&
         oneMappingEmpty(mapping[mapKey]) &&
         lastMappingEmpty(mapping[mapKey]);
};

const shortAndLongSafelyEmpty = m => m?.short === '' && m?.long === '';
