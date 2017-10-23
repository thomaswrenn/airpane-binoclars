const _ = require('lodash');
const moment = require('moment');

const {
  logResultCount,
  API_DATE_FORMAT,
} = require('./_utils');

const {
  baseQuery,
  oneAdult,
  notInsanePriced,
  fromSheffieldish,
  toCTIncludingNYCAndBoston,
} = require('./_queryTemplates/index');

const {
  flightStartsAndEndsWithinHoursOnSameDay,
  flightStartsAfterTime,
  flightEndsAfterTime,
  flightStartsOnDays,

  getStartOfNextWeekend,

  timeOnDate,
} = require('../viewModelsAndHelpers.js');

const easter = moment('2018', 'YYYY').holiday('Easter');
const dateFrom = getStartOfNextWeekend(moment()).format(API_DATE_FORMAT);//'17/11/2017',
const dateTo = moment().add(1, 'year').format(API_DATE_FORMAT); //'31/03/2018',
const returnFrom = getStartOfNextWeekend(moment()).format(API_DATE_FORMAT);//'24/11/2017',//'23/11/2017',
const returnTo = moment().add(1, 'year').format(API_DATE_FORMAT); //'09/04/2018',
const query = Object.assign({}, baseQuery, oneAdult, notInsanePriced, fromSheffieldish, toCTIncludingNYCAndBoston, {
  dateFrom,
  dateTo,
  returnFrom,
  returnTo,
});

const filter = resultsViewModel => _(resultsViewModel)
  .map((viewModel) => {
    const hours = _.get(viewModel, 'duration.total.seconds')/60/60;
    const dollarsPerHour = 70;
    const hourPenalty = (Math.max(0, hours - 11) * dollarsPerHour);
    const { there, back, price } = viewModel;
    const locationPenalty = (there.end.to !== 'BDL' ? 70 : 0) + (back.start.from !== 'BDL' ? 70 : 0);

    return Object.assign(viewModel, {
      effectiveWeight: {
        number: price + hourPenalty + locationPenalty,
        string: `$${price} (+ $${hourPenalty} + $${locationPenalty})`,
      },
    });
  })
  .filter(({ there, back }) => {
    // Must
    return _.every([
      // flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
      //   flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00'),
    ]);
  })
  .tap(logResultCount)
  .filter(({ there, back }) => {
    // Options
    return _.some([ true ]);
  })
  .tap(logResultCount)
  .reject(({ there, back }) => {
    // Must nots
    return _.some([]);
  })
  .sortBy('effectiveWeight.number')
  .value();

module.exports = {
  name: 'Tyler Christmas to Boston, NYC, Providence, CT',
  query,
  filter,
};
