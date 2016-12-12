const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const graphite = require('graphite');

const graphiteClient = graphite.createClient(`plaintext://${process.env.GRAPHITE_SERVER || 'localhost'}:2003/`);

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

/*
app.use(function (req, res, next) {
  console.log('404', { url: req.originalUrl, body: req.body, params: req.params});
  next();
});
*/

app.get('/', function (req, res) {
  res.send('OK');
});

app.post('/publish/:device', function (req, res) {
  req.body.metric = req.body.metric.replace(/\W+/g, '_');
  console.log(`smartthings.${req.params.device}.${req.body.metric} ${req.body.value} ${req.body.measure_time}`);
  graphiteClient.write({ [`smartthings.${req.params.device}.${req.body.metric}`]: req.body.value });
  res.send('OK');
});

app.listen(process.env.PORT || 3000);
