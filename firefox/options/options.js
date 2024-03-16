import {InputType, mapKey, storageKey} from '../util/util.js';

const state = chrome.storage.sync;
const importInput = document.getElementById('import-input');

importInput.addEventListener('change', _ => {
  const [file] = importInput.files;
  importFile(file);
});

// import util

const importFile = file => {
  if (!file) {
    return;
  }

  let fileContent = '';
  const reader = new FileReader();
  reader.addEventListener(
      'load',
      () => {
        fileContent = reader.result;
        const importedUserData = JSON.parse(fileContent);
        addNewEntries(importedUserData);
      },
      false
  );
  reader.readAsText(file);
};

const addNewEntries = newMappings => {
  state.get([storageKey]).then(r => {
    const currentReduced = reduceForExport(r[storageKey]);
    const newMapping = [...currentReduced, ...newMappings, {short: '', long: ''}].map((element, i) => ({...element, id: i + 1}));
    const res = {
      map: newMapping,
      nextId: newMapping.length + 1
    };
    state.set({[storageKey]: res});
  });
};

// export util

/** Throws out nextId, id of entries and removes empty entries.
 * @param {map: [{id: number, short: string, long: string}], nextId: number} mapping
 * @returns {[{short: string, long: string}]}
 */
const reduceForExport = mapping => {
  return mapping[mapKey].map(({short, long}) => ({short, long}))
                        .filter(({short, long}) => '' !== short && '' !== long);
};
