import express from 'express';
import exphbs from 'express-handlebars';

const {
  searchResultViewmodel,
} = require('./viewModelsAndHelpers.js');

const availableSearchesHash = require('./searches/index');

const {
  getResults,
  offsetUrlGenerator,
} = require('./apiUtils');

var app = express();

app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  layoutsDir: 'views/layouts'
}));
app.set('view engine', '.hbs');

app.use(express.static('public'));

const queryAndFilter = (apiQueryParams, filterFunction) =>
  getResults(offsetUrlGenerator(apiQueryParams))
    .then(results => results.map(searchResultViewmodel))
    .then(filterFunction);

app.get('/', function (request, response) {
  return response.render('partials/404', { noSearchName: true, availableSearches: availableSearchesHash });
});

app.get('/:searchName', function (request, response) {
  const { params: { searchName } } = request;
  const search = availableSearchesHash[searchName];
  if (!search)
    return response.render('partials/404', { attemptedSearchName: searchName, availableSearches: availableSearchesHash });
  const { query: apiQueryParams, filter: filterFunction } = search;
  return queryAndFilter(apiQueryParams, filterFunction).then(filteredResults =>
    response.render('partials/flights', { searchResults: filteredResults })
  );
});

var listener = app.listen(process.env.PORT, () => console.log('Your app is listening on port ' + listener.address().port));
