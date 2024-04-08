// Import the MySQL connection pool
const pool = require('./mysqlConnection'); // Adjust the path as needed

// Function to create triggers
function createTriggers() {

    // Function to drop trigger if it already exists
    const dropTriggerIfExists = (triggerName) => {
        const dropTriggerQuery = `DROP TRIGGER IF EXISTS ${triggerName}`;

        // Execute query to drop the trigger if it exists
        pool.query(dropTriggerQuery, (error, results, fields) => {
            if (error) {
                console.error(`Error dropping ${triggerName} trigger:`, error);
            } else {
                console.log(`${triggerName} trigger dropped successfully if it existed`);
            }
        });
    };

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
                    IF (NEW.phone_number1 IS NOT NULL AND LENGTH(NEW.phone_number1) != 10 AND NEW.phone_number1 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
                    END IF;
                    
                    IF (NEW.phone_number2 IS NOT NULL AND LENGTH(NEW.phone_number2) != 10 AND NEW.phone_number2 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
                    END IF;
                
                    IF (NEW.phone_number3 IS NOT NULL AND LENGTH(NEW.phone_number3) != 10 AND NEW.phone_number3 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
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

    const createUpdatePhoneNumberLengthTrigger = () => {
        const dropTriggerQuery = `DROP TRIGGER IF EXISTS update_phone_numbers`;

        // Execute query to drop the trigger if it exists
        pool.query(dropTriggerQuery, (error, results, fields) => {
            if (error) {
                console.error("Error dropping update_phone_numbers trigger:", error);
                return;
            }

            // Now create the trigger
            const createTriggerQuery = `
                        CREATE TRIGGER update_phone_numbers
                        BEFORE UPDATE ON phone_numbers
                        FOR EACH ROW
                        BEGIN
                        IF (NEW.phone_number1 IS NOT NULL AND LENGTH(NEW.phone_number1) != 10 AND NEW.phone_number1 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
                    END IF;
                    
                    IF (NEW.phone_number2 IS NOT NULL AND LENGTH(NEW.phone_number2) != 10 AND NEW.phone_number2 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
                    END IF;
                
                    IF (NEW.phone_number3 IS NOT NULL AND LENGTH(NEW.phone_number3) != 10 AND NEW.phone_number3 != '') THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number must be NULL or 10 digits long';
                    END IF;
                        END`;

            // Execute query to create the trigger
            pool.query(createTriggerQuery, (error, results, fields) => {
                if (error) {
                    console.error("Error creating update_phone_numbers trigger:", error);
                } else {
                    console.log("update_phone_numbers trigger created successfully");
                }
            });
        });
    };

    // Function to create the trigger for updating phone number 1 uniqueness
    const createUniquePhoneNumberUpdateTrigger = () => {
        const dropTriggerQuery = `DROP TRIGGER IF EXISTS unique_phone_number1_update`;

        // Execute query to drop the trigger if it exists
        pool.query(dropTriggerQuery, (error, results, fields) => {
            if (error) {
                console.error("Error dropping unique_phone_number1_update trigger:", error);
                return;
            }

            // Now create the trigger
            const createTriggerQuery = `
                CREATE TRIGGER unique_phone_number1_update
                BEFORE UPDATE ON phone_numbers
                FOR EACH ROW
                BEGIN
                    DECLARE existing_count INT;
                    SELECT COUNT(*) INTO existing_count FROM phone_numbers WHERE phone_number1 = NEW.phone_number1 AND NOT (OLD.phone_number1 <=> NEW.phone_number1);
                    IF existing_count > 0 THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Phone number1 must be unique for each contact';
                    END IF;
                END`;

            // Execute query to create the trigger
            pool.query(createTriggerQuery, (error, results, fields) => {
                if (error) {
                    console.error("Error creating unique_phone_number1_update trigger:", error);
                } else {
                    console.log("unique_phone_number1_update trigger created successfully");
                }
            });
        });
    };
    // Function to create the trigger for username and password not null
    const createUsernamePasswordNotNullTrigger = () => {
        const createTriggerQuery = `
            CREATE TRIGGER check_username_password_not_null
            BEFORE INSERT ON user
            FOR EACH ROW
            BEGIN
                IF (NEW.username IS NULL OR NEW.password IS NULL) THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Username and password must not be null';
                END IF;
            END`;

        // Execute query to create the trigger
        pool.query(createTriggerQuery, (error, results, fields) => {
            if (error) {
                console.error("Error creating check_username_password_not_null trigger:", error);
            } else {
                console.log("check_username_password_not_null trigger created successfully");
            }
        });
    };


    const initializeTriggers = () => {
        // Drop triggers if they exist
        dropTriggerIfExists('unique_phone_number1');
        dropTriggerIfExists('check_phone_number_length');
        dropTriggerIfExists('update_phone_numbers');
        dropTriggerIfExists('unique_phone_number1_update');
        dropTriggerIfExists('check_username_password_not_null');

        // Create new triggers
        createPhoneNumberLengthTrigger();
        createUniquePhoneNumberTrigger();
        createUpdatePhoneNumberLengthTrigger();
        createUniquePhoneNumberUpdateTrigger();
        createUsernamePasswordNotNullTrigger();
    };
    initializeTriggers();
}
module.exports = createTriggers;
