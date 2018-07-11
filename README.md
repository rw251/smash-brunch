# empty

# Adding a new route

- Add the route to shared/routes.js
- If you need a new controller add it to the lookup in shared/controllers.js
- Also add new controller to app/scripts/routes.js and server/routes/index.js
- Also then add a client side (app/controllers/<new controller name here>.js) and server side controller (server/controllers/<new controller name here>.js)
- Server side controller gets data needed for render and then renders
- Client side controller makes use of the global.serverOrClientLoad() to determine how the page was loaded and do different things accordingly (e.g. if client side, will need to get data and inject into template then wire up, if server side probably just need to wire up)

# Current todo list

## single practice

- show on top (if still needed?)
- percentage rounding in average chart
- wire up comparison date
- don't show all dates in comparison date drop down
- wire up export
- check export maintains current table order
- restrict to allowed practices
- in patient list update breadcrumb so is not "Practice X"
- add note func
- trend chart

## all practices

- show on top (if still needed?)
- wire up comparison date
- don't show all dates in comparison date drop down
- wire up export
- check export maintains current table order

## admin page


## users

- user list edit/delete has #{user.email} until you click it

## auth

## bugs

- go to all practices page / back button no longer works (seems ok for single practice)
- why do i have to cast dates e.g. TODO DATE in api.js
- sort out service worker - determine optimal strategy

## mobile issues

- datatables header doesn't scroll (horizontally) but body does - known limitation of fixedheader and scroll / consider reducing number of columns in mobile view