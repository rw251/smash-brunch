// Validates that the client side routes and the server side routes are setup correctly
const ctrl = require('./controllers');

module.exports = (controllers) => {
  const sharedControllers = Object.keys(ctrl);
  const localControllers = Object.keys(controllers);
  if (sharedControllers.length !== localControllers.length) {
    throw new Error('The number of controllers in shared/controllers.js should be the same as in app/scripts/routes.js and server/routes/index.js');
  }
  sharedControllers.forEach((c) => {
    if (localControllers.indexOf(c) < 0) {
      throw new Error(`${c} occurs in shared/controllers.js but not in one of app/scripts/routes.js or server/routes/index.js`);
    }
  });
};
