// routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers//tranasactionController');
const { cacheMiddleware, cacheResponse } = require('./../middleware/cacheMiddleware.js');

// POST /transactions - Create a new transaction
router.post('/', transactionController.createTransaction);

// GET /transactions/:userId - Get transactions by user ID
router.get('/:userId', transactionController.getTransactionsByUserId);

module.exports = router;


