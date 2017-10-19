module.exports = {
    baseQuery: require('./base'),

    oneAdult: require('./oneAdult'),
    twoAdults: require('./twoAdults'),

    notInsanePriced: require('./notInsanePriced'),

    fromSF: require('./fromSF'),
    fromDC: require('./fromDC'),

    toDCOrCTIncludingNYCAndBoston: require('./toDCOrCTIncludingNYCAndBoston'),
    toCTIncludingNYCAndBoston: require('./toCTIncludingNYCAndBoston'),
    toDC: require('./toDC'),
    toCTOnly: require('./toCTOnly'),
    toSF: require('./toSF'),
};
