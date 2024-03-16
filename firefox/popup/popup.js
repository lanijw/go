import {InputType, mapKey, storageKey} from '../util/util.js';

const state = browser.storage.sync;

const nextIdKey = 'nextId';
const mappingsContainer = document.getElementById('mappings-container');
const exportAnchor = document.getElementById('export-anchor');

// on start
(() => {
  state.get([storageKey]).then(result => {
    const mapping = result[storageKey];
    if (mappingFormatCorrect(mapping)) {
      stateChanged(mapping);
    } else {
      state.set({[storageKey]: initState});
    }
  });
})();

// on input change
const inputChanged = ({currentTarget: t}) => {
  state.get([storageKey]).then(r => {
    const [type, idS] = t.id.split('-');
    const id = Number(idS);

    // Update current mapping.
    const currentMapping = r[storageKey]?.[mapKey]?.find(m => m.id === id);
    if (!currentMapping) {
      console.error('Could not find mapping for input!');
    }
    currentMapping[type] = t.value;

    let newMapping = {...r[storageKey], [mapKey]: [...r[storageKey][mapKey]]};

    // Add new empty mapping if necessary.
    if (!newMapping[mapKey].some(m => shortAndLongSafelyEmpty(m))) {
      newMapping[mapKey].push(emptyMappingFactory(newMapping[nextIdKey]++));
    }

    // Remove empty mappings if not last.
    if (currentMapping[InputType.SHORT] === '' &&
        currentMapping[InputType.LONG] === '') {
      newMapping[mapKey] = [
        ...newMapping[mapKey]
            .slice(0, -1)
            .filter(m => !shortAndLongSafelyEmpty(m)),
        newMapping[mapKey][newMapping[mapKey].length - 1]
      ];
    }

    state.set({[storageKey]: newMapping});
  });
};

// on state change
const stateChanged = mapping => {
  if (storageKey in mapping && 'newValue' in mapping[storageKey]) {
    // Sometimes it comes wrapped in an object and sometimes it comes in directly.
    mapping = mapping[storageKey]['newValue'];
  }
  const validIds = mapping[mapKey].map(m => m.id);

  updateExportFile(reduceForExport(mapping));
  updateExportFileName();

  mappingsContainer.childNodes.forEach(mappingItem => {
    const [_1, _2, idS] = mappingItem.id.split('-');
    const id = Number(idS);
    if (!validIds.includes(id)) {
      mappingsContainer.removeChild(mappingItem);
    }
  });

  mapping[mapKey].forEach(m => {
    if (document.getElementById(`map-item-${m.id}`) === null) {
      mappingsContainer.append(createMappingItem(m));
    }
  });
};
browser.storage.onChanged.addListener(stateChanged);

const updateExportFile = newValue => {
  exportAnchor.setAttribute('href',
                            'data:text/json;charset=utf-8,' +
                            encodeURIComponent(JSON.stringify(newValue)));
};
const updateExportFileName = () => {
  exportAnchor.setAttribute('download', downloadableFileName('', 'go-userdata', new Date()));
};


// --- UTIL ---
const shortAndLongSafelyEmpty = m => m?.short === '' && m?.long === '';

// export util
const downloadableFileName = (lead, sourceProgram, date) => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  [year, month, day, hours, minutes, seconds]
      = [year, month, day, hours, minutes, seconds].map(formatDatePart);
  const optionalSpacer = lead === '' ? '' : '_';
  return `${lead}${optionalSpacer}${sourceProgram}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;
};

const formatDatePart = num => {
  const numString = num.toString();
  return numString.length > 1 ? numString : '0' + numString;
};

/** Throws out nextId, id of entries and removes empty entries.
 * @param {map: [{id: number, short: string, long: string}], nextId: number} mapping
 * @returns {[{short: string, long: string}]}
 */
const reduceForExport = mapping => {
  return mapping[mapKey].map(({short, long}) => ({short, long}))
                        .filter(({short, long}) => '' !== short && '' !== long);
};

// startup util
const emptyMappingFactory = id => ({short: '', long: '', id});
const initState = {
  map: [emptyMappingFactory(1)],
  nextId: 2
};

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

// DOM element creation
const createMappingItem = ({short, long, id}) => {
  const shortInput = createInput(
      id,
      InputType.SHORT,
      short,
      'go/gh',
      inputChanged
  );
  const longInput = createInput(
      id,
      InputType.LONG,
      long,
      'https://github.com',
      inputChanged
  );

  const wrapper = document.createElement('div');
  wrapper.setAttribute('id', `map-item-${id}`);
  wrapper.setAttribute('class', 'mapping__item');
  wrapper.append(shortInput, longInput);
  return wrapper;
};

const createInput = (id, type, value, placeholder, inputEventListener) => {
  const i = document.createElement('input');
  i.setAttribute('id', `${type}-${id}-input`);
  i.setAttribute('class', `input input--size-xsmall`);
  i.setAttribute('type', 'text');
  i.setAttribute('value', value);
  i.setAttribute('placeholder', placeholder);
  i.setAttribute('data-form-type', 'other'); // disables dashlane
  i.addEventListener('input', inputEventListener);

  const flexWrapper = document.createElement('div');
  flexWrapper.setAttribute('class', `mapping__input-wrapper--length-${type}`);
  flexWrapper.append(i);
  return flexWrapper;
};
