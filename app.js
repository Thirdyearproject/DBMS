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
// Create contacts table
const createContactsTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
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
            console.log('Contacts table created or already exists');
        }
    });
};
// Create addresses table
const createAddressesTable = () => {
    pool.query(`CREATE TABLE IF NOT EXISTS addresses (
        address_id INT AUTO_INCREMENT PRIMARY KEY,
        Address_contact_id INT,
        locality VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(100),
        pin_code VARCHAR(20),     
        FOREIGN KEY (Address_contact_id) REFERENCES contacts(contact_id)
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
        phone_contact_id INT,
        phone_number VARCHAR(15) NOT NULL,
        type VARCHAR(50),
        FOREIGN KEY (phone_contact_id) REFERENCES contacts(contact_id)
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
        email_contact_id INT,
        email_address VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        FOREIGN KEY (email_contact_id) REFERENCES contacts(contact_id)
    )`, (error, results, fields) => {
        if (error) {
            console.error('Error creating emails table:', error);
        } else {
            console.log('Emails table created or already exists');
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
    createContactsTable();
    createRelationshipsTable(); 
    createAddressesTable();
    createPhoneNumbersTable();
    createEmailsTable();
};

initializeTables();

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
        relationship_type
    } = req.body;

    // Insert contact
    pool.query('INSERT INTO contacts (name, organization, job_title, date_of_birth, website_url, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, organization, job_title, date_of_birth, website_url, notes, tags], (error, contactResult) => {
        if (error) {
            console.error('Error inserting contact:', error);
            return res.status(500).json({ error: 'Error creating contact.' });
        }
        pool.query('INSERT INTO addresses (Address_contact_id,locality, city, state, pin_code) VALUES (?,?, ?, ?, ?)', [contactResult.insertId,locality, city, state, pin_code], (error, addressResult) => {
            if (error) {
                console.error('Error inserting address:', error);
                return res.status(500).json({ error: 'Error creating contact.' });
            }

            // Insert phone number
            pool.query('INSERT INTO phone_numbers (phone_contact_id,phone_number, type) VALUES (?,?, ?)', [contactResult.insertId,phone_number, phone_type], (error, phoneResult) => {
                if (error) {
                    console.error('Error inserting phone number:', error);
                    return res.status(500).json({ error: 'Error creating contact.' });
                }

                // Insert email
                pool.query('INSERT INTO emails (email_contact_id,email_address, type) VALUES (?,?, ?)', [contactResult.insertId,email_address, email_type], (error, emailResult) => {
                    if (error) {
                        console.error('Error inserting email:', error);
                        return res.status(500).json({ error: 'Error creating contact.' });
                    }

                    // Insert relationship
                    if (relationship_type) {
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

app.put('/contacts/:contactId', (req, res) => {
    const contactId = req.params.contactId;
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
        relationship_type
    } = req.body;

    // Update contact
    pool.query('UPDATE contacts SET name=?, organization=?, job_title=?, date_of_birth=?, website_url=?, notes=?, tags=? WHERE contact_id=?', [name, organization, job_title, date_of_birth, website_url, notes, tags, contactId], (error, contactResult) => {
        if (error) {
            console.error('Error updating contact:', error);
            return res.status(500).json({ error: 'Error updating contact.' });
        }

        // Update address
        pool.query('UPDATE addresses SET locality=?, city=?, state=?, pin_code=? WHERE Address_contact_id=?', [locality, city, state, pin_code, contactId], (error, addressResult) => {
            if (error) {
                console.error('Error updating address:', error);
                return res.status(500).json({ error: 'Error updating address.' });
            }

            // Update phone number
            pool.query('UPDATE phone_numbers SET phone_number=?, type=? WHERE phone_contact_id=?', [phone_number, phone_type, contactId], (error, phoneResult) => {
                if (error) {
                    console.error('Error updating phone number:', error);
                    return res.status(500).json({ error: 'Error updating phone number.' });
                }

                // Update email
                pool.query('UPDATE emails SET email_address=?, type=? WHERE email_contact_id=?', [email_address, email_type, contactId], (error, emailResult) => {
                    if (error) {
                        console.error('Error updating email:', error);
                        return res.status(500).json({ error: 'Error updating email.' });
                    }

                    // Update relationship
                    if (relationship_type) {
                        pool.query('UPDATE relationships SET relationship_type=? WHERE person_id=?', [relationship_type, contactId], (error, relationshipResult) => {
                            if (error) {
                                console.error('Error updating relationship:', error);
                                return res.status(500).json({ error: 'Error updating relationship.' });
                            }
                            res.status(200).json({ message: `Contact with ID ${contactId} updated successfully.` });
                        });
                    } else {
                        res.status(200).json({ message: `Contact with ID ${contactId} updated successfully.` });
                    }
                });
            });
        });
    });
});

app.delete('/contacts/:contactId', (req, res) => {
    const contactId = req.params.contactId;

    // Delete associated records first (addresses, phone numbers, emails, relationships)
    pool.query('DELETE FROM addresses WHERE Address_contact_id = ?', [contactId], (error, addressResult) => {
        if (error) {
            console.error('Error deleting addresses:', error);
            return res.status(500).json({ error: 'Error deleting addresses.' });
        }

        pool.query('DELETE FROM phone_numbers WHERE phone_contact_id = ?', [contactId], (error, phoneResult) => {
            if (error) {
                console.error('Error deleting phone numbers:', error);
                return res.status(500).json({ error: 'Error deleting phone numbers.' });
            }

            pool.query('DELETE FROM emails WHERE email_contact_id = ?', [contactId], (error, emailResult) => {
                if (error) {
                    console.error('Error deleting emails:', error);
                    return res.status(500).json({ error: 'Error deleting emails.' });
                }

                pool.query('DELETE FROM relationships WHERE person_id = ?', [contactId], (error, relationshipResult) => {
                    if (error) {
                        console.error('Error deleting relationships:', error);
                        return res.status(500).json({ error: 'Error deleting relationships.' });
                    }
                    
                    // Once associated records are deleted, delete the contact
                    pool.query('DELETE FROM contacts WHERE contact_id = ?', [contactId], (error, contactResult) => {
                        if (error) {
                            console.error('Error deleting contact:', error);
                            return res.status(500).json({ error: 'Error deleting contact.' });
                        }
                        res.status(200).json({ message: `Contact with ID ${contactId} and associated records deleted successfully.` });
                    });
                });
            });
        });
    });
});

// Get all contacts
app.get('/contacts', (req, res) => {
    // Query to retrieve all contact information with associated data from other tables
    const query = `
        SELECT 
            contacts.*,
            addresses.locality,
            addresses.city,
            addresses.state,
            addresses.pin_code,
            phone_numbers.phone_number,
            phone_numbers.type AS phone_type,
            emails.email_address,
            emails.type AS email_type,
            relationships.relationship_type
        FROM 
            contacts
        LEFT JOIN 
            addresses ON contacts.contact_id = addresses.Address_contact_id
        LEFT JOIN 
            phone_numbers ON contacts.contact_id = phone_numbers.phone_contact_id
        LEFT JOIN 
            emails ON contacts.contact_id = emails.email_contact_id
        LEFT JOIN 
            relationships ON contacts.contact_id = relationships.person_id
    `;

    // Execute the query
    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error retrieving contacts:', error);
            return res.status(500).json({ error: 'Error retrieving contacts.' });
        }
        // Send the results as JSON response
        res.status(200).json({ contacts: results });
    });
});

// Get all emails
app.get('/emails', (req, res) => {
    pool.query('SELECT * FROM emails', (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

// Get all phone numbers
app.get('/phone_numbers', (req, res) => {
    pool.query('SELECT * FROM phone_numbers', (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

// Get all names and id
app.get('/IdNamesContacts', (req, res) => {
    pool.query('SELECT contact_id, name FROM contacts', (error, results) => {
        if (error) throw error;
        res.send(results);
    });
});

// Get a single contact by ID
app.get('/contacts/:contactId', (req, res) => {
    const contactId = req.params.contactId;

    // Query to retrieve data for the selected contact with associated data from other tables
    const query = `
        SELECT 
            contacts.*,
            addresses.locality,
            addresses.city,
            addresses.state,
            addresses.pin_code,
            phone_numbers.phone_number,
            phone_numbers.type AS phone_type,
            emails.email_address,
            emails.type AS email_type,
            relationships.relationship_type
        FROM 
            contacts
        LEFT JOIN 
            addresses ON contacts.contact_id = addresses.Address_contact_id
        LEFT JOIN 
            phone_numbers ON contacts.contact_id = phone_numbers.phone_contact_id
        LEFT JOIN 
            emails ON contacts.contact_id = emails.email_contact_id
        LEFT JOIN 
            relationships ON contacts.contact_id = relationships.person_id
        WHERE
            contacts.contact_id = ?
    `;

    // Execute the query with the contactId parameter
    pool.query(query, [contactId], (error, results) => {
        if (error) {
            console.error('Error retrieving contact:', error);
            return res.status(500).json({ error: 'Error retrieving contact.' });
        }
        // If the contact is not found, return a 404 status code with an error message
        if (results.length === 0) {
            return res.status(404).json({ error: 'Contact not found.' });
        }
        // Send the results for the selected contact as a JSON response
        res.status(200).json({ contact: results[0] });
    });
});



// Start server
app.listen(port, () => console.log(`PhoneBook API running on http://localhost:${port}`));
