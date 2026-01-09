import { createClient } from "redis";

// U Dockeru će REDIS_HOST biti 'redis' (hostname kontejnera)
// U lokalnom okruženju (ako ga nemate u .env), bit će fallback na '127.0.0.1'
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
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