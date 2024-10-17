const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.htm');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.htm');
});

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log(`Name: ${name}, Email: ${email}, Password: ${password}`);
  res.sendFile(__dirname + '/public/success.htm');
});

app.listen(port, () => {
  console.log(`Ohanz Server listening on port ${port}`);
});
