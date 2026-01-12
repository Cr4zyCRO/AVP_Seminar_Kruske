import { createClient } from "redis";

/**
 * Dinamičko postavljanje hosta i porta.
 * U Dockeru će koristiti 'redis' (iz env varijabli), 
 * a lokalno će pasti natrag na '127.0.0.1'.
 */
const host = process.env.REDIS_HOST || "127.0.0.1";
const port = process.env.REDIS_PORT || "6379";

const redisClient = createClient({
  url: `redis://${host}:${port}`,
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