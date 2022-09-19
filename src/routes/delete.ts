import express from "express";
const router = express.Router();
import * as Sentry from "@sentry/node";
import { Message } from "../models/message.model";
router.get("/deleteMessages", async (req, res) => {
    try {
        const roomId = req.query.roomId;
        const messages = await Message.deleteMany({
            conversationId: roomId
        });
        if (!messages) {
            return res.status(400).json({
                error: true,
                mesaage: "No chat room found",
            });
        }
        return res.status(200).json({
            error: false,
            message: "Chat room fetched successfully",
            data: messages
        });
    }
    catch (err) {
        Sentry.captureException(err);
        await Sentry.flush(2000);
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
});