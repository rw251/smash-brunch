const $ = require('jquery');

let server = false;
let shouldShowLoading = false;
let isGlobalLoadingIndicator = true;

const hideLoading = () => {
  shouldShowLoading = false;
  $('.loading-shade').fadeOut();
  $('.inline-loading-shade').fadeOut();
};

module.exports = {
  isLoggedIn: false,
  user: false,
  selectedPracticeId: 0,
  selectedIndicatorId: 0,
  selectedDateId: 0,

  serverLoad: () => {
    server = true;
  },

  clientLoad: () => {
    server = false;
  },

  setIsGlobal: (val) => {
    isGlobalLoadingIndicator = val;
  },

  setShowLoading: (val) => {
    shouldShowLoading = val;
  },

  getShowLoading: () => shouldShowLoading,

  getLoadingElement: () => (isGlobalLoadingIndicator ? $('.loading-shade') : $('.inline-loading-shade')),

  serverOrClientLoad: () => {
    const loadObject = {
      onServer: () => loadObject,
      onClient: () => loadObject,
      always: (callback) => {
        console.log('always');
        if (callback && typeof callback === 'function') callback();
        return loadObject;
      },
    };

    if (server) {
      loadObject.onServer = (callback) => {
        console.log('server load');
        if (callback && typeof callback === 'function') {
          callback(() => hideLoading());
        } else {
          hideLoading();
        }

        return loadObject;
      };
    } else {
      loadObject.onClient = (callback) => {
        console.log('client load');
        if (callback && typeof callback === 'function') {
          callback(() => hideLoading());
        } else {
          hideLoading();
        }
        return loadObject;
      };
    }

    server = false;

    return loadObject;
  },
};
