const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../mysqlConnection'); // Assuming you have a file for database connection
const router = express.Router();

router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Retrieve user from the database
  pool.query('SELECT userid, password FROM user WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ error: 'Error logging in' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare hashed passwords
    bcrypt.compare(password, user.password, (bcryptError, isMatch) => {
      if (bcryptError) {
        console.error('Error comparing passwords:', bcryptError);
        return res.status(500).json({ error: 'Error logging in' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });

      // Return token and success message
      res.status(200).json({ message: 'Login successful', userId: user.userid, token: token });
    });
  });
});

module.exports = router;
