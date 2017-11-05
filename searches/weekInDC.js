const _ = require('lodash');
const moment = require('moment');
require('moment-holiday');

const {
  logResultCount,
  API_DATE_FORMAT,
} = require('./_utils');

const {
  baseQuery,
  oneAdult,
  
  notInsanePriced,
  weekendFlightsOnly,

  fromSF,
  toDC,
} = require('./_queryTemplates/index');

const {
  flightStartsAndEndsWithinHoursOnSameDay,
  flightStartsAfterTime,
  flightEndsAfterTime,
  flightStartsOnDays,

  getStartOfNextWeekend,
  getFridayBefore,
  getTwoMondaysFromDate,

  tripDaysLength,

  timeOnDate,
} = require('../viewModelsAndHelpers.js');

const today = moment('2018-01-01', 'YYYY-MM-DD');
const end = moment('2018-05-01', 'YYYY-MM-DD');

const dateFrom = getStartOfNextWeekend(today).format(API_DATE_FORMAT);
const dateTo = getFridayBefore(end).format(API_DATE_FORMAT);
const returnFrom = getStartOfNextWeekend(today).format(API_DATE_FORMAT);
const returnTo = getTwoMondaysFromDate(end).format(API_DATE_FORMAT);
const query = Object.assign({}, baseQuery, oneAdult, notInsanePriced, weekendFlightsOnly, fromSF, toDC, {
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
    const { there, price } = viewModel;
    const locationPenalty = 0;

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
      flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
        flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00'),
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
    return _.some([
      flightStartsOnDays(there, ['Friday']) && !flightStartsAfterTime(there,  `14:00`),
      flightStartsOnDays( back, ['Friday']) && !flightStartsAfterTime( back,  `14:00`),
      tripDaysLength(there, back) < 4,
      tripDaysLength(there, back) > 9,
    ]);
  })
  .sortBy('effectiveWeight.number')
  .value();

module.exports = {
  name: 'Week Remote in DC',
  query,
  filter,
};
