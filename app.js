require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MySQL connection
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
// Create contacts table
const createContactsTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS contacts (
        contact_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        organization VARCHAR(100),
        job_title VARCHAR(100),
        date_of_birth DATE,
        website_url VARCHAR(255),
        notes TEXT,
        tags VARCHAR(255)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating contacts table:", error);
      } else {
        console.log("Contacts table created or already exists");
      }
    }
  );
};
// Create addresses table
const createAddressesTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS addresses (
        address_id INT AUTO_INCREMENT PRIMARY KEY,
        Address_contact_id INT,
        locality VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(100),
        pin_code VARCHAR(20),     
        FOREIGN KEY (Address_contact_id) REFERENCES contacts(contact_id)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating addresses table:", error);
      } else {
        console.log("Addresses table created or already exists");
      }
    }
  );
};

// Create phone_numbers table
const createPhoneNumbersTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS phone_numbers (
        phone_number_id INT AUTO_INCREMENT PRIMARY KEY,
        phone_contact_id INT,
        phone_number1 VARCHAR(15)  ,
        phone_type1 VARCHAR(50),
        phone_number2 VARCHAR(15)  ,
        phone_type2 VARCHAR(50),
        phone_number3 VARCHAR(15)  ,
        phone_type3 VARCHAR(50),
        FOREIGN KEY (phone_contact_id) REFERENCES contacts(contact_id)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating phone_numbers table:", error);
      } else {
        console.log("Phone Numbers table created or already exists");
      }
    }
  );
};

// Create emails table
const createEmailsTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS emails (
        email_id INT AUTO_INCREMENT PRIMARY KEY,
        email_contact_id INT,
        email_address1 VARCHAR(100)  ,
        email_type1 VARCHAR(50),
        email_address2 VARCHAR(100)  ,
        email_type2 VARCHAR(50),
        email_address3 VARCHAR(100)  ,
        email_type3 VARCHAR(50),
        FOREIGN KEY (email_contact_id) REFERENCES contacts(contact_id)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating emails table:", error);
      } else {
        console.log("Emails table created or already exists");
      }
    }
  );
};

// Create relationships table
const createRelationshipsTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS relationships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        person_id INT,
        relationship_type VARCHAR(100),
        FOREIGN KEY (person_id) REFERENCES contacts(contact_id)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating relationships table:", error);
      } else {
        console.log("Relationships table created or already exists");
      }
    }
  );
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

app.post("/contacts", (req, res) => {
  const {
    name,
    locality,
    city,
    state,
    pin_code,
    phone_number1,
    phone_type1,
    phone_number2,
    phone_type2,
    phone_number3,
    phone_type3,
    email_address1,
    email_type1,
    email_address2,
    email_type2,
    email_address3,
    email_type3,
    organization,
    job_title,
    date_of_birth,
    website_url,
    notes,
    tags,
    relationship_type,
  } = req.body;

  // Insert contact
  pool.query(
    "INSERT INTO contacts (name, organization, job_title, date_of_birth, website_url, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, organization, job_title, date_of_birth, website_url, notes, tags],
    (error, contactResult) => {
      if (error) {
        console.error("Error inserting contact:", error);
        return res.status(500).json({ error: "Error creating contact." });
      }
      pool.query(
        "INSERT INTO addresses (Address_contact_id,locality, city, state, pin_code) VALUES (?,?, ?, ?, ?)",
        [contactResult.insertId, locality, city, state, pin_code],
        (error, addressResult) => {
          if (error) {
            console.error("Error inserting address:", error);
            return res.status(500).json({ error: "Error creating contact." });
          }

          // Insert phone number
          pool.query(
            "INSERT INTO phone_numbers (phone_contact_id, phone_number1, phone_type1, phone_number2, phone_type2, phone_number3, phone_type3) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              contactResult.insertId,
              phone_number1,
              phone_type1,
              phone_number2,
              phone_type2,
              phone_number3,
              phone_type3,
            ],
            (error, phoneResult) => {
              if (error) {
                console.error("Error inserting phone number:", error);
                return res
                  .status(500)
                  .json({ error: "Error creating contact." });
              }

              // Insert email
              pool.query(
                "INSERT INTO emails (email_contact_id, email_address1, email_type1, email_address2, email_type2, email_address3, email_type3) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                  contactResult.insertId,
                  email_address1,
                  email_type1,
                  email_address2,
                  email_type2,
                  email_address3,
                  email_type3,
                ],
                (error, emailResult) => {
                  if (error) {
                    console.error("Error inserting email:", error);
                    return res
                      .status(500)
                      .json({ error: "Error creating contact." });
                  }

                  // Insert relationship
                  if (relationship_type) {
                    pool.query(
                      "INSERT INTO relationships (person_id, relationship_type) VALUES (?, ?)",
                      [contactResult.insertId, relationship_type],
                      (error, relationshipResult) => {
                        if (error) {
                          console.error("Error inserting relationship:", error);
                          return res
                            .status(500)
                            .json({ error: "Error creating relationship." });
                        }
                        res.status(201).json({
                          message: `Contact added with ID: ${contactResult.insertId}`,
                        });
                      }
                    );
                  } else {
                    res.status(201).json({
                      message: `Contact added with ID: ${contactResult.insertId}`,
                    });
                  }
                }
              );
            }
          );
        }
      );
    }
  );
});

