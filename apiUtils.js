const requestPromise = require('request-promise-native');
const qs = require('querystring');

const makeUrl = (defaultQueryParams, oneOffOverrideQueryParams) => {
  const queryParams = Object.assign({}, defaultQueryParams, oneOffOverrideQueryParams);
  const queryString = qs.stringify(queryParams);
  return `https://api.skypicker.com/flights?${queryString}`;
};

const offsetUrlGenerator = (queryParams) => {
  let offset = 0;
  return () => {
    const returnUrl = makeUrl(queryParams, { offset });
    offset += 200;
    return returnUrl;
  }
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
};

module.exports = {
    makeUrl,
    offsetUrlGenerator,
    getResults,
};
