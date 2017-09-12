const ctrl = require('./controllers');

module.exports = [
  { url: '/practice', type: 'get', needsAuth: true, controller: ctrl.home, method: 'index' },
  { url: '/practice/:id', type: 'get', needsAuth: true, controller: ctrl.home, method: 'index' },
  { url: '/practice/:id/:dateId', type: 'get', needsAuth: true, controller: ctrl.home, method: 'index' },
  { url: '/ccg', type: 'get', needsAuth: true, controller: ctrl.ccg, method: 'index' },
  { url: '/evidence', type: 'get', needsAuth: true, controller: ctrl.evidence, method: 'index' },
  { url: '/help', type: 'get', needsAuth: true, controller: ctrl.help, method: 'index' },

  { url: '/users', type: 'get', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'list' },
  { url: '/users/add', type: 'get', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'add' },
  { url: '/users/add', type: 'post', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'postAdd' },
  { url: '/users/:email/edit', type: 'get', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'edit' },
  { url: '/users/:email/edit', type: 'post', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'postEdit' },
  { url: '/users/:email/delete', type: 'get', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'delete' },
  { url: '/users/:email/delete', type: 'post', needsAuth: true, needsAdmin: true, controller: ctrl.user, method: 'postDelete' },

  { url: '/login', type: 'get', controller: ctrl.auth, method: 'login' },
  { url: '/login', type: 'post', controller: ctrl.auth, method: 'postLogin' },
  { url: '/forgot', type: 'get', controller: ctrl.auth, method: 'forgot' },
  { url: '/forgot', type: 'post', controller: ctrl.auth, method: 'postForgot' },
  { url: '/reset/:token', type: 'get', controller: ctrl.auth, method: 'reset' },
  { url: '/reset/:token', type: 'post', controller: ctrl.auth, method: 'postReset' },

  { url: '/password/change', type: 'get', needsAuth: true, controller: ctrl.auth, method: 'changePassword' },
  { url: '/password/change', type: 'post', needsAuth: true, controller: ctrl.auth, method: 'postChangePassword' },
];
