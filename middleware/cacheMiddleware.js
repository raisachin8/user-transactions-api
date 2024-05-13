const redis = require('redis');




// Middleware to fetch data if exists in Redis
const cacheMiddleware = async (req, res, next) => {
let client = await redis.createClient().connect()
  const key = req.originalUrl;
  console.log(key)
  let data = await client.get(key)
    if (data !== null) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
};

// Middleware to store data in Redis with a TTL
const cacheResponse = async (req, res, next) => {
let client = await redis.createClient().connect()
  const key = req.originalUrl;
  const { ttl = 60 } = req.query; // Default TTL is 60 seconds
  await client.setEx(key, ttl, JSON.stringify(req.data));
  next();
};

module.exports = { cacheMiddleware, cacheResponse };
