const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

app.listen(1234);

app.get('*', (req, res) => {
  if (req.path.includes('favicon')) {
    res.send();
  }
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, './index.html'));
  }
  return res.sendFile(path.join(__dirname, req.path));
});
