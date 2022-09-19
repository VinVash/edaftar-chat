import { MONGODB_URI } from "../utils/secrets";
import bluebird from "bluebird";
import mongoose from "mongoose";

// Connect to MongoDB
export const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

export const connect = async (): Promise<void> => {
    mongoose.connect(mongoUrl).then(
        () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
            console.log("MongoDB connected: DB connected!");
        },
    ).catch(err => {
        console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
        process.exit();
    });
};