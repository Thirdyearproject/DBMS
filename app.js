require("dotenv").config(); // Load environment variables

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = require('./mysqlConnection');

//req
const createTables = require('./createTables');
const createTriggers = require('./createTriggers');
const signupRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const contactsRoute = require('./routes/contacts');
const filterRoute = require('./routes/filter');

createTables();
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

app.use('/signup', signupRoute);
app.use('/login', loginRoute);
app.use('/contacts', contactsRoute);//post put delete get in database
app.use('/filter',filterRoute)

// Define a route to get all usernames
app.get('/users', (req, res) => {
  // Query the database to retrieve all user IDs and usernames
  pool.query('SELECT userid, username FROM user', (error, results, fields) => {
    if (error) {
      console.error("Error retrieving user data:", error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Extract user IDs and usernames from the query results
      const userData = results.map(row => ({
        userid: row.userid,
        username: row.username
      }));
      res.json(userData);
    }
  });
});

app.get('/UserShares/:loggedUser', (req, res) => {
  const loggedUser = req.params.loggedUser;

  // Query the database to retrieve shared user IDs for the logged-in user
  pool.query('SELECT shared_user_id FROM UserShares WHERE current_user_id = ?', [loggedUser], (error, results, fields) => {
    if (error) {
      console.error("Error retrieving shared user data:", error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Extract the shared user IDs from the results
      const sharedUserIds = results.map(row => row.shared_user_id);

      res.json(sharedUserIds);
    }
  });
});
app.get('/users/:l_user', (req, res) => {
  const l_user = req.params.l_user; // Extracting the l_user parameter from the request

  // Query the database to retrieve user IDs and usernames where currentuser matches l_user
  pool.query('SELECT id FROM usershares WHERE current_user_id = ?', [l_user], (error, results, fields) => {
    if (error) {
      console.error("Error retrieving user data:", error);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Extract user IDs and usernames from the query results
      const userData = results.map(row => ({
        userid: row.id,
        currentuser: row.currentuser
      }));
      res.json(userData);
    }
  });
});

//add user share permission  with multiple share 
app.post("/userShares", (req, res) => {
  const {
    current_user_id,
    shared_user_ids
  } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Error sharing users." });
    }

    // Begin transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Error sharing users." });
      }

      // Insert share for each shared user
      const shareInsertPromises = shared_user_ids.map(sharedUserId => {
        return new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO UserShares (current_user_id, shared_user_id) VALUES (?, ?)",
            [current_user_id, sharedUserId],
            (error, shareResult) => {
              if (error) {
                console.error("Error sharing user:", error);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
      });

      // Execute all share insertions
      Promise.all(shareInsertPromises)
        .then(() => {
          // Commit transaction if everything is successful
          connection.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Error sharing users." });
              });
            }
            connection.release();
            res.status(201).json({
              message: "Users shared successfully",
            });
          });
        })
        .catch(error => {
          console.error("Error sharing users:", error);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Error sharing users." });
          });
        });
    });
  });
});

//update user share permission multiple share
app.put("/userShares/:id", (req, res) => {
  const current_user_id = req.params.id;
  const { shared_user_ids } = req.body;

  // Check if shared_user_ids is provided and not empty
  if (!shared_user_ids || shared_user_ids.length === 0) {
    return res.status(400).json({ error: "shared_user_ids must be a non-empty array." });
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection:", err);
      return res.status(500).json({ error: "Database connection error." });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        connection.release();
        return res.status(500).json({ error: "Transaction error." });
      }

      connection.query(
        "DELETE FROM UserShares WHERE current_user_id = ?",
        [current_user_id],
        (error, deleteResult) => {
          if (error) {
            console.error("Error deleting previous entries:", error);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Error deleting previous entries." });
            });
          }

          // Insert new entries for each shared_user_id
          const insertValues = shared_user_ids.map(user_id => [current_user_id, user_id]);
          connection.query(
            "INSERT INTO UserShares (current_user_id, shared_user_id) VALUES ?",
            [insertValues],
            (error, insertResult) => {
              if (error) {
                console.error("Error creating new entries:", error);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ error: "Error creating new entries." });
                });
              }

              connection.commit((err) => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: "Error committing transaction." });
                  });
                }
                connection.release();
                res.status(200).json({
                  message: `Shared users with IDs ${shared_user_ids.join(', ')} updated successfully for share ID ${current_user_id}`,
                });
              });
            }
          );
        }
      );
    });
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
