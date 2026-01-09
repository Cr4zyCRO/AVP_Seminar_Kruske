import { createClient } from "redis";

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("connect", () => {
  console.log("Connected to Redis successfully!");
});

redisClient.on("ready", () => {
  console.log("Redis client is ready to use.");
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient.on("end", () => {
  console.log("Redis connection closed.");
});

await redisClient.connect();

export default redisClient;