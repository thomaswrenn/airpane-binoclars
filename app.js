import express from 'express';
import exphbs from 'express-handlebars';

const {
  searchResultViewmodel,
} = require('./viewModelsAndHelpers.js');

const {
  thanksgiving2017Filter,
  thanksgiving2017Query,

  nowTillEasterFilter,
  nowTillEasterQuery,
} = require('./searches/index');

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

app.get('/', function (request, response) {
  return getResults(offsetUrlGenerator(nowTillEasterQuery))
    .then(results => results.map(searchResultViewmodel))
    .then(nowTillEasterFilter)
    .then(filteredResults => {
      response.render('partials/flights', { searchResults: filteredResults });
    });
});

var listener = app.listen(process.env.PORT, () => console.log('Your app is listening on port ' + listener.address().port));
