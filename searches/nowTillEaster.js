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
  fromSF,
  toDCOrCTIncludingNYCAndBoston,
} = require('./_queryTemplates/index');

const {
  flightStartsAndEndsWithinHoursOnSameDay,
  flightStartsAfterTime,
  flightEndsAfterTime,
  flightStartsOnDays,

  getStartOfNextWeekend,
  getFridayBefore,
  getTwoMondaysFromDate,

  timeOnDate,
} = require('../viewModelsAndHelpers.js');

const easter = moment('2018', 'YYYY').holiday('Easter');
const dateFrom = getStartOfNextWeekend(moment()).format(API_DATE_FORMAT);//'17/11/2017',
const dateTo = getFridayBefore(easter).format(API_DATE_FORMAT); //'31/03/2018',
const returnFrom = getStartOfNextWeekend(moment()).format(API_DATE_FORMAT);//'24/11/2017',//'23/11/2017',
const returnTo = getTwoMondaysFromDate(easter).format(API_DATE_FORMAT); //'09/04/2018',
const query = Object.assign({}, baseQuery, oneAdult, notInsanePriced, fromSF, toDCOrCTIncludingNYCAndBoston, {
  dateFrom,
  dateTo,
  returnFrom,
  returnTo,
});

const filter = resultsViewModel => _(resultsViewModel)
  .filter(({ there, back }) => {
    // Must
    return _.every([
      flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
        flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00'),
      (timeOnDate(back.start.time, '2017-11-24') && flightStartsAfterTime(back, `${13+4}:00`)) ||
        !timeOnDate(back.start.time, '2017-11-24')
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
      ['EWR', 'LGA', 'JFK'].includes(there.end.to) && flightEndsAfterTime(there, `${24-5}:00`),
      ['EWR', 'LGA', 'JFK'].includes(back.start.from) && !flightStartsAfterTime(back, `${5+5}:00`),
      timeOnDate(there.end.time, '2017-11-23') && flightEndsAfterTime(there, `0${11-4}:00`),
      timeOnDate(back.end.time, '2017-11-27') && flightEndsAfterTime(back, `${13-2}:30`),
      timeOnDate(there.start.time, '2017-11-23') && timeOnDate(there.end.time, '2017-11-24'),
    ]);
  })
  .sortBy('effectiveWeight.number')
  .value();

module.exports = {
  name: 'Next weekend till Easter',
  query,
  filter,
};
