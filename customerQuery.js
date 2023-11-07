const mysql = require('mysql');
const XLSX = require('xlsx');

// Create a connection to the MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Madhu162',
});

// Connect to MySQL server
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL server');

  // Create the database
  connection.query('CREATE DATABASE IF NOT EXISTS LoanCredit', (err) => {
    if (err) {
      console.error('Error creating database:', err);
    } else {
      console.log('Database created or already exists');
    }

    // Use the database
    connection.query('USE LoanCredit', (err) => {
      if (err) {
        console.error('Error using the database:', err);
      } else {
        console.log('Using database');
      }

      // Create the customers table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS customers (
          customer_id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          phone_number VARCHAR(15),
          monthly_salary DECIMAL(10, 2) NOT NULL,
          approved_limit DECIMAL(10, 2) NOT NULL,
          current_debt DECIMAL(10, 2) DEFAULT 0
        )
      `;

      connection.query(createTableQuery, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          console.log('Table "customers" created or already exists');
        }

        const workbook = XLSX.readFile('customer_data.xlsx');
        const sheetName = 'Sheet1';
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        data.forEach((row) => {
          const query =  'INSERT INTO customers (first_name, last_name, phone_number, monthly_salary, approved_limit, current_debt) VALUES (?,?,?,?,?,?)'

            connection.query(query, [row.first_name, row.last_name, row.phone_number, row.monthly_salary, row.approved_limit, row.current_debt], (err) => {
              if (err) {
                console.error('Error inserting data:', err);
              } else {
                console.log('Data inserted');
              }
            });
          })

        // Close the MySQL connection
        connection.end((err) => {
          if (err) {
            console.error('Error closing connection:', err);
          } else {
            console.log('Connection closed');
          }
        });
      });
    });
  });
});

