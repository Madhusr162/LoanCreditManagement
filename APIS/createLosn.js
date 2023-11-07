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

// Define the route for creating a new loan
router.post('/create-loan', (req, res) => {
    const { customerId, loan_amount, interest_rate, tenure } = req.body;

    const PastLoansQuery = `SELECT COUNT(*) AS past_loans_paid_on_time FROM loans WHERE customer_id = ${customerId} AND tenure > 0 AND emis_paid_on_time > 0;`;

    db.query(PastLoansQuery, (error, results, fields) => {
        if (error) {
            console.error('Error fetching data: ', error);
            return res.status(500).json({ error: 'Error fetching data' });
        }

        const PastLoansPaidOnTime = results[0].past_loans_paid_on_time;
        console.log("past loans paid on time: ", PastLoansPaidOnTime);

        const LoansTakenQuery = `SELECT COUNT(DISTINCT loan_id) AS number_of_loans_taken FROM loans WHERE customer_id = ${customerId};`;
        db.query(LoansTakenQuery, (error, results, fields) => {
            if (error) {
                console.error('Error fetching data: ', error);
                return res.status(500).json({ error: 'Error fetching data' });
            }

            const LoansTakenInPast = results[0].number_of_loans_taken;
            console.log("number of loans taken in the past: ", LoansTakenInPast);

            const LoanActivityQuery = `SELECT COUNT(*) FROM loans
      WHERE customer_id = ${customerId}
        AND YEAR(CURRENT_DATE) BETWEEN YEAR(start_date) AND YEAR(end_date);`;

            db.query(LoanActivityQuery, (error, results, fields) => {
                if (error) {
                    console.error('Error fetching data: ', error);
                    return res.status(500).json({ error: 'Error fetching data' });
                }

                const LoanActivityInCurrentYear = results[0].loan_activity_current_year;
                console.log("loans in the current year: ", LoanActivityInCurrentYear);

                const LoanApprovedQuery = `SELECT SUM(monthly_payment * tenure) AS loan_approved_volume FROM loans WHERE customer_id = ${customerId};`;
                db.query(LoanApprovedQuery, (error, results, fields) => {
                    if (error) {
                        console.error('Error fetching data: ', error);
                        return res.status(500).json({ error: 'Error fetching data' });
                    }

                    const LoanApprovedVolume = results[0].loan_approved_volume;
                    console.log("loan approved volume: ", LoanApprovedVolume);

                    const LoanApprovedInCurrentYearQuery = `SELECT SUM(monthly_payment * tenure) AS loan_amount_in_current_year FROM loans WHERE customer_id = ${customerId} AND YEAR(start_date) = YEAR(CURRENT_DATE) AND YEAR(end_date) = YEAR(CURRENT_DATE);`;
                    db.query(LoanApprovedInCurrentYearQuery, (error, results, fields) => {
                        if (error) {
                            console.error('Error fetching data: ', error);
                            return res.status(500).json({ error: 'Error fetching data' });
                        }

                        const LoanApprovedInCurrentYear = results[0].loan_amount_in_current_year;
                        console.log("Loan approved in the current year: ", LoanApprovedInCurrentYear);

                        const ApprovedLimitQuery = `SELECT approved_limit FROM customers WHERE customer_id = ${customerId}`;
                        db.query(ApprovedLimitQuery, (error, results, fields) => {
                            if (error) {
                                console.error('Error fetching data: ', error);
                                return res.status(500).json({ error: 'Error fetching data' });
                            }

                            const ApprovedLimit = results[0].approved_limit;
                            console.log("approved limit: ", ApprovedLimit);

                            const weights = {
                                PastLoansPaidOnTime: 0.4,
                                LoansTakenInPast: 0.2,
                                LoanActivityInCurrentYear: 0.2,
                                LoanApprovedVolume: 0.2
                            };

                            const maxPastLoansPaidOnTime = LoanApprovedInCurrentYear; // Replace with the correct value
                            const maxNumberOfLoansTaken = LoansTakenInPast; // Replace with the correct value
                            const maxLoanAmountInCurrentYear = LoanActivityInCurrentYear; // Replace with the correct value
                            const maxLoanApprovedVolume = LoanApprovedVolume; // Replace with the correct value

                            const PastLoansPaidOnTimeScore = PastLoansPaidOnTime / maxPastLoansPaidOnTime;
                            console.log("past loans score: ", PastLoansPaidOnTimeScore);

                            const LoansTakenInPastScore = LoansTakenInPast / maxNumberOfLoansTaken;
                            console.log("loans taken score: ", LoansTakenInPastScore);

                            const LoanActivityInCurrentYearScore = LoanActivityInCurrentYear / maxLoanAmountInCurrentYear;
                            console.log("current loan score: ", LoanActivityInCurrentYearScore);

                            const LoanApprovedVolumeScore = LoanApprovedVolume / maxLoanApprovedVolume;
                            console.log("loan approved score: ", LoanApprovedVolumeScore);

                            var creditScore = (
                                PastLoansPaidOnTimeScore * weights.PastLoansPaidOnTime +
                                LoansTakenInPastScore * weights.LoansTakenInPast +
                                LoanActivityInCurrentYearScore * weights.LoanActivityInCurrentYear +
                                LoanApprovedVolumeScore * weights.LoanApprovedVolume
                            ) * 100; // Multiply by 100 to get a score on a 0-100 scale
                            console.log("credit score: ", creditScore);

                            if (creditScore > 50) {
                                // Loan approval logic
                                const monthly_payment = calculateMonthlyPayment(loan_amount, interest_rate, tenure);
                                const loan_approved = true;

                                function generateLoanID() {
                                    // Generate a random 4-digit number
                                    const min = 1000; // Minimum 4-digit number
                                    const max = 9999; // Maximum 4-digit number
                                    const loanID = Math.floor(Math.random() * (max - min + 1)) + min;
                                    return loanID;
                                }

                                // Generate and print a random loan ID
                                const loan_id = generateLoanID();
                                console.log("Loan ID:", loan_id);


                                // Return the response
                                res.status(200).json({
                                    loan_id,
                                    customerId,
                                    loan_approved,
                                    message: `Loan approved with interest rate ${interest_rate}%`,
                                    monthly_installment: monthly_payment,
                                });
                            } else if (creditScore > 30) {
                                const int_rate=16
                                const monthly_payment = calculateMonthlyPayment(loan_amount, int_rate, tenure);
                                const loan_approved = true;

                                function generateLoanID() {
                                    // Generate a random 4-digit number
                                    const min = 1000; // Minimum 4-digit number
                                    const max = 9999; // Maximum 4-digit number
                                    const loanID = Math.floor(Math.random() * (max - min + 1)) + min;
                                    return loanID;
                                }

                                // Generate and print a random loan ID
                                const loan_id = generateLoanID();
                                console.log("Loan ID:", loan_id);


                                // Return the response
                                res.status(200).json({
                                    loan_id,
                                    customerId,
                                    loan_approved,
                                    message: 'Loan approved with interest rate 16%',
                                    monthly_installment: monthly_payment,
                                });
                            } else if (creditScore > 10) {
                                const int_rate=18
                                const monthly_payment = calculateMonthlyPayment(loan_amount, int_rate, tenure);
                                const loan_approved = true;

                                function generateLoanID() {
                                    // Generate a random 4-digit number
                                    const min = 1000; // Minimum 4-digit number
                                    const max = 9999; // Maximum 4-digit number
                                    const loanID = Math.floor(Math.random() * (max - min + 1)) + min;
                                    return loanID;
                                }

                                // Generate and print a random loan ID
                                const loan_id = generateLoanID();
                                console.log("Loan ID:", loan_id);


                                // Return the response
                                res.status(200).json({
                                    loan_id,
                                    customerId,
                                    loan_approved,
                                    message: 'Loan approved with interest rate 18%',
                                    monthly_installment: monthly_payment,
                                });
                            } else {
                                // Don't approve any loans
                                console.log('Loan not approved.');
                                return res.status(200).json({ eligibility: 'not approved' });
                            }
                        });
                    });
                });
            });
        });
    });

// Function to calculate the monthly payment
function calculateMonthlyPayment(loan_amount, interest_rate, tenure) {
    const monthly_interest_rate = (interest_rate / 100) / 12;
    const num_payments = tenure * 12;
    const monthly_payment = (loan_amount * monthly_interest_rate) / (1 - Math.pow(1 + monthly_interest_rate, -num_payments));
    return monthly_payment;
}
});

module.exports = router;
