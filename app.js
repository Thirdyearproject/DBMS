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

// Create contacts table if it doesn't exist
const createcontactsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        PhoneNumber VARCHAR(15) NOT NULL,
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
            console.error('Error creating contacts table:', error);
        } else {
            console.log('contacts table created or already exists');
        }
    });
};

// Initialize database
createcontactsTable();


const createRelationshipsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS relationships (
        relationship_id INT AUTO_INCREMENT PRIMARY KEY,
        person1_id INT NOT NULL,
        person2_id INT NOT NULL,
        relationship_type VARCHAR(100) NOT NULL,
        FOREIGN KEY (person1_id) REFERENCES contacts(contact_id),
        FOREIGN KEY (person2_id) REFERENCES contacts(contact_id)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating relationships table:', error);
        } else {
            console.log('Relationships table created or already exists');
        }
    });
};

// Initialize database
createRelationshipsTable();
// API endpoint to get all relationships of a selected person
app.get('/relationships/:personId', (req, res) => {
    const { personId } = req.params;
    const query = `
        SELECT r1.person1_id AS person1, r1.person2_id AS person2, r1.relationship_type AS relationship_type1, r2.relationship_type AS relationship_type2
        FROM relationships r1
        INNER JOIN relationships r2 ON r1.person1_id = r2.person2_id AND r1.person2_id = r2.person1_id
        WHERE (r1.person1_id = ? OR r1.person2_id = ?) AND (r1.relationship_type <> r2.relationship_type)
    `;
    pool.query(query, [personId, personId], (error, results) => {
        if (error) {
            console.error('Error fetching relationships:', error);
            return res.status(500).json({ error: 'Error fetching relationships.' });
        }
        
        const relationships = [];
        results.forEach(row => {
            const { person1, person2, relationship_type1, relationship_type2 } = row;
            relationships.push({ person1, person2, relationship_type1, relationship_type2 });
        });

        res.json(relationships);
    });
});

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
    const { 
        Name, 
        PhoneNumber,
        email,
        address,
        organization,
        job_title,
        date_of_birth,
        website_url,
        notes,
        tags
    } = req.body;
    
    // Check if required parameters are provided
    if (!Name || !PhoneNumber) {
        return res.status(400).json({ error: 'Name and PhoneNumber are required.' });
    }
    
    // Insert the contact into the database
    const query = `
        INSERT INTO Contacts (
            Name, 
            PhoneNumber,
            email,
            address,
            organization,
            job_title,
            date_of_birth,
            website_url,
            notes,
            tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        Name, 
        PhoneNumber,
        email,
        address,
        organization,
        job_title,
        date_of_birth,
        website_url,
        notes,
        tags
    ];

    pool.query(query, values, (error, results) => {
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
    const { Name, PhoneNumber, email, address, organization, job_title, date_of_birth, website_url, notes, tags } = req.body;
    const query = `
        UPDATE contacts 
        SET 
            name = ?, 
            PhoneNumber = ?,
            email = ?,
            address = ?,
            organization = ?,
            job_title = ?,
            date_of_birth = ?,
            website_url = ?,
            notes = ?,
            tags = ?
        WHERE contact_id = ?
    `;
    const values = [
        Name, 
        PhoneNumber,
        email,
        address,
        organization,
        job_title,
        date_of_birth,
        website_url,
        notes,
        tags,
        id
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating contact:', error);
            return res.status(500).json({ error: 'Error updating contact.' });
        }
        res.send('Contact updated successfully.');
    });
});


// Delete a contact
// Delete a contact
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM contacts WHERE contact_id = ?', [id], (error, results) => {
        if (error) {
            console.error('Error deleting contact:', error);
            return res.status(500).json({ error: 'Error deleting contact.' });
        }
        res.send('Contact deleted successfully.');
    });
});


// Start server
app.listen(port, () => console.log(`PhoneBook API running on http://localhost:${port}`));
