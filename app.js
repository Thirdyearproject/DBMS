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

// Create addresses table
const createAddressesTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS addresses (
        address_id INT AUTO_INCREMENT PRIMARY KEY,
        locality VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(100),
        pin_code VARCHAR(20)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating addresses table:', error);
        } else {
            console.log('Addresses table created or already exists');
        }
    });
};

// Create phone_numbers table
const createPhoneNumbersTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS phone_numbers (
        phone_number_id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        type VARCHAR(50)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating phone_numbers table:', error);
        } else {
            console.log('Phone Numbers table created or already exists');
        }
    });
};

// Create emails table
const createEmailsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS emails (
        email_id INT AUTO_INCREMENT PRIMARY KEY,
        email_address VARCHAR(100) NOT NULL,
        type VARCHAR(50)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating emails table:', error);
        } else {
            console.log('Emails table created or already exists');
        }
    });
};

// Create contacts table
const createContactsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address_id INT,
        phone_number_id INT,
        email_id INT,
        organization VARCHAR(100),
        job_title VARCHAR(100),
        date_of_birth DATE,
        website_url VARCHAR(255),
        notes TEXT,
        tags VARCHAR(255),
        relationship_id INT,
        FOREIGN KEY (address_id) REFERENCES addresses(address_id),
        FOREIGN KEY (phone_number_id) REFERENCES phone_numbers(phone_number_id),
        FOREIGN KEY (email_id) REFERENCES emails(email_id)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating contacts table:', error);
        } else {
            console.log('Contacts table created or already exists');
            // Now create the relationships table
            createRelationshipsTable();
        }
    });
};
// Create relationships table
const createRelationshipsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS relationships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        person_id INT,
        relationship_type VARCHAR(100),
        FOREIGN KEY (person_id) REFERENCES contacts(contact_id)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating relationships table:', error);
        } else {
            console.log('Relationships table created or already exists');
        }
    });
};
// Initialize tables
const initializeTables = () => {
    createAddressesTable();
    createPhoneNumbersTable();
    createEmailsTable();
    createRelationshipsTable();
    createContactsTable();
    
};

initializeTables();


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
// POST endpoint to add data to all tables
// POST endpoint to add data to all tables including relationships
app.post('/contacts', (req, res) => {
    const {
        name,
        locality,
        city,
        state,
        pin_code,
        phone_number,
        phone_type,
        email_address,
        email_type,
        organization,
        job_title,
        date_of_birth,
        website_url,
        notes,
        tags,
        relationship_type // New: Added relationship_type to the request body
    } = req.body;

    // Insert address
    pool.query('INSERT INTO addresses (locality, city, state, pin_code) VALUES (?, ?, ?, ?)', [locality, city, state, pin_code], (error, addressResult) => {
        if (error) {
            console.error('Error inserting address:', error);
            return res.status(500).json({ error: 'Error creating contact.' });
        }

        // Insert phone number
        pool.query('INSERT INTO phone_numbers (phone_number, type) VALUES (?, ?)', [phone_number, phone_type], (error, phoneResult) => {
            if (error) {
                console.error('Error inserting phone number:', error);
                return res.status(500).json({ error: 'Error creating contact.' });
            }

            // Insert email
            pool.query('INSERT INTO emails (email_address, type) VALUES (?, ?)', [email_address, email_type], (error, emailResult) => {
                if (error) {
                    console.error('Error inserting email:', error);
                    return res.status(500).json({ error: 'Error creating contact.' });
                }

                // Insert contact
                pool.query('INSERT INTO contacts (name, address_id, phone_number_id, email_id, organization, job_title, date_of_birth, website_url, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, addressResult.insertId, phoneResult.insertId, emailResult.insertId, organization, job_title, date_of_birth, website_url, notes, tags], (error, contactResult) => {
                    if (error) {
                        console.error('Error inserting contact:', error);
                        return res.status(500).json({ error: 'Error creating contact.' });
                    }

                    // Insert relationship
                    if (relationship_type) { // Only if relationship_type is provided
                        pool.query('INSERT INTO relationships (person_id, relationship_type) VALUES (?, ?)', [contactResult.insertId, relationship_type], (error, relationshipResult) => {
                            if (error) {
                                console.error('Error inserting relationship:', error);
                                return res.status(500).json({ error: 'Error creating relationship.' });
                            }
                            res.status(201).json({ message: `Contact added with ID: ${contactResult.insertId}` });
                        });
                    } else {
                        res.status(201).json({ message: `Contact added with ID: ${contactResult.insertId}` });
                    }
                });
            });
        });
    });
});
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone_number_id, email_id, address_id, organization, job_title, date_of_birth, website_url, notes, tags } = req.body;
    const query = `
        UPDATE contacts 
        SET 
            name = ?, 
            phone_number_id = ?,
            email_id = ?,
            address_id = ?,
            organization = ?,
            job_title = ?,
            date_of_birth = ?,
            website_url = ?,
            notes = ?,
            tags = ?
        WHERE contact_id = ?
    `;
    const values = [
        name, 
        phone_number_id,
        email_id,
        address_id,
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
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;

    // Delete corresponding relationship entries in the relationships table first
    pool.query('DELETE FROM relationships WHERE person_id = ? OR person_id = ?', [id, id], (error, relationshipResults) => {
        if (error) {
            console.error('Error deleting relationships:', error);
            return res.status(500).json({ error: 'Error deleting relationships.' });
        }

        // Once relationships are deleted, proceed to delete the contact
        pool.query('DELETE FROM contacts WHERE contact_id = ?', [id], (error, contactResults) => {
            if (error) {
                console.error('Error deleting contact:', error);
                return res.status(500).json({ error: 'Error deleting contact.' });
            }
            res.send('Contact deleted successfully.');
        });
    });
});

app.get('/relationships/:personId', (req, res) => {
    const { personId } = req.params;
    // Query to retrieve relationships of the selected person with all other persons
    const query = `
    SELECT *
    FROM relationships
    WHERE person_id <> ? AND related_person_id <> ?
    
    `;

    // Execute the query with personId for both person_id and related_person_id
    pool.query(query, [personId, personId], (error, results) => {
        if (error) {
            console.error('Error fetching relationships:', error);
            return res.status(500).json({ error: 'Error fetching relationships.' });
        }
        res.json(results);
    });
});



// Start server
app.listen(port, () => console.log(`PhoneBook API running on http://localhost:${port}`));