app.put("/contacts/:contactId", (req, res) => {
  const contactId = req.params.contactId;
  const {
    name,
    locality,
    city,
    state,
    pin_code,
    phone_number1,
    phone_type1,
    phone_number2,
    phone_type2,
    phone_number3,
    phone_type3,
    email_address1,
    email_type1,
    email_address2,
    email_type2,
    email_address3,
    email_type3,
    organization,
    job_title,
    date_of_birth,
    website_url,
    notes,
    tags,
    relationship_type,
  } = req.body;

  // Update contact
  pool.query(
    "UPDATE contacts SET name=?, organization=?, job_title=?, date_of_birth=?, website_url=?, notes=?, tags=? WHERE contact_id=?",
    [
      name,
      organization,
      job_title,
      date_of_birth,
      website_url,
      notes,
      tags,
      contactId,
    ],
    (error, contactResult) => {
      if (error) {
        console.error("Error updating contact:", error);
        return res.status(500).json({ error: "Error updating contact." });
      }

      // Update address
      pool.query(
        "UPDATE addresses SET locality=?, city=?, state=?, pin_code=? WHERE Address_contact_id=?",
        [locality, city, state, pin_code, contactId],
        (error, addressResult) => {
          if (error) {
            console.error("Error updating address:", error);
            return res.status(500).json({ error: "Error updating address." });
          }

          // Update phone number
          pool.query(
            "UPDATE phone_numbers SET phone_number1=?, phone_type1=?,phone_number2=?, phone_type2=?,phone_number3=?, phone_type3=? WHERE phone_contact_id=?",
            [
              phone_number1,
              phone_type1,
              phone_number2,
              phone_type2,
              phone_number3,
              phone_type3,
              contactId,
            ],
            (error, phoneResult) => {
              if (error) {
                console.error("Error updating phone number:", error);
                return res
                  .status(500)
                  .json({ error: "Error updating phone number." });
              }

              // Update email
              pool.query(
                "UPDATE emails SET email_address1=?, email_type1=?,email_address2=?, email_type2=?,email_address3=?, email_type3=? WHERE email_contact_id=?",
                [
                  email_address1,
                  email_type1,
                  email_address2,
                  email_type2,
                  email_address3,
                  email_type3,
                  contactId,
                ],
                (error, emailResult) => {
                  if (error) {
                    console.error("Error updating email:", error);
                    return res
                      .status(500)
                      .json({ error: "Error updating email." });
                  }

                  // Update relationship
                  if (relationship_type) {
                    pool.query(
                      "UPDATE relationships SET relationship_type=? WHERE person_id=?",
                      [relationship_type, contactId],
                      (error, relationshipResult) => {
                        if (error) {
                          console.error("Error updating relationship:", error);
                          return res
                            .status(500)
                            .json({ error: "Error updating relationship." });
                        }
                        res.status(200).json({
                          message: `Contact with ID ${contactId} updated successfully.`,
                        });
                      }
                    );
                  } else {
                    res.status(200).json({
                      message: `Contact with ID ${contactId} updated successfully.`,
                    });
                  }
                }
              );
            }
          );
        }
      );
    }
  );
});

