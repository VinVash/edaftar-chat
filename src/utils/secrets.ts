import logger from "./logger"; 
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} else {
    logger.debug("Using .env.example file to supply config environment variables");
    dotenv.config({ path: ".env.example" });  // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

export const SENTYRY_DSN = process.env["SENTRY_DSN"];

export const SECRET_TOKEN = process.env["SECRET_TOKEN"];

export const IRON_SECRET_TOKEN = process.env["IRON_TOKEN"];

export const AZURE_CACHE_HOST = process.env["AZURE_CACHE_HOST"];

export const AZURE_CACHE_PORT = process.env["AZURE_CACHE_PORT"];

export const AZURE_CACHE_KEY = process.env["AZURE_CACHE_KEY"];

if (!SENTYRY_DSN) {
    logger.error("No SENTRY_DSN environment variable. Set and restart server.");
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}

if (!SECRET_TOKEN) {
    logger.error("No SECRET_TOKEN environment variable. Set and restart server.");
    process.exit(1);
}