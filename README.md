# empty

# Adding a new route

- Add the route to shared/routes.js
- If you need a new controller add it to the lookup in shared/controllers.js
- Also add new controller to app/scripts/routes.js and server/routes/index.js
- Also then add a client side (app/controllers/<new controller name here>.js) and server side controller (server/controllers/<new controller name here>.js)
- Server side controller gets data needed for render and then renders
- Client side controller makes use of the global.serverOrClientLoad() to determine how the page was loaded and do different things accordingly (e.g. if client side, will need to get data and inject into template then wire up, if server side probably just need to wire up)