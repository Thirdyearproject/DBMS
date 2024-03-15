// index.js

require('dotenv').config(); // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MySQL connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Create phonebook table if it doesn't exist
const createPhonebookTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS phonebook (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        email VARCHAR(100),
        address VARCHAR(255),
        organization VARCHAR(100),
        job_title VARCHAR(100),
        date_of_birth DATE,
        website_url VARCHAR(255),
        notes TEXT,
        tags VARCHAR(255)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating phonebook table:', error);
        } else {
            console.log('Phonebook table created or already exists');
        }
    });
};

// Initialize database
createPhonebookTable();

// Get all contacts
app.get('/contacts', (req, res) => {
    pool.query('SELECT * FROM Contacts', (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

// Get a single contact by ID
app.get('/contacts/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM Contacts WHERE ContactID = ?', [id], (error, results) => {
        if (error) throw error;
        res.send(results[0]);
    });
});

// Create a new contact
app.post('/contacts', (req, res) => {
    const { Name, PhoneNumber } = req.body;
    
    // Check if Name and PhoneNumber are provided
    if (!Name || !PhoneNumber) {
        return res.status(400).json({ error: 'Name and PhoneNumber are required.' });
    }
    
    // Insert the contact into the database
    pool.query('INSERT INTO Contacts (Name, PhoneNumber) VALUES (?, ?)', [Name, PhoneNumber], (error, results) => {
        if (error) {
            console.error('Error inserting contact:', error);
            return res.status(500).json({ error: 'Error creating contact.' });
        }
        return res.status(201).json({ message: `Contact added with ID: ${results.insertId}` });
    });
});


// Update an existing contact
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { Name, PhoneNumber } = req.body;
    pool.query('UPDATE Contacts SET Name = ?, PhoneNumber = ? WHERE ContactID = ?', [Name, PhoneNumber, id], (error, results) => {
        if (error) throw error;
        res.send('Contact updated successfully.');
    });
});

// Delete a contact
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM Contacts WHERE ContactID = ?', [id], (error, results) => {
        if (error) throw error;
        res.send('Contact deleted successfully.');
    });
});

// Start server
app.listen(port, () => console.log(`PhoneBook API running on http://localhost:${port}`));
