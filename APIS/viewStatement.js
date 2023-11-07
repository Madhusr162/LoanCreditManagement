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

// Function to create the 'payments' table
function createPaymentsTable() {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_id INT,
        amount DECIMAL(10, 2),
        payment_date DATE,
        FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
      );
    `;

    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
      } else {
        console.log('Table "payments" created or already exists');
        resolve();
      }
    });
  });
}

// Define a route to view the loan statement
router.get('/view-statement/:customer_id/:loan_id', async (req, res) => {
  const customer_id = req.params.customer_id;
  const loan_id = req.params.loan_id;

  try {
    await createPaymentsTable(); // Ensure the 'payments' table exists

    const statementQuery = `
    SELECT
    loans.customer_id AS customer_id,
    loans.loan_id AS loan_id,
    MAX(loans.loan_amount) AS principal,
    MAX(loans.interest_rate) AS interest_rate,
    SUM(payments.amount) AS amount_paid,
    MAX(loans.monthly_payment) AS monthly_installment,
    COUNT(payments.id) AS repayments_left
  FROM loans
  LEFT JOIN payments ON loans.loan_id = payments.loan_id
  WHERE loans.customer_id = ? AND loans.loan_id = ?
  GROUP BY loans.customer_id, loans.loan_id;
  
    `;

    db.query(statementQuery, [customer_id, loan_id], (error, results) => {
      if (error) {
        console.error('Error fetching statement data: ', error);
        return res.status(500).json({ error: 'Error fetching statement data' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Loan not found for the customer' });
      }

      const loanStatement = results[0];

      // Construct a response with loan statement details
      const response = {
        customer_id: loanStatement.customer_id,
        loan_id: loanStatement.loan_id,
        principal: loanStatement.principal,
        interest_rate: loanStatement.interest_rate,
        amount_paid: loanStatement.amount_paid,
        monthly_installment: loanStatement.monthly_installment,
        repayments_left: loanStatement.repayments_left,
      };

      res.status(200).json(response);
    });
  } catch (err) {
    // Handle any errors that occur during table creation
    return res.status(500).json({ error: 'Error creating table or other operation' });
  }
});

module.exports = router;
