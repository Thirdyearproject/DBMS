require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = require('./mysqlConnection');

const createTables = require('./createTables');
// Call the function to create tables when the application starts
createTables();

const createTriggers = require('./createTriggers');

// Call the function to create triggers when the application starts
createTriggers();

// Function to handle contact insertion with transaction
const insertContactWithTransaction = (contactData) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      // Begin transaction
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }

        // Insert contact
        connection.query("INSERT INTO contacts SET ?", contactData, (err, contactResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              reject(err);
            });
          }

          // Insert address, phone numbers, emails, relationships here

          // Commit transaction
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                reject(err);
              });
            }

            connection.release();
            resolve(contactResult.insertId); // Resolve with inserted contact ID
          });
        });
      });
    });
  });
};

// Signup Route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  pool.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, password], (error, results) => {
    if (error) {
      console.error('Error signing up:', error);
      return res.status(500).json({ error: 'Error signing up' });
    }

    res.status(201).json({ message: 'Signup successful' });
  });
});

// Login Route return user id
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT userid FROM user WHERE username = ? AND password = ?', [username, password], (error, results) => {
    if (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ error: 'Error logging in' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userId = results[0].id; // Assuming id is the column name for user ID
    res.status(200).json({ message: 'Login successful', userId: userId });
  });
});


app.post("/contacts", (req, res) => {
  const {
    userid,
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
    visible_to_all,
    share_userid1,
    share_userid2,
    share_userid3
  } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Error creating contact." });
    }

    // Begin transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Error creating contact." });
      }

      // Insert contact
      connection.query(
        "INSERT INTO contacts (userid, name, organization, job_title, date_of_birth, website_url, notes, tags, visible_to_all) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userid, name, organization, job_title, date_of_birth, website_url, notes, tags, visible_to_all],
        (error, contactResult) => {
          if (error) {
            console.error("Error inserting contact:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Error creating contact." });
            });
          }

          // Insert address
          connection.query(
            "INSERT INTO addresses (Address_contact_id, locality, city, state, pin_code) VALUES (?,?,?,?,?)",
            [contactResult.insertId, locality, city, state, pin_code],
            (error, addressResult) => {
              if (error) {
                console.error("Error inserting address:", error);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Error creating contact." });
                });
              }

              // Insert phone number
              connection.query(
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
                    return connection.rollback(() => {
                      connection.release();
                      res.status(500).json({ error: "Error creating contact." });
                    });
                  }

                  // Insert email
                  connection.query(
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
                        return connection.rollback(() => {
                          connection.release();
                          res.status(500).json({ error: "Error creating contact." });
                        });
                      }

                      // Insert relationship
                      if (relationship_type) {
                        connection.query(
                          "INSERT INTO relationships (person_id, relationship_type) VALUES (?, ?)",
                          [contactResult.insertId, relationship_type],
                          (error, relationshipResult) => {
                            if (error) {
                              console.error("Error inserting relationship:", error);
                              return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Error creating relationship." });
                              });
                            }
                            
                            // Insert into share table
                            connection.query(
                              "INSERT INTO share (contactid, share_userid1, share_userid2, share_userid3) VALUES (?, ?, ?, ?)",
                              [contactResult.insertId, share_userid1, share_userid2, share_userid3],
                              (error, shareResult) => {
                                if (error) {
                                  console.error("Error inserting share:", error);
                                  return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: "Error creating contact." });
                                  });
                                }
                                // Commit transaction if everything is successful
                                connection.commit((err) => {
                                  if (err) {
                                    console.error("Error committing transaction:", err);
                                    return connection.rollback(() => {
                                      connection.release();
                                      res.status(500).json({ error: "Error creating contact." });
                                    });
                                  }
                                  connection.release();
                                  res.status(201).json({
                                    message: `Contact added with ID: ${contactResult.insertId}`,
                                  });
                                });
                              }
                            );
                          }
                        );
                      } else {
                        // Insert into share table
                        connection.query(
                          "INSERT INTO share (contactid, share_userid1, share_userid2, share_userid3) VALUES (?, ?, ?, ?)",
                          [contactResult.insertId, share_userid1, share_userid2, share_userid3],
                          (error, shareResult) => {
                            if (error) {
                              console.error("Error inserting share:", error);
                              return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Error creating contact." });
                              });
                            }
                            // Commit transaction if everything is successful
                            connection.commit((err) => {
                              if (err) {
                                console.error("Error committing transaction:", err);
                                return connection.rollback(() => {
                                  connection.release();
                                  res.status(500).json({ error: "Error creating contact." });
                                });
                              }
                              connection.release();
                              res.status(201).json({
                                message: `Contact added with ID: ${contactResult.insertId}`,
                              });
                            });
                          }
                        );
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
  });
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
    share_userid1,
    share_userid2,
    share_userid3
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
                        
                        // Update share
                        pool.query(
                          "UPDATE share SET share_userid1=?, share_userid2=?, share_userid3=? WHERE contactid=?",
                          [share_userid1, share_userid2, share_userid3, contactId],
                          (error, shareResult) => {
                            if (error) {
                              console.error("Error updating share:", error);
                              return res
                                .status(500)
                                .json({ error: "Error updating share." });
                            }
                            res.status(200).json({
                              message: `Contact with ID ${contactId} updated successfully.`,
                            });
                          }
                        );
                      }
                    );
                  } else {
                    // Update share
                    pool.query(
                      "UPDATE share SET share_userid1=?, share_userid2=?, share_userid3=? WHERE contactid=?",
                      [share_userid1, share_userid2, share_userid3, contactId],
                      (error, shareResult) => {
                        if (error) {
                          console.error("Error updating share:", error);
                          return res
                            .status(500)
                            .json({ error: "Error updating share." });
                        }
                        res.status(200).json({
                          message: `Contact with ID ${contactId} updated successfully.`,
                        });
                      }
                    );
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

  // Delete associated records first (addresses, phone numbers, emails, relationships, share)
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

                  // Delete from share table
                  pool.query(
                    "DELETE FROM share WHERE contactid = ?",
                    [contactId],
                    (error, shareResult) => {
                      if (error) {
                        console.error("Error deleting share:", error);
                        return res
                          .status(500)
                          .json({ error: "Error deleting share." });
                      }

                      // Once associated records and share entry are deleted, delete the contact
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
    }
  );
});


