const express = require('express');
const pool = require('../mysqlConnection'); 
const router = express.Router();

  //basic filter
  router.get('/', (req, res) => {
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
      query += ' AND LOWER(a.city) LIKE ?'; // Changed to LIKE
      queryParams.push('%' + city.toLowerCase() + '%'); // Removed % wildcard characters
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
  
    console.log(query);
    console.log(queryParams);
  
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
  
  //show filter contact visible to all 
  router.get('/Visible_to_all', (req, res) => {
    const { searchQuery, city, dateOfBirthStart, dateOfBirthEnd, organization, job, relation } = req.query;
  
    let query = `
      SELECT c.*
      FROM contacts c
      INNER JOIN addresses a ON c.contact_id = a.Address_contact_id
      WHERE c.visible_to_all = 1
    `;
    let queryParams = [];
  
    if (searchQuery) {
      query += ' AND LOWER(c.name) LIKE ?';
      queryParams.push('%' + searchQuery.toLowerCase() + '%');
    }
  
    if (city) {
      query += ' AND LOWER(a.city) LIKE ?';
      queryParams.push('%' + city.toLowerCase() + '%');
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
  
    console.log(query);
    console.log(queryParams);
  
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
  
  // Get filter contacts shared for the specified user if have permission
  router.get('/permission_shared', (req, res) => {
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
      query += ' AND LOWER(a.city) LIKE ?'; // Changed to LIKE
      queryParams.push('%' + city.toLowerCase() + '%'); // Removed % wildcard characters
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
  
    // Adding the logic for retrieving shared contacts
    const userId = req.user.id; // Assuming userId is available from authenticated user
    query += `
      AND (
        c.userid = ? 
        OR EXISTS (SELECT 1 FROM share s WHERE c.contact_id = s.contactid AND s.share_userid = ?)
        OR EXISTS (SELECT 1 FROM usershares us WHERE c.userid = us.current_user_id AND us.shared_user_id = ?)
      )
    `;
    queryParams.push(userId, userId, userId);
  
    console.log(query);
    console.log(queryParams);
  
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
module.exports = router;