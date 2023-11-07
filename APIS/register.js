const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Madhu162',
  database: 'LoanCredit',
});

// Register a new customer
router.post('/register', (req, res) => {
  const { first_name, last_name, monthly_salary, phone_number } = req.body;

  if (!first_name || !last_name || !monthly_salary || !phone_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Calculate the approved limit based on the salary
  const approved_limit = Math.round(36 * monthly_salary / 100000) * 100000; // Rounded to nearest lakh

  // Insert the customer into the database
  const insertQuery = 'INSERT INTO customers (first_name, last_name, monthly_salary, phone_number, approved_limit) VALUES (?, ?, ?, ?, ?)';

  db.query(insertQuery, [first_name, last_name, monthly_salary, phone_number, approved_limit], (err, result) => {
    if (err) {
      console.error('Error inserting customer:', err);
      return res.status(500).json({ error: 'Failed to insert customer' });
    }

    const customer_id = result.insertId;

    // Prepare the response
    const customer = {
      customer_id: customer_id,
      name: `${first_name} ${last_name}`,
      monthly_salary: monthly_salary,
      approved_limit: approved_limit,
      phone_number: phone_number,
    };

    res.status(201).json(customer);
  });
});



module.exports=router;
