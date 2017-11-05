module.exports = {
    baseQuery: require('./base'),

    oneAdult: require('./oneAdult'),
    twoAdults: require('./twoAdults'),

    notInsanePriced: require('./notInsanePriced'),
    weekendFlightsOnly: require('./weekendFlightsOnly'),

    fromSF: require('./fromSF'),
    fromDC: require('./fromDC'),
    fromSheffieldish: require('./fromSheffieldish'),

    toDCOrCTIncludingNYCAndBoston: require('./toDCOrCTIncludingNYCAndBoston'),
    toCTIncludingNYCAndBoston: require('./toCTIncludingNYCAndBoston'),
    toDC: require('./toDC'),
    toCTOnly: require('./toCTOnly'),
    toSF: require('./toSF'),
};
