const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Madhu162',
  database: 'LoanCredit',
});

db.connect();

// Define a route to view loan and customer details
router.get('/view-loan-details/:loan_id', (req, res) => {
  const loanId = req.params.loan_id;

  // Retrieve loan and customer details from the database based on the loan ID
  const query = `
    SELECT
      loans.loan_id AS loan_id,
      customers.customer_id AS customer_id,
      customers.first_name,
      customers.last_name,
      customers.phone_number,
      loans.loan_amount,
      loans.interest_rate,
      loans.monthly_payment AS monthly_installment,
      loans.tenure
    FROM loans
    JOIN customers ON loans.customer_id = customers.customer_id
    WHERE loans.loan_id = ?
  `;

  db.query(query, [loanId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching data: ', error);
      return res.status(500).json({ error: 'Error fetching data' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const loanDetails = results[0];

    // Construct a JSON response containing loan and customer details
    const response = {
      loan_id: loanDetails.loan_id,
      customer: {
        id: loanDetails.customer_id,
        first_name: loanDetails.first_name,
        last_name: loanDetails.last_name,
        phone_number: loanDetails.phone_number
      },
      loan_amount: loanDetails.loan_amount,
      interest_rate: loanDetails.interest_rate,
      monthly_installment: loanDetails.monthly_installment,
      tenure: loanDetails.tenure,
    };

    res.status(200).json(response);
  });
});

module.exports = router;
