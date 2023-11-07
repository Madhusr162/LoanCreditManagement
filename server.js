const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// MySQL database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Madhu162',
    database: 'LoanCredit',
  });
  
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      process.exit(1);
    }
    console.log('Connected to MySQL');
  });

  app.use(require('./APIS/register'));
  app.use(require('./APIS/checkEligibility'));
  app.use(require('./APIS/createLosn'));
  app.use(require('./APIS/loanDetails'));
  app.use(require('./APIS/loanPayment'));
  app.use(require('./APIS/viewStatement'));

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });