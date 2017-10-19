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
  fromDC,
  toSF,
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
const query = Object.assign({}, baseQuery, oneAdult, notInsanePriced, fromDC, toSF, {
  dateFrom,
  dateTo,
  returnFrom,
  returnTo,

  // 'flyDays[]': '5',

  // selectedStopoverAirports: 'IAD,DCA,BWI',
  // selectedStopoverAirportsExclude: false,
});

const filter = resultsViewModel => _(resultsViewModel)
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
    return _.some([
      // (
        // flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
      //   flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00')
      // ),
      // (
      //   flightStartsOnDays(there, ['Friday']) && flightStartsAfterTime(there, '15:30')
      // ),
      // (
      //   flightStartsOnDays(back, ['Sunday']) && flightStartsAfterTime(there, '05:00')
      // ),
      // (
      //   flightStartsOnDays(back, ['Saturday']) && flightStartsAfterTime(there, '13:00')
      // ),
      // flightStartsOnDays(there, ['Friday', 'Saturday', 'Sunday']) && flightStartsAfterTime(there, '13:00'),
      // flightStartsOnDays(there, ['Wednesday', 'Saturday', 'Sunday']) //&&
        // flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
        // flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00')
      true
    ]);
  })
  .tap(logResultCount)
  .reject(({ there, back }) => {
    // Must nots
    return _.some([
      // ['EWR', 'LGA', 'JFK'].includes(there.end.to) && flightEndsAfterTime(there, `${24-5}:00`),
      // ['EWR', 'LGA', 'JFK'].includes(back.start.from) && !flightStartsAfterTime(back, `${5+5}:00`),
    ]);
  })
  .sortBy('effectiveWeight.number')
  .value();

module.exports = {
  name: 'Amanda (Next weekend till a year from now) (Flights start and end within 05:00-24:00)',
  query,
  filter,
};
