const express = require('express');
const pool = require('../mysqlConnection'); 
const router = express.Router();

  //basic filter
  router.get('/notlogin', (req, res) => {
    const { searchQuery, city, dateOfBirthStart, dateOfBirthEnd, organization, job, relation } = req.query;
    console.log(req.body)
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

  router.get('/', (req, res) => {
    const { searchQuery, city, dateOfBirthStart, dateOfBirthEnd, organization, job, relation, user } = req.query;
    const userId = user;
    let query = `
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
    `;

    const queryParams = [userId, userId, userId];

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

    // Add GROUP BY at the end of the query
    query += ' GROUP BY c.contact_id, c.userid, c.name, c.organization, c.job_title, c.date_of_birth, c.website_url, c.notes, c.tags, c.visible_to_all';

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error executing MySQL query:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'No contacts found based on the provided criteria' });
        } else {
            res.json(results);
        }
    });
});


module.exports = router;