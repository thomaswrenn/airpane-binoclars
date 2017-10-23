const qs = require('querystring');
const moment = require('moment');
require('moment-duration-format');
const _ = require('lodash');

const { TIME_FORMAT } = require('./constants.js');

const timeViewmodel = ({ local, utc }) => {
  return {
    local: {
      int: local,
      iso: moment(local * 1000).format(),
      string: moment(local * 1000).format(TIME_FORMAT),
    },
    utc: {
      int: utc,
      iso: moment.utc(utc * 1000).format(),
      string: moment.utc(utc * 1000).format(TIME_FORMAT),
    },
  };
};

const flightViewmodel = ({
  airline,
  flight_no,
  flyFrom,
  flyTo,
  return: isReturn,

  dTime: departureTime,
  dTimeUTC: departureTimeUTC,
  aTime: arrivalTime,
  aTimeUTC: arrivalTimeUTC,
}) => {
  return {
    airline,
    flight_no,
    flyFrom,
    flyTo,
    direction: isReturn ? 'Back' : 'There',

    departure: {
      time: timeViewmodel({ local: departureTime, utc: departureTimeUTC }),
    },
    arrival: {
      time: timeViewmodel({ local: arrivalTime, utc: arrivalTimeUTC }),
    },
  };
};

const timeOnDate = (time, dateString) => (moment(time.local.iso).format('YYYY-MM-DD') === dateString);

const formatArray = (arr, format) => {
  return arr.map(time => moment(time).format(format));
}

const getFlightStartAndEnd = flight => ({
  start: flight.start.time.local.iso,
  end:   flight.end.time.local.iso,
});

const flightStartsAfterTime = (flight, startHourFilter) => {
  const { start } = getFlightStartAndEnd(flight);
  const [ startTime ] = formatArray([start], 'HH:mm');
  return (startTime > startHourFilter);
};

const flightEndsAfterTime = (flight, endHourFilter) => {
  const { end } = getFlightStartAndEnd(flight);
  const [ endTime ] = formatArray([end], 'HH:mm');
  return (endTime > endHourFilter);
}

const flightStartsAndEndsBetweenTimes = (flight, startHourFilter, endHourFilter) => {
  const { start, end } = getFlightStartAndEnd(flight);
  const isInZone = item => ((item > startHourFilter) && (item < endHourFilter));
  const [ startTime, endTime ] = formatArray([start, end], 'HH:mm');
  const startTimeIsInZone = isInZone(startTime);
  const endTimeIsInZone = isInZone(endTime);
  return (
    startTimeIsInZone && endTimeIsInZone
  );
};

const flightStartsAndEndsWithinHoursOnSameDay = (flight, startHourFilter, endHourFilter) => {
  const { start, end } = getFlightStartAndEnd(flight);
  const [ startDay, endDay ] = formatArray([start, end], 'YYYY-MM-DD');
  const isSameDay = (startDay === endDay);
  return (
    flightStartsAndEndsBetweenTimes(flight, startHourFilter, endHourFilter) && isSameDay
  );
};

const flightStartsOnDays = (flight, startDaysArray) => {
  const { start } = getFlightStartAndEnd(flight);
  const [ startDay ] = formatArray([start], 'dddd');
  return (startDaysArray.includes(startDay));
};

const routeViewmodel = flights => {
  const startFlight = _.minBy(flights, flight => flight.departure.time.utc.iso);
  const endFlight = _.maxBy(flights, flight => flight.arrival.time.utc.iso);
  return {
    flights,
    start: {
      from: startFlight.flyFrom,
      to: startFlight.flyTo,
      time: startFlight.departure.time,
      flight: startFlight,
    },
    end: {
      from: endFlight.flyFrom,
      to: endFlight.flyTo,
      time: endFlight.arrival.time,
      flight: endFlight,
    }
    // length, layovertime,
  };
};

const deepUrlFromIdAndBookingToken = (id, booking_token) => {
  const queryParams = {
    flightsId: id,
    booking_token,
    type: 'default',
    currency: 'USD',
    lang: 'en',
    // affilid: 'tom_wrenn_personal_use',
  }
  const queryString = qs.stringify(queryParams);
  return `https://www.skypicker.com/deep?${queryString}`;
}

const searchResultViewmodel = (allOfIt) => {
  const {
    price,
    route,
    duration,
    id,
    booking_token,
  } = allOfIt;
  const theRoute = route.map(flightViewmodel);
  const there = routeViewmodel(theRoute.filter(flight => flight.direction === 'There'));
  const back = routeViewmodel(theRoute.filter(flight => flight.direction === 'Back'));
  const durationViewmodel = {
    there: {
      seconds: duration.departure,
      string: moment.duration(duration.departure, 'seconds').format()
    },
    back: {
      seconds: duration.return,
      string: moment.duration(duration.return, 'seconds').format()
    },
    total: {
      seconds: duration.total,
      string: moment.duration(duration.total, 'seconds').format()
    },
  };

  return {
    price,
    deepLink: deepUrlFromIdAndBookingToken(id, booking_token),
    duration: durationViewmodel,
    there,
    back,
    start: there.start,
    end: back.end,
  };
};

const getStartOfNextWeekend = (date) => {
  const isSunday = (date.day() <= 0);
  return date.startOf('week').add(isSunday ? 0 : 1, 'week').day(5);
};
const getFridayBefore = date => date.day(date.day() >= 5 ? 5 :-2);
const getTwoMondaysFromDate = date => date.startOf('week').day(1).add(1, 'week');

module.exports = {
  flightViewmodel,
  routeViewmodel,
  searchResultViewmodel,

  flightStartsAfterTime,
  flightEndsAfterTime,
  flightStartsAndEndsBetweenTimes,
  flightStartsAndEndsWithinHoursOnSameDay,
  flightStartsOnDays,

  getStartOfNextWeekend,
  getFridayBefore,
  getTwoMondaysFromDate,

  timeOnDate,
};
