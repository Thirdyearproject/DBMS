const express = require('express');
const pool = require('../mysqlConnection'); 
const router = express.Router();

  //add 
  router.post("/", (req, res) => {
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
      share_userid
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
                              
                              // Split share_userid string into array of user IDs
                              const shareUserIds = share_userid.split(",").map(Number);
  
                              // Insert into share table for each share_userid
                              const shareInsertPromises = shareUserIds.map(userId => {
                                return new Promise((resolve, reject) => {
                                  connection.query(
                                    "INSERT INTO share (contactid, share_userid) VALUES (?, ?)",
                                    [contactResult.insertId, userId],
                                    (error, shareResult) => {
                                      if (error) {
                                        console.error("Error inserting share:", error);
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
                                        res.status(500).json({ error: "Error creating contact." });
                                      });
                                    }
                                    connection.release();
                                    res.status(201).json({
                                      message: `Contact added with ID: ${contactResult.insertId}`,
                                    });
                                  });
                                })
                                .catch(error => {
                                  console.error("Error inserting share:", error);
                                  return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: "Error creating contact." });
                                  });
                                });
                            }
                          );
                        } else {
                          // Split share_userid string into array of user IDs
                          const shareUserIds = share_userid.split(",").map(Number);
  
                          // Insert into share table for each share_userid
                          const shareInsertPromises = shareUserIds.map(userId => {
                            return new Promise((resolve, reject) => {
                              connection.query(
                                "INSERT INTO share (contactid, share_userid) VALUES (?, ?)",
                                [contactResult.insertId, userId],
                                (error, shareResult) => {
                                  if (error) {
                                    console.error("Error inserting share:", error);
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
                                    res.status(500).json({ error: "Error creating contact." });
                                  });
                                }
                                connection.release();
                                res.status(201).json({
                                  message: `Contact added with ID: ${contactResult.insertId}`,
                                });
                              });
                            })
                            .catch(error => {
                              console.error("Error inserting share:", error);
                              return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Error creating contact." });
                              });
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
    });
  });
  
  // update
  router.put("/:contactId", (req, res) => {
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
      share_userid
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
                          
                          // Split share_userid string into array of user IDs
                          const shareUserIds = share_userid.split(',').map(userId => userId.trim());
                          
                          // Iterate over each user ID and perform separate update operations
                          shareUserIds.forEach(userId => {
                            pool.query(
                              "UPDATE share SET share_userid=? WHERE contactid=?",
                              [userId, contactId],
                              (error, shareResult) => {
                                if (error) {
                                  console.error("Error updating share:", error);
                                  // Handle the error
                                }
                                // Handle success
                              }
                            );
                          });
                          
                          res.status(200).json({
                            message: `Contact with ID ${contactId} updated successfully.`,
                          });
                        }
                      );
                    } else {
                      // Split share_userid string into array of user IDs
                      const shareUserIds = share_userid.split(',').map(userId => userId.trim());
                      
                      // Iterate over each user ID and perform separate update operations
                      shareUserIds.forEach(userId => {
                        // First, delete rows with the specified contactId
                        pool.query(
                            "DELETE FROM share WHERE contactid=?",
                            [contactId],
                            (deleteError, deleteResult) => {
                                if (deleteError) {
                                    console.error("Error deleting rows:", deleteError);
                                    // Handle the error if needed
                                } else {
                                    // After successful deletion, insert new rows
                                    pool.query(
                                        "INSERT INTO share (share_userid, contactid) VALUES (?, ?)",
                                        [userId, contactId],
                                        (insertError, insertResult) => {
                                            if (insertError) {
                                                console.error("Error inserting rows:", insertError);
                                                // Handle the error if needed
                                            } else {
                                                // Handle success
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    });                  
                      
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
  
  //delete
  router.delete("/:contactId", (req, res) => {
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

  //get 
  router.get("/", (req, res) => {
    const query = `
      SELECT c.contact_id, 
        c.userid, 
        c.name, 
        c.organization, 
        c.job_title, 
        c.date_of_birth, 
        c.website_url, 
        c.notes, 
        c.tags, 
        c.visible_to_all,
        a.Address_contact_id,
        a.locality,
        a.city,
        a.state,
        a.pin_code,
        p.phone_contact_id,
        p.phone_number1,
        p.phone_type1,
        p.phone_number2,
        p.phone_type2,
        p.phone_number3,
        p.phone_type3,
        e.email_contact_id,
        e.email_address1,
        e.email_type1,
        e.email_address2,
        e.email_type2,
        e.email_address3,
        e.email_type3,
        r.relationship_type,
        GROUP_CONCAT(s.share_userid) AS share_userids
      FROM contacts c
      LEFT JOIN addresses a ON c.contact_id = a.Address_contact_id
      LEFT JOIN phone_numbers p ON c.contact_id = p.phone_contact_id
      LEFT JOIN emails e ON c.contact_id = e.email_contact_id
      LEFT JOIN relationships r ON c.contact_id = r.person_id
      LEFT JOIN share s ON c.contact_id = s.contactid
      WHERE c.visible_to_all = 1
      GROUP BY c.contact_id,
        c.userid, 
        c.name, 
        c.organization, 
        c.job_title, 
        c.date_of_birth, 
        c.website_url, 
        c.notes, 
        c.tags, 
        c.visible_to_all,
        a.Address_contact_id,
        a.locality,
        a.city,
        a.state,
        a.pin_code,
        p.phone_contact_id,
        p.phone_number1,
        p.phone_type1,
        p.phone_number2,
        p.phone_type2,
        p.phone_number3,
        p.phone_type3,
        e.email_contact_id,
        e.email_address1,
        e.email_type1,
        e.email_address2,
        e.email_type2,
        e.email_address3,
        e.email_type3,
        r.relationship_type;
    `;
  
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error retrieving contacts:", error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        // Transform the results to parse share_userids as an array
        const contacts = results.map(contact => ({
          ...contact,
          share_userids: contact.share_userids ? contact.share_userids.split(',') : []
        }));
        
        res.json(contacts);
      }
    });
  });

  // Get contacts shared for the specified user if have permission
  router.get("/user/:userId", (req, res) => {
    const userId = req.params.userId;
    const query = `
    SELECT c.contact_id, 
       c.userid, 
       c.name, 
       c.organization, 
       c.job_title, 
       c.date_of_birth, 
       c.website_url, 
       c.notes, 
       c.tags, 
       c.visible_to_all,
       GROUP_CONCAT(DISTINCT a.locality) AS localities,
       GROUP_CONCAT(DISTINCT a.city) AS cities,
       GROUP_CONCAT(DISTINCT a.state) AS states,
       GROUP_CONCAT(DISTINCT a.pin_code) AS pin_codes,
       GROUP_CONCAT(DISTINCT p.phone_number1) AS phone_numbers1,
       GROUP_CONCAT(DISTINCT p.phone_number2) AS phone_numbers2,
       GROUP_CONCAT(DISTINCT p.phone_number3) AS phone_numbers3,
       GROUP_CONCAT(DISTINCT p.phone_type1) AS phone_types1,
       GROUP_CONCAT(DISTINCT p.phone_type2) AS phone_types2,
       GROUP_CONCAT(DISTINCT p.phone_type3) AS phone_types3,
       GROUP_CONCAT(DISTINCT e.email_address1) AS email_addresses1,
       GROUP_CONCAT(DISTINCT e.email_address2) AS email_addresses2,
       GROUP_CONCAT(DISTINCT e.email_address3) AS email_addresses3,
       GROUP_CONCAT(DISTINCT e.email_type1) AS email_types1,
       GROUP_CONCAT(DISTINCT e.email_type2) AS email_types2,
       GROUP_CONCAT(DISTINCT e.email_type3) AS email_types3
FROM contacts c
LEFT JOIN addresses a ON c.contact_id = a.Address_contact_id
LEFT JOIN phone_numbers p ON c.contact_id = p.phone_contact_id
LEFT JOIN emails e ON c.contact_id = e.email_contact_id
LEFT JOIN relationships r ON c.contact_id = r.person_id
LEFT JOIN share s ON c.contact_id = s.contactid
LEFT JOIN usershares us ON c.userid = us.current_user_id
WHERE (c.userid = ? OR (s.share_userid = ? AND us.shared_user_id = ?))
GROUP BY c.contact_id, c.userid, c.name, c.organization, c.job_title, c.date_of_birth, c.website_url, c.notes, c.tags, c.visible_to_all;


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
  ;
  

  // Get a single contact by ID
  router.get("/:contactId", (req, res) => {
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
module.exports = router;
