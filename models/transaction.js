const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    item: String,
    date: { type: Date, default: () => Date.now() },
    amount: Number
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;