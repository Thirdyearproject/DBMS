const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../mysqlConnection'); // Assuming you have a file for database connection
const router = express.Router();

router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (error, hashedPassword) => {
    if (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ error: 'Error signing up' });
    }

    // Insert user into the database with hashed password
    pool.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashedPassword], (error, results) => {
      if (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ error: 'Error signing up' });
      }

      res.status(201).json({ message: 'Signup successful' });
    });
  });
});

module.exports = router;
