const mongoose = require('mongoose');
const redis = require('redis');
const Transaction = require('../models/transaction');
const { ObjectId } = mongoose.Types

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
    const userId = ObjectId.createFromHexString(req.params.userId);
    const { page = 1, limit = 10, fromDate, toDate, minAmount, maxAmount } = req.query;
    const skip = (page - 1) * limit;
    const ttl = 60;


    const query = { userId };

    if (fromDate && toDate) {
        query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    }

    if (minAmount && maxAmount) {
        query.amount = { $gte: minAmount, $lte: maxAmount };
    }
    const key = JSON.stringify({ userId, page, limit, fromDate, toDate, minAmount, maxAmount });
    const client = await redis.createClient().connect();
    try {
        client.on('error', (err) => {
            console.error(`Error connecting to Redis: ${err}`);
        });
        let data = await client.get(key)
        if (data) {
            req.data = data
            res.send(JSON.parse(data));
        };
        if (!data) {
            const transactions = await Transaction.find(query)
                .limit(limit)
                .skip(skip)
                .exec();

            await client.setEx(key, ttl, JSON.stringify(transactions));
            req.data = transactions;

            res.send(transactions);
        };
    } catch (error) {
        res.status(500).send(error);
    }
    finally {
        client.quit();
    }
};

