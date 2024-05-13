const mongoose = require('mongoose');
const redis = require('redis');
const Transaction = require('../models/transaction');

exports.createTransaction = async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).send(transaction);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Controller for retrieving transactions by user ID
exports.getTransactionsByUserId = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const { page = 1, limit = 10, fromDate, toDate, minAmount, maxAmount } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId };

    if (fromDate && toDate) {
        query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    if (minAmount && maxAmount) {
        query.amount = { $gte: minAmount, $lte: maxAmount };
    }
    try {
        const transactions = await Transaction.find(query)
            .limit(limit)
            .skip(skip)
            .exec()

        let client = await redis.createClient().connect()    
        const key = req.originalUrl;
        const ttl = 60;
        await client.setEx(key, ttl, JSON.stringify(transactions));
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error);
    }
};