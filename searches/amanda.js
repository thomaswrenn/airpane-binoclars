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
  name: 'Amanda (Next weekend till a year from now) (Flights start and end within 05:00-24:00)',
  query,
  filter,
};
