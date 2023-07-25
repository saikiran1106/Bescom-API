const express = require('express');
const router = express.Router();
const FormData = require('../models/FormData');

// Create a new form submission
router.post('/submit', async (req, res) => {
  try {
    const formData = new FormData(req.body);
    await formData.save();
    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;
