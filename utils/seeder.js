// Import necessary modules
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mysql = require("mysql2");

// MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Function to add sample data to the database
const seedDatabase = () => {
  // Sample data
  const sampleData = [
    {
      userid: 1,
      name: "John Doe",
      locality: "123 Main Street",
      city: "Anytown",
      state: "California",
      pin_code: "90210",
      phone_number1: "1234567890",
      phone_type1: "Work",
      phone_number2: "9876543210",
      phone_type2: "Home",
      email_address1: "john.doe@example.com",
      email_type1: "Personal",
      organization: "Tech Solutions Inc.",
      job_title: "CEO",
      date_of_birth: "1990-01-01",
      website_url: "http://www.johndoe.com",
      notes: "Met at a conference last year.",
      tags: "friend, colleague",
      relationship_type: "Friend",
      visible_to_all: true,
      share_userid: 2,
    },
    {
      userid: 2,
      name: "Alice Smith",
      locality: "456 Elm St",
      city: "Springfield",
      state: "Illinois",
      pin_code: "62701",
      phone_number1: "9876543211",
      phone_type1: "Mobile",
      phone_number2: "1234567890",
      phone_type2: "Home",
      email_address1: "alice.smith@example.com",
      email_type1: "Work",
      organization: "Tech Solutions Inc.",
      job_title: "Software Engineer",
      date_of_birth: "1985-09-15",
      website_url: "http://www.alicesmith.com",
      notes: "Met at a conference last year.",
      tags: "colleague, friend",
      relationship_type: "Colleague",
      visible_to_all: false,
      share_userid: 1,
    },
    {
      userid: 3,
      name: "Bob Johnson",
      locality: "789 Oak St",
      city: "Oakland",
      state: "California",
      pin_code: "94612",
      phone_number1: "5559876542",
      phone_type1: "Mobile",
      phone_number2: "5551234567",
      phone_type2: "Home",
      email_address1: "bob.johnson@example.com",
      email_type1: "Personal",
      organization: "ABC Corporation",
      job_title: "Marketing Manager",
      date_of_birth: "1978-04-25",
      website_url: "http://www.bobjohnson.com",
      notes: "Childhood friend.",
      tags: "friend",
      relationship_type: "Friend",
      visible_to_all: true,
      share_userid: 1,
    },
    {
      userid: 1,
      name: "Emily Davis",
      locality: "321 Pine St",
      city: "Seattle",
      state: "Washington",
      pin_code: "98101",
      phone_number1: "5557890123",
      phone_type1: "Work",
      phone_number2: "5551234567",
      phone_type2: "Home",
      email_address1: "emily.davis@example.com",
      email_type1: "Work",
      organization: "XYZ Corporation",
      job_title: "HR Manager",
      date_of_birth: "1990-12-08",
      website_url: "http://www.emilydavis.com",
      notes: "Met through a mutual friend.",
      tags: "acquaintance",
      relationship_type: "Acquaintance",
      visible_to_all: false,
      share_userid: 2,
    },
    {
      userid: 2,
      name: "David Wilson",
      locality: "101 Maple St",
      city: "New York",
      state: "New York",
      pin_code: "10001",
      phone_number1: "5552345658",
      phone_type1: "Mobile",
      phone_number2: "5559876543",
      phone_type2: "Home",
      email_address1: "david.wilson@example.com",
      email_type1: "Personal",
      organization: "Finance Solutions LLC",
      job_title: "Financial Analyst",
      date_of_birth: "1982-07-20",
      website_url: "http://www.davidwilson.com",
      notes: "Former college roommate.",
      tags: "friend",
      relationship_type: "Friend",
      visible_to_all: true,
      share_userid:3,
    },
    {
      userid: 3,
      name: "Grace Brown",
      locality: "222 Chestnut St",
      city: "Boston",
      state: "Massachusetts",
      pin_code: "02108",
      phone_number1: "5553456799",
      phone_type1: "Home",
      phone_number2: "5559876543",
      phone_type2: "Work",
      email_address1: "grace.brown@example.com",
      email_type1: "Personal",
      organization: "Law Firm LLP",
      job_title: "Lawyer",
      date_of_birth: "1975-03-12",
      website_url: "http://www.gracebrown.com",
      notes: "High school classmate.",
      tags: "friend",
      relationship_type: "Friend",
      visible_to_all: false,
      share_userid: 1,
    },
    {
      userid: 1,
      name: "Michael Johnson",
      locality: "777 Elm St",
      city: "Springfield",
      state: "Illinois",
      pin_code: "62701",
      phone_number1: "5555778888",
      phone_type1: "Home",
      phone_number2: "5559998888",
      phone_type2: "Work",
      email_address1: "michael.johnson@example.com",
      email_type1: "Work",
      organization: "Tech Solutions Inc.",
      job_title: "Software Engineer",
      date_of_birth: "7-11-20",
      website_url: "http://www.michaeljohnson.com",
      notes: "Met at a tech conference.",
      tags: "colleague",
      relationship_type: "Colleague",
      visible_to_all: true,
      share_userid: 2,
    },
    {
      userid: 2,
      name: "Sophia Lee",
      locality: "888 Maple St",
      city: "New York",
      state: "New York",
      pin_code: "10001",
      phone_number1: "5558889989",
      phone_type1: "Mobile",
      phone_number2: "5557778888",
      phone_type2: "Home",
      email_address1: "sophia.lee@example.com",
      email_type1: "Personal",
      organization: "Tech Solutions Inc.",
      job_title: "Data Analyst",
      date_of_birth: "1989-05-15",
      website_url: "http://www.sophialee.com",
      notes: "Met at a data science meetup.",
      tags: "acquaintance",
      relationship_type: "Acquaintance",
      visible_to_all: false,
      share_userid: 1,
    },
    {
      userid: 3,
      name: "Oliver Martinez",
      locality: "555 Oak St",
      city: "Oakland",
      state: "California",
      pin_code: "94612",
      phone_number1: "5555851234",
      phone_type1: "Work",
      phone_number2: "5555554321",
      phone_type2: "Home",
      email_address1: "oliver.martinez@example.com",
      email_type1: "Work",
      organization: "ABC Corporation",
      job_title: "Marketing Manager",
      date_of_birth: "1980-08-10",
      website_url: "http://www.olivermartinez.com",
      notes: "Met during a marketing conference.",
      tags: "colleague",
      relationship_type: "Colleague",
      visible_to_all: true,
      share_userid: 1,
    },
    {
      userid: 1,
      name: "Emma Thompson",
      locality: "999 Pine St",
      city: "Seattle",
      state: "Washington",
      pin_code: "98101",
      phone_number1: "5559998188",
      phone_type1: "Home",
      phone_number2: "5557778888",
      phone_type2: "Work",
      email_address1: "emma.thompson@example.com",
      email_type1: "Personal",
      organization: "XYZ Corporation",
      job_title: "HR Manager",
      date_of_birth: "1983-12-05",
      website_url: "http://www.emmathompson.com",
      notes: "Met through a mutual friend.",
      tags: "acquaintance",
      relationship_type: "Acquaintance",
      visible_to_all: false,
      share_userid: 2,
    },
  ];

  // Loop through sample data and insert into database
  sampleData.forEach((data) => {
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
      share_userid,
    }=data;
  
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return 
      }
  
      // Begin transaction
      connection.beginTransaction((err) => {
        if (err) {
          console.error("Error beginning transaction:", err);
          connection.release();
          return 
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
                                });
                              }
                              
                              // Insert into share table
                              connection.query(
                                "INSERT INTO share (contactid, share_userid) VALUES (?, ?)",
                                [contactResult.insertId, share_userid],
                                (error, shareResult) => {
                                  if (error) {
                                    console.error("Error inserting share:", error);
                                    return connection.rollback(() => {
                                      connection.release();
                                      
                                    });
                                  }
                                  // Commit transaction if everything is successful
                                  connection.commit((err) => {
                                    if (err) {
                                      console.error("Error committing transaction:", err);
                                      return connection.rollback(() => {
                                        connection.release();
                                        
                                      });
                                    }
                                    connection.release();
                                  });
                                }
                              );
                            }
                          );
                        } else {
                          // Insert into share table
                          connection.query(
                            "INSERT INTO share (contactid, share_userid) VALUES (?, ?)",
                            [contactResult.insertId, share_userid],
                            (error, shareResult) => {
                              if (error) {
                                console.error("Error inserting share:", error);
                                return connection.rollback(() => {
                                  connection.release();
                                  
                                });
                              }
                              // Commit transaction if everything is successful
                              connection.commit((err) => {
                                if (err) {
                                  console.error("Error committing transaction:", err);
                                  return connection.rollback(() => {
                                    connection.release();
                                    
                                  });
                                }
                                connection.release();

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
    });})
    console.log("Database seeding completed.");
  };

 

//deleteTables();
//initializeTables();
// Call the function to seed the database
seedDatabase();
