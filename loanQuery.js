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
        CREATE TABLE IF NOT EXISTS loans (
            customer_id INT,
            loan_id INT,
            loan_amount DECIMAL(10, 2) NOT NULL,
            tenure INT NOT NULL,
            interest_rate DECIMAL(5, 2) NOT NULL,
            monthly_payment DECIMAL(10, 2) NOT NULL,
            emis_paid_on_time INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
          );
          
      `;

            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('Table "loans" created or already exists');
                }
                const createIndex = 'CREATE INDEX idx_loan_id ON loans(loan_id);';
                connection.query(createIndex, (err) => {
                    if (err) {
                        console.error('Error creating index:', err);
                    } else {
                        console.log('Index created');
                    }

                    const workbook = XLSX.readFile('loan_data.xlsx');
                    const sheetName = 'Sheet1';
                    const worksheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(worksheet);

                    // Define arrays to store the converted dates
                    const startDates = [];
                    const endDates = [];

                    // Iterate through the rows in the sheet and extract the start and end dates
                    for (let i = 2; i <= 100; i++) { // Assuming data starts from row 2 and ends at row 100
                        const startDateCell = worksheet['H' + i]; // Assuming 'A' is the column for start_date
                        const endDateCell = worksheet['I' + i]; // Assuming 'B' is the column for end_date

                        if (startDateCell && startDateCell.v && endDateCell && endDateCell.v) {
                            // Convert the Excel date values to 'YYYY-MM-DD' format
                            const excelStartDateValue = startDateCell.v;
                            const jsStartDate = new Date(1900, 0, excelStartDateValue - 1);
                            const formattedStartDate = jsStartDate.toISOString().split('T')[0];

                            const excelEndDateValue = endDateCell.v;
                            const jsEndDate = new Date(1900, 0, excelEndDateValue - 1);
                            const formattedEndDate = jsEndDate.toISOString().split('T')[0];

                            startDates.push(formattedStartDate);
                            endDates.push(formattedEndDate);
                        }
                    }

                    data.forEach((row) => {
                        // Convert Excel date values to 'YYYY-MM-DD' format
                        const excelStartDateValue = row.start_date;
                        const jsStartDate = new Date(1900, 0, excelStartDateValue - 1);
                        const formattedStartDate = jsStartDate.toISOString().split('T')[0];

                        const excelEndDateValue = row.end_date;
                        const jsEndDate = new Date(1900, 0, excelEndDateValue - 1);
                        const formattedEndDate = jsEndDate.toISOString().split('T')[0];

                        // Insert the data into the 'loans' table
                        const query = 'INSERT INTO loans (customer_id, loan_id, loan_amount, tenure, interest_rate, monthly_payment, emis_paid_on_time, start_date, end_date) VALUES (?,?,?,?,?,?,?,?,?)';

                        const values = [
                            row.customer_id,
                            row.loan_id,
                            row.loan_amount,
                            row.tenure,
                            row.interest_rate,
                            row.monthly_payment,
                            row.emis_paid_on_time,
                            formattedStartDate, // Use the formatted date here
                            formattedEndDate,   // Use the formatted date here
                        ];

                        connection.query(query, values, (err) => {
                            if (err) {
                                console.error('Error inserting data:', err);
                            } else {
                                console.log('Data inserted');
                            }
                        });
                    });


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
});

