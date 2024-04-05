// Import the MySQL connection pool
const pool = require('./mysqlConnection'); // Adjust the path as needed

// Function to create tables
function createTables() {

  // Function to create the user table
  const createUserTable = () => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS user (
        userid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL
      )`,
      (error, results, fields) => {
        if (error) {
          console.error("Error creating user table:", error);
        } else {
          console.log("User table created or already exists");
        }
      }
    );
  };
  

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
        tags VARCHAR(255),
        userid INT,
        visible_to_all BOOLEAN 
    );`,
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
  
  const createShareTable = () => {
    pool.query(
      `CREATE TABLE IF NOT EXISTS share (
        contactid INT,
        share_userid INT,
        PRIMARY KEY (contactid, share_userid),
        FOREIGN KEY (contactid) REFERENCES contacts(contact_id)
      )`,
      (error, results, fields) => {
        if (error) {
          console.error("Error creating share table:", error);
        } else {
          console.log("Share table created or already exists");
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

  // Function to create the UserShares table
const createUserSharesTable = () => {
  pool.query(
    `CREATE TABLE IF NOT EXISTS UserShares (
      id SERIAL PRIMARY KEY,
      current_user_id INT NOT NULL,
      shared_user_id INT NOT NULL,
      CONSTRAINT unique_user_pair UNIQUE (current_user_id, shared_user_id)
    )`,
    (error, results, fields) => {
      if (error) {
        console.error("Error creating UserShares table:", error);
      } else {
        console.log("UserShares table created or already exists");
      }
    }
  );
};  
  // Initialize tables
  const initializeTables = () => {
    createContactsTable();
    createUserTable();
    createShareTable();
    createRelationshipsTable();
    createAddressesTable();
    createPhoneNumbersTable();
    createEmailsTable();
    createUserSharesTable();
  };
  initializeTables();
  
}
module.exports = createTables;