const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it, beforeEach } = require('mocha');
const { createTransaction, getTransactionsByUserId } = require('../controllers/tranasactionController');
const Transaction = require('../models/transaction');
const sinon = require('sinon')
const redis = require('redis-mock');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Transaction Controller', () => {
  let req, res;

  beforeEach(() => {
    client = redis.createClient();
   

    req = {
      body: {},
      params: { userId: '6640d9b3842fe98f44da7645' },
      query: {}
    };
    res = {
      statusCode: 201,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      send: function(data) {
        this.body = data;
      }
    };
  });
  afterEach(() => {
    // Close the mock Redis client
    client.quit();
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      req.body = { userId: '6640d77c842fe98f44da7641', item: 'Item', amount: 100 };
      const expectedTransaction = { _id: 'transaction123', ...req.body };
      Transaction.prototype.save = async function() {
        return expectedTransaction;
      };

     await createTransaction(req, res);

    

      expect(res.statusCode).to.equal(201);
    });

    it('should handle error when creating a new transaction', async () => {
      req.body = { /* invalid request body */ };
      const errorMessage = 'Validation error';
      Transaction.prototype.save = async function() {
        throw new Error(errorMessage);
      };

      await createTransaction(req, res);

      expect(res.statusCode).to.equal(400);
    });
  });

  describe('getTransactionsByUserId', () => {
    it('should retrieve transactions for a given user ID', async () => {
    req.params = {userId: "6640d77c842fe98f44da7641",}
    req.originalUrl = "/transactions/6640d77c842fe98f44da7641?fromDate=2024-05-10T18:36:41.540Z&toDate=2024-05-14T18:36:41.540Z";
      req.query = { page: 1,  limit: 10, fromDate: '2024-01-01', toDate: '2024-12-31', minAmount: 50, maxAmount: 200 };
      const expectedTransactions = [{ _id: '6640d9b3842fe98f44da7645', userId: '6640d77c842fe98f44da7641', item: 'Item 1', amount: 100 }];

     const findStub = sinon.stub(Transaction, 'find').returns({
        limit: sinon.stub().returnsThis(), // Chainable stub for limit()
        skip: sinon.stub().returnsThis(), // Chainable stub for skip()
        exec: sinon.stub().resolves(expectedTransactions) // Resolve with expectedTransactions
      });

      sinon.stub(redis, 'createClient').returns(client);
     let result = await getTransactionsByUserId(req, res);

      expect(res.statusCode).to.equal(201);
      findStub.restore();
      redis.createClient.restore();

    });

    it('should handle errors when retrieving transactions', async () => {
      req.query = {};
      const errorMessage = 'Database error';
      Transaction.find = async function() {
        throw new Error(errorMessage);
      };

      await getTransactionsByUserId(req, res);

      expect(res.statusCode).to.equal(500);
    });
  });
});