app.delete("/contacts/:contactId", (req, res) => {
  const contactId = req.params.contactId;

  // Delete associated records first (addresses, phone numbers, emails, relationships)
  pool.query(
    "DELETE FROM addresses WHERE Address_contact_id = ?",
    [contactId],
    (error, addressResult) => {
      if (error) {
        console.error("Error deleting addresses:", error);
        return res.status(500).json({ error: "Error deleting addresses." });
      }

      pool.query(
        "DELETE FROM phone_numbers WHERE phone_contact_id = ?",
        [contactId],
        (error, phoneResult) => {
          if (error) {
            console.error("Error deleting phone numbers:", error);
            return res
              .status(500)
              .json({ error: "Error deleting phone numbers." });
          }

          pool.query(
            "DELETE FROM emails WHERE email_contact_id = ?",
            [contactId],
            (error, emailResult) => {
              if (error) {
                console.error("Error deleting emails:", error);
                return res
                  .status(500)
                  .json({ error: "Error deleting emails." });
              }

              pool.query(
                "DELETE FROM relationships WHERE person_id = ?",
                [contactId],
                (error, relationshipResult) => {
                  if (error) {
                    console.error("Error deleting relationships:", error);
                    return res
                      .status(500)
                      .json({ error: "Error deleting relationships." });
                  }

                  // Once associated records are deleted, delete the contact
                  pool.query(
                    "DELETE FROM contacts WHERE contact_id = ?",
                    [contactId],
                    (error, contactResult) => {
                      if (error) {
                        console.error("Error deleting contact:", error);
                        return res
                          .status(500)
                          .json({ error: "Error deleting contact." });
                      }
                      res.status(200).json({
                        message: `Contact with ID ${contactId} and associated records deleted successfully.`,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get all contacts
app.get("/contacts", (req, res) => {
  const query = `
        SELECT c.*, 
               a.*, 
               p.*, 
               e.*, 
               r.relationship_type 
        FROM contacts c
        LEFT JOIN addresses a ON c.contact_id = a.Address_contact_id
        LEFT JOIN phone_numbers p ON c.contact_id = p.phone_contact_id
        LEFT JOIN emails e ON c.contact_id = e.email_contact_id
        LEFT JOIN relationships r ON c.contact_id = r.person_id
    `;

  pool.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving contacts:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(results);
    }
  });
});
// Get all emails
app.get("/emails", (req, res) => {
  pool.query("SELECT * FROM emails", (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// Get all phone numbers
app.get("/phone_numbers", (req, res) => {
  pool.query("SELECT * FROM phone_numbers", (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// Get all names and id
app.get("/IdNamesContacts", (req, res) => {
  pool.query("SELECT contact_id, name FROM contacts", (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// Get a single contact by ID
app.get("/contacts/:contactId", (req, res) => {
  const contactId = req.params.contactId;
  const query = `
        SELECT c.*, 
               a.*, 
               p.*, 
               e.*, 
               r.relationship_type 
        FROM contacts c
        LEFT JOIN addresses a ON c.contact_id = a.Address_contact_id
        LEFT JOIN phone_numbers p ON c.contact_id = p.phone_contact_id
        LEFT JOIN emails e ON c.contact_id = e.email_contact_id
        LEFT JOIN relationships r ON c.contact_id = r.person_id
        WHERE c.contact_id = ?
    `;

  pool.query(query, [contactId], (error, results) => {
    if (error) {
      console.error("Error retrieving contact:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: "Contact not found" });
      } else {
        res.json(results[0]); // Return the first result (assuming contact_id is unique)
      }
    }
  });
});

function determineRelationship(relationAB, relationBC) {
  if (relationAB === "Friend" && relationBC === "Friend") {
    return "Friend";
  }

  if (relationAB === "Work Colleague" && relationBC === "Work Colleague") {
    return "Work Colleague";
  }

  if (relationAB === "Mother" && relationBC === "Father") {
    return "Husband and Wife";
  }

  if (relationAB === "Relation1" && relationBC === "Relation1") {
    return "Result1";
  }

  if (relationAB === "Relation2" && relationBC === "Relation2") {
    return "Result2";
  }

  if (relationAB === "Relation3" && relationBC === "Relation3") {
    return "Result3";
  }

  if (relationAB === "Sibling" && relationBC === "Sibling") {
    return "Cousin";
  }

  if (relationAB === "Friend" && relationBC === "Work Colleague") {
    return "Business Partner";
  }

  if (relationAB === "Mother" && relationBC === "Son") {
    return "Grandmother";
  }

  return "No direct relationship found";
}

app.get("/relationship/:personA/:personC", (req, res) => {
  const personA = req.params.personA;
  const personC = req.params.personC;

  const queryAB =
    "SELECT relationship_type FROM relationships WHERE person_id = ?";

  const queryBC =
    "SELECT relationship_type FROM relationships WHERE person_id = ?";

  // query execution in parallel -> for getting results faster
  Promise.all([
    new Promise((resolve, reject) => {
      pool.query(queryAB, [personA], (error, results) => {
        if (error) reject(error);
        else resolve(results.length > 0 ? results[0].relationship_type : null);
      });
    }),
    new Promise((resolve, reject) => {
      pool.query(queryBC, [personC], (error, results) => {
        if (error) reject(error);
        else resolve(results.length > 0 ? results[0].relationship_type : null);
      });
    }),
  ])
    .then(([relationAB, relationBC]) => {
      const relationship = determineRelationship(relationAB, relationBC);
      res.json({ relationship });
    })
    .catch((error) => {
      console.error("Error determining relationship:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Start server
app.listen(port, () =>
  console.log(`PhoneBook API running on http://localhost:${port}`)
);
