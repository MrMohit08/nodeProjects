const redis = require("redis");
const { promisify } = require("util");

//creating a redis client
const redisClient = redis.createClient(
    13114,
    "redis-13114.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );

//Authenticating the client (our application)
  redisClient.auth("XhBhmGfHdxJPJMiyIp45kru6OXQfOO82", function (err) {
    if (err) throw err;
  });
  
//if connect console log a message
redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

//
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

module.exports.SET_ASYNC = SET_ASYNC
module.exports.GET_ASYNC = GET_ASYNC
//module.exports = { SET_ASYNC, GET_ASYNC}