const moment = require('moment');
const _ = require('lodash');
const requestPromise = require('request-promise-native');
const qs = require('querystring');

import express from 'express';
import exphbs from 'express-handlebars';

const {
  searchResultViewmodel,

  flightStartsAfterTime,
  flightEndsAfterTime,
  flightStartsAndEndsWithinHoursOnSameDay,
  flightStartsOnDays,
  timeOnDate,
} = require('./view-models-and-helpers.js');

const queryParams = {
  typeFlight: 'round',
  // flyDaysType: 'departure',
  // returnFlyDaysType: 'arrival',

  flyFrom: [
    'SFO',
    'OAK',
    'SJC',
  ].join(','),
  to: [
    'BDL',
    'HVN',

    // 'BWI',
    // 'DCA',
    // 'IAD',

    'EWR',
    'JFK',
    'LGA',

    'PHL',

    'ABE',
    'ACY',
    'ALB',
    'AOO',
    'AVP',
    'BGM',
    'ELM',
    'HGR',
    'HPN',
    'IPT',
    'ISP',
    'ITH',
    'LNS',
    'MDT',
    'MMU',
    'PVD',
    'SBY',
    'SCE',
    'SWF',
    'TTN'
    //'BDL,BWI,DCA,EWR,HVN,IAD,JFK,LGA,PHL,BOS',//'40.22--74.74-325km',//'40.79--74.27-325km',//https://www.mapdevelopers.com/draw-circle-tool.php
  ].join(','),
  dateFrom: '17/11/2017',
  dateTo: '23/11/2017',
  returnFrom: '24/11/2017',//'23/11/2017',
  returnTo: '27/11/2017',

  // 'flyDays[]': '5',
  // flyDaysType: 'departure',

  // selectedStopoverAirports: 'IAD,DCA,BWI',
  // selectedStopoverAirportsExclude: false,

  passengers: 1,
  adults: 1,
  children: 0,
  infants: 0,

  price_from: 0,
  price_to: 1100,

  curr: 'USD',
  locale: 'en',
  innerLimit: 300,
  limit: 200,
  sort: 'quality',
};

const getResults = (uriGenerator, resultsSoFar = []) => {
  return requestPromise(uriGenerator())
    .then(rawResponse => {
      return JSON.parse(rawResponse);
    })
    .then(response => {
      resultsSoFar = resultsSoFar.concat(response.data);
      console.log(resultsSoFar.length + ' results so far of ' + response._results);
      if (response._next) {
        return getResults(uriGenerator, resultsSoFar);
      }
      return resultsSoFar;
    });
}

const makeUrlWithOffset = offset => {
  const queryString = qs.stringify(Object.assign({ offset }, queryParams));
  return `https://api.skypicker.com/flights?${queryString}`;
};

const offsetUrlGenerator = () => {
  let offset = 0;
  return () => {
    const returnUrl = makeUrlWithOffset(offset);
    offset += 200;
    return returnUrl;
  }
};

const resultsPromise = new Promise((resolve, reject) => {
  const uriGenerator = offsetUrlGenerator();
  resolve(
    getResults(uriGenerator)
  );
});

var app = express();

app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  layoutsDir: 'views/layouts'
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));

app.get('/', function (request, response) {
//   const queryParams = {
//     typeFlight: 'round',
//     flyDaysType: 'departure',
//     returnFlyDaysType: 'arrival',

//     flyFrom: '37.8--122.27-74km',
//     to: '40.79--74.27-325km',
//     dateFrom: '17/11/2017',
//     dateTo: '23/11/2017',
//     returnFrom: '23/11/2017',
//     returnTo: '27/11/2017',

//     passengers: 1,
//     adults: 1,
//     children: 0,
//     infants: 0,

//     price_from: 0,
//     price_to: 1100,

//     curr: 'USD',
//     locale: 'en',
//     innerLimit: 300,
//     sort: 'quality',
//   };
  return resultsPromise
    .then(results => {
      const searchResults = _(results)
        .map(searchResultViewmodel)
        .filter(({ there, back }) => {
          const musts = [
            flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
              flightStartsAndEndsWithinHoursOnSameDay(back, '05:00', '24:00'),
            (timeOnDate(back.start.time, '2017-11-24') && flightStartsAfterTime(back, `${13+4}:00`)) || 
              !timeOnDate(back.start.time, '2017-11-24')
          ];
          const options = [
            // (
            //   flightStartsAndEndsWithinHoursOnSameDay(there, '05:00', '24:00') &&
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
          ];
          const mustnots = [
            ['EWR', 'LGA', 'JFK'].includes(there.end.to) && flightEndsAfterTime(there, `${24-5}:00`),
            ['EWR', 'LGA', 'JFK'].includes(back.start.from) && !flightStartsAfterTime(back, `${5+5}:00`),
            timeOnDate(there.end.time, '2017-11-23') && flightEndsAfterTime(there, `0${11-4}:00`),
            timeOnDate(back.end.time, '2017-11-27') && flightEndsAfterTime(back, `${13-2}:30`),
            timeOnDate(there.start.time, '2017-11-23') && timeOnDate(there.end.time, '2017-11-24'),
          ];
          return (_.every(musts) && _.some(options) && !_.some(mustnots));
        })
        .sortBy('effectiveWeight.number')
        .value();
      response.render('flights', { searchResults });
    });
});

