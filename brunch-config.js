const path = require('path');

module.exports = {
  // See http://brunch.io for documentation.
  paths: {
    public: 'dist',
    watched: ['app', 'vendor', 'shared'],
  },

  files: {
    javascripts: {
      joinTo: {
        'js/libraries.js': /^(?!app\/)/,
        'js/app.js': /^app\//,
      },
      order: {
        before: [/jquery/],
      },
    },
    stylesheets: {
      joinTo: 'css/app.css',
      order: {
        before: [
          'vendor/styles/bootstrap.scss',
          'vendor/styles/variables.scss',
          'vendor/styles/bootstrap-select.scss',
        ],
      },
    },
    templates: {
      joinTo: 'js/app.js',
    },
  },

  plugins: {
    babel: {
      // pattern: /sw\.js$/,
    },
    sass: {
      options: {
        includePaths: ['app/styles'],
      },
    },
    pug: {
      globals: ['App'],
      inlineRuntimeFunctions: true,
    },
    uglify: {
      compress: {
        global_defs: {
          DEBUG: false,
        },
      },
    },
  },
};
