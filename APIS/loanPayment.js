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

// Define a route to make a payment towards an EMI
router.post('/make-payment/:customer_id/:loan_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const loan_id = req.params.loan_id;
  const { amount } = req.body;

  // Retrieve loan details from the database based on the loan ID
  const loanQuery = 'SELECT loan_amount, monthly_payment FROM loans WHERE loan_id = ?';
  db.query(loanQuery, [loan_id], (loanError, loanResults) => {
    if (loanError) {
      console.error('Error fetching loan data: ', loanError);
      return res.status(500).json({ error: 'Error fetching loan data' });
    }

    if (loanResults.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const loanDetails = loanResults[0];
    const { loan_amount, monthly_payment } = loanDetails;

    // Calculate the remaining balance
    const remainingBalance = loan_amount - amount;

    // Recalculate the new monthly payment if the remaining balance is greater than 0
    let newMonthlyPayment = monthly_payment;
    if (remainingBalance > 0) {
      const remainingTenure = Math.ceil(remainingBalance / newMonthlyPayment);
      newMonthlyPayment = remainingBalance / remainingTenure;
    }

    // Update the loan with the new monthly payment and remaining balance
    const updateQuery = 'UPDATE loans SET monthly_payment = ?, loan_amount = ? WHERE loan_id = ?';
    db.query(updateQuery, [newMonthlyPayment, remainingBalance, loan_id], (updateError, updateResults) => {
      if (updateError) {
        console.error('Error updating loan data: ', updateError);
        return res.status(500).json({ error: 'Error updating loan data' });
      }

      // If the remaining balance is less than or equal to 0, consider the loan as fully paid
      if (remainingBalance <= 0) {
        return res.status(200).json({ message: 'Loan fully paid' });
      } else {
        return res.status(200).json({ message: 'Payment successfully processed' });
      }
    });
  });
});

module.exports = router;