// Get all contacts visible to all users
app.get("/contacts", (req, res) => {
  const query = `
      SELECT c.*, 
      a.*, 
      p.*, 
      e.*, 
      r.relationship_type,
      s.share_userid1,
      s.share_userid2,
      s.share_userid3
    FROM contacts c
    LEFT JOIN addresses a ON c.contact_id = a.Address_contact_id
    LEFT JOIN phone_numbers p ON c.contact_id = p.phone_contact_id
    LEFT JOIN emails e ON c.contact_id = e.email_contact_id
    LEFT JOIN relationships r ON c.contact_id = r.person_id
    LEFT JOIN share s ON c.contact_id = s.contactid
    WHERE c.visible_to_all = 1

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

// Get contacts shared with the current user
app.get("/contacts/:userId", (req, res) => {
  const userId = req.params.userId;

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
    INNER JOIN share s ON c.contact_id = s.contactid
    WHERE s.share_userid1 = ? OR s.share_userid2 = ? OR s.share_userid3 = ?
  `;

  pool.query(query, [userId, userId, userId], (error, results) => {
    if (error) {
      console.error("Error retrieving shared contacts:", error);
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

app.get('/filter', (req, res) => {
  const { searchQuery, city, dateOfBirthStart, dateOfBirthEnd, organization, job, relation } = req.query;

  let query = `
    SELECT c.*
    FROM contacts c
    INNER JOIN addresses a ON c.contact_id = a.Address_contact_id
    WHERE 1
  `;
  let queryParams = [];

  if (searchQuery) {
    query += ' AND LOWER(c.name) LIKE ?';
    queryParams.push('%' + searchQuery.toLowerCase() + '%');
  }

  if (city) {
    query += ' AND LOWER(a.city) = ?';
    queryParams.push(city.toLowerCase());
  }

  if (dateOfBirthStart && dateOfBirthEnd) {
    query += ' AND c.date_of_birth BETWEEN ? AND ?';
    queryParams.push(dateOfBirthStart, dateOfBirthEnd);
  }

  if (organization) {
    query += ' AND LOWER(c.organization) LIKE ?';
    queryParams.push('%' + organization.toLowerCase() + '%');
  }

  if (job) {
    query += ' AND LOWER(c.job_title) LIKE ?';
    queryParams.push('%' + job.toLowerCase() + '%');
  }

  if (relation) {
    query += ' AND LOWER(c.relation) LIKE ?';
    queryParams.push('%' + relation.toLowerCase() + '%');
  }

  pool.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (results.length === 0) { // Check if no contacts found
      res.status(404).json({ message: 'No contacts found based on the provided criteria' });
    } else {
      res.json(results);
    }
  });
});


// Start server
app.listen(port, () =>
  console.log(`PhoneBook API running on http://localhost:${port}`)
);
