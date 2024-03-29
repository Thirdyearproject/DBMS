// Import the MySQL connection pool
const pool = require('./mysqlConnection'); // Adjust the path as needed

// Function to create triggers
function createTriggers() {
    // Function to create the unique phone number trigger
  const createUniquePhoneNumberTrigger = () => {
    const checkTriggerQuery = `
        SELECT * FROM information_schema.triggers 
        WHERE trigger_name = 'unique_phone_number1' 
        AND trigger_schema = DATABASE()`;
  
    // Execute query to check if the trigger already exists
    pool.query(checkTriggerQuery, (error, results, fields) => {
        if (error) {
            console.error("Error checking unique_phone_number1 trigger:", error);
            return;
        }
        
        if (results.length === 0) {
            const createTriggerQuery = `
                CREATE TRIGGER unique_phone_number1
                BEFORE INSERT ON phone_numbers
                FOR EACH ROW
                BEGIN
                    DECLARE existing_count INT;
                    SELECT COUNT(*) INTO existing_count FROM phone_numbers WHERE phone_number1 = NEW.phone_number1;
                    IF existing_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number1 must be unique for each contact';
                    END IF;
                END`;
        
            // Execute query to create the trigger
            pool.query(createTriggerQuery, (error, results, fields) => {
                if (error) {
                    console.error("Error creating unique_phone_number1 trigger:", error);
                } else {
                    console.log("unique_phone_number1 trigger created successfully");
                }
            });
        } else {
            console.log("unique_phone_number1 trigger already exists");
        }
    });
  };
  
  // Function to create the trigger for phone number length check
  const createPhoneNumberLengthTrigger = () => {
    const checkTriggerQuery = `
        SELECT * FROM information_schema.triggers 
        WHERE trigger_name = 'check_phone_number_length' 
        AND trigger_schema = DATABASE()`;
  
    // Execute query to check if the trigger already exists
    pool.query(checkTriggerQuery, (error, results, fields) => {
        if (error) {
            console.error("Error checking check_phone_number_length trigger:", error);
            return;
        }
        
        if (results.length === 0) {
            const createTriggerQuery = `
                CREATE TRIGGER check_phone_number_length
                BEFORE INSERT ON phone_numbers
                FOR EACH ROW
                BEGIN
                    IF LENGTH(NEW.phone_number1) != 10 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be 10 digits long';
                    END IF;
                    IF NEW.phone_number2 IS NOT NULL AND LENGTH(NEW.phone_number2) != 10 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be 10 digits long';
                    END IF;
                    IF NEW.phone_number3 IS NOT NULL AND LENGTH(NEW.phone_number3) != 10 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be 10 digits long';
                    END IF;
                END`;
        
            // Execute query to create the trigger
            pool.query(createTriggerQuery, (error, results, fields) => {
                if (error) {
                    console.error("Error creating check_phone_number_length trigger:", error);
                } else {
                    console.log("check_phone_number_length trigger created successfully");
                }
            });
        } else {
            console.log("check_phone_number_length trigger already exists");
        }
    });
  };
  const initializeTriggers = () => {
    createPhoneNumberLengthTrigger();
    createUniquePhoneNumberTrigger();
  };
  initializeTriggers();
}
module.exports = createTriggers;