

exports.index = (req, res) => {
  console.log('on load script called...');
  res.send('<a href="/practice">Practice</a>');
  // global.selectedPracticeId = ctx.params.id || 0;
  // global.selectedDateId = ctx.params.dateId || false;

  // global.serverOrClientLoad()
  //   .onServer((ready) => {
  //     wireUpIndex();
  //     ready();
  //   })
  //   .onClient((ready) => {
  //     api.practices((err, practices) => {
  //       api.datesForDisplay((errDates, datesForDisplay) => {
  //         defaultController(homeTemplate, {
  //           practices,
  //           selectedId: ctx.params.id,
  //           dates: datesForDisplay,
  //           selectedDateId: ctx.params.dateId,
  //         });
  //         wireUpIndex();
  //         ready();
  //       });
  //     });
  //   });
};