var listener = app.listen(process.env.PORT, () => console.log('Your app is listening on port ' + listener.address().port));

// import calculate from './calculate.js';

// import moment from 'moment';

// import requestPromise from 'request-promise-native';
// import qs from 'querystring';

// import express from 'express';
// import exphbs from 'express-handlebars';


// var app = express();

// app.engine('.hbs', exphbs({
//   extname: '.hbs',
//   defaultLayout: 'main',
//   partialsDir: 'views/partials',
//   layoutsDir: 'views/layouts'
// }));
// app.set('view engine', '.hbs');

// app.use(express.static('public'));

// app.get('/', function (request, response) {
//   const queryParams = {
//     typeFlight: 'round',
//     flyDaysType: 'departure',
//     returnFlyDaysType: 'arrival',

//     flyFrom: '37.8--122.27-74km',
//     to: '40.79--74.27-325km',
//     dateFrom: '17/11/2017',
//     dateTo: '23/11/2017',
//     returnFrom: '23/11/2017',
//     returnTo: '27/11/2017',

//     passengers: 1,
//     adults: 1,
//     children: 0,
//     infants: 0,

//     price_from: 0,
//     price_to: 1100,

//     curr: 'USD',
//     locale: 'en',
//     innerLimit: 300,
//     sort: 'quality',
//   };
//   return requestPromise(`https://api.skypicker.com/flights?${qs.stringify(queryParams)}`)
//     .then((rawResult) => {
//       // let {} = request.query;
//       const result = JSON.parse(rawResult);
//       response.render('flights', {
//         items: result.data.map(({
//           price,
//           route,
//         }) => {
//           const timeFormat = 'YYYY-MM-DD h:mm:ss';
//           const theRoute = route
//               .map(({ 
//                 airline,
//                 flight_no,
//                 flyFrom,
//                 flyTo,
//                 return: isReturn,

//                 dTime: departureTime,
//                 dTimeUTC: departureTimeUTC,
//                 aTime: arrivalTime,
//                 aTimeUTC: arrivalTimeUTC,
//               }) => {
//                 return {
//                   airline,
//                   flight_no,
//                   flyFrom,
//                   flyTo,
//                   direction: isReturn ? 'Back' : 'There',

//                   departureTime: moment(departureTime * 1000).format(timeFormat),
//                   departureTimeUTC: moment.utc(departureTimeUTC * 1000).format(timeFormat),
//                   arrivalTime: moment(arrivalTime * 1000).format(timeFormat),
//                   arrivalTimeUTC: moment.utc(arrivalTimeUTC * 1000).format(timeFormat),
//                 };
//               });
//           const there = {
//             flights: theRoute.filter(flight => flight.direction === 'Back'),
//             start: {
//               time,
//               location,
//             },
//             end: {
//               time,
//               location,
//             },
//             length,
//             layovertime,
//           };
//           const back = {
//             flights: theRoute.filter(flight => flight.direction === 'There'),
//             start: {
//               time,
//               location,
//             },
//             end: {
//               time,
//               location,
//             },
//             length,
//             layovertime,
//           };
//           return {
//             price,
            
//             there,
//             back,
//           };
//         })
//       });
//     })
// });

// var listener = app.listen(process.env.PORT, () => console.log('Your app is listening on port ' + listener.address().port));