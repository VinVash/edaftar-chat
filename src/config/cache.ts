import { createClient, RedisClientType } from "redis";
import { AZURE_CACHE_HOST, AZURE_CACHE_KEY, AZURE_CACHE_PORT } from "../utils/secrets";

export let redisClient: RedisClientType;

export const connectRedis = async () => {
    redisClient = createClient({
        // rediss for TLS
        url: "rediss://" + AZURE_CACHE_HOST + ":" + AZURE_CACHE_PORT,
        password: AZURE_CACHE_KEY
    });
    await redisClient.connect();
    console.log("Connected to Redis");
    const st: string = JSON.stringify({ id: "1", username: "test", room: "test" });
    await redisClient.SADD("users", st);
};