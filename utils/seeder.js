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
      share_userid1: 2,
      share_userid2: 3,
      share_userid3: 4,
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
      share_userid1: 1,
      share_userid2: 3,
      share_userid3: 4,
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
      share_userid1: 1,
      share_userid2: 2,
      share_userid3: 4,
    },
    {
      userid: 4,
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
      share_userid1: 1,
      share_userid2: 2,
      share_userid3: 3,
    },
    {
      userid: 5,
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
      share_userid1: 2,
      share_userid2: 3,
      share_userid3: 4,
    },
    {
      userid: 6,
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
      share_userid1: 1,
      share_userid2: 2,
      share_userid3: 3,
    },
    {
      userid: 7,
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
      share_userid1: 1,
      share_userid2: 2,
      share_userid3: 3,
    },
    {
      userid: 8,
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
      share_userid1: 1,
      share_userid2: 2,
      share_userid3: 4,
    },
    {
      userid: 9,
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
      share_userid1: 1,
      share_userid2: 3,
      share_userid3: 4,
    },
    {
      userid: 10,
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
      share_userid1: 2,
      share_userid2: 3,
      share_userid3: 4,
    },
  ];

  // Loop through sample data and insert into database
  sampleData.forEach((data) => {
    const {
      name,
      locality,
      city,
      state,
      pin_code,
      phone_number1,
      phone_type1,
      email_address1,
      email_type1,
      organization,
      job_title,
      date_of_birth,
      website_url,
      notes,
      tags,
      relationship_type,
    } = data;
    // Insert contact
    pool.query(
      "INSERT INTO contacts (name, organization, job_title, date_of_birth, website_url, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, organization, job_title, date_of_birth, website_url, notes, tags],
      (error, contactResult) => {
        if (error) {
          console.error("Error inserting contact:", error);
          return;
        }
        // Insert address
        pool.query(
          "INSERT INTO addresses (Address_contact_id,locality, city, state, pin_code) VALUES (?,?, ?, ?, ?)",
          [contactResult.insertId, locality, city, state, pin_code],
          (error, addressResult) => {
            if (error) {
              console.error("Error inserting address:", error);
              return;
            }

            // Insert phone number
            pool.query(
              "INSERT INTO phone_numbers (phone_contact_id,phone_number1, phone_type1) VALUES (?,?, ?)",
              [contactResult.insertId, phone_number1, phone_type1],
              (error, phoneResult) => {
                if (error) {
                  console.error("Error inserting phone number:", error);
                  return;
                }

                // Insert email
                pool.query(
                  "INSERT INTO emails (email_contact_id,email_address1, email_type1) VALUES (?,?, ?)",
                  [contactResult.insertId, email_address1, email_type1],
                  (error, emailResult) => {
                    if (error) {
                      console.error("Error inserting email:", error);
                      return;
                    }
                    // Insert relationship
                    if (relationship_type) {
                      pool.query(
                        "INSERT INTO relationships (person_id, relationship_type) VALUES (?, ?)",
                        [contactResult.insertId, relationship_type],
                        (error, relationshipResult) => {
                          if (error) {
                            console.error(
                              "Error inserting relationship:",
                              error
                            );
                            return;
                          }
                          console.log(
                            `Contact added with ID: ${contactResult.insertId}`
                          );
                        }
                      );
                    } else {
                      console.log(`data inserted`);
                      console.log(
                        `Contact added with ID: ${contactResult.insertId}`
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
};
const deleteContactsTable = () => {
  pool.query(`drop table contacts`, (error, results, fields) => {
    if (error) {
      console.error("Error creating contacts table:", error);
    } else {
      console.log("Contacts table created or already exists");
    }
  });
};
// Create addresses table
const deleteAddressesTable = () => {
  pool.query(`drop table addresses`, (error, results, fields) => {
    if (error) {
      console.error("Error creating addresses table:", error);
    } else {
      console.log("Addresses table created or already exists");
    }
  });
};

// Create phone_numbers table
const deletePhoneNumbersTable = () => {
  pool.query(`drop table phone_numbers`, (error, results, fields) => {
    if (error) {
      console.error("Error creating phone_numbers table:", error);
    } else {
      console.log("Phone Numbers table created or already exists");
    }
  });
};

// Create emails table
const deleteEmailsTable = () => {
  pool.query(`drop table emails`, (error, results, fields) => {
    if (error) {
      console.error("Error creating emails table:", error);
    } else {
      console.log("Emails table created or already exists");
    }
  });
};

// Create relationships table
const deleteRelationshipsTable = () => {
  pool.query(`drop table relationships`, (error, results, fields) => {
    if (error) {
      console.error("Error creating relationships table:", error);
    } else {
      console.log("Relationships table created or already exists");
    }
  });
};

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
        type1 VARCHAR(50),
        phone_number2 VARCHAR(15)  ,
        type2 VARCHAR(50),
        phone_number3 VARCHAR(15)  ,
        type3 VARCHAR(50),
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
        type1 VARCHAR(50),
        email_address2 VARCHAR(100)  ,
        type2 VARCHAR(50),
        email_address3 VARCHAR(100)  ,
        type3 VARCHAR(50),
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
const deleteTables = () => {
  deleteContactsTable();
  deleteRelationshipsTable();
  deleteAddressesTable();
  deletePhoneNumbersTable();
  deleteEmailsTable();
};

//deleteTables();
//initializeTables();
// Call the function to seed the database
seedDatabase();
