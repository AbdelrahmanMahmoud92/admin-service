// redisClient.js
const Redis = require("redis");

const BlackListRedisClient = Redis.createClient({
  url: "redis://127.0.0.1:6379",
  password: "",
});

BlackListRedisClient.on("connect", () => {
  console.log("Connected to Redis");
});

BlackListRedisClient.on("error", (error) => {
  console.error("Error connecting to Redis:", error);
});

BlackListRedisClient.connect().catch(console.error);

module.exports = BlackListRedisClient;