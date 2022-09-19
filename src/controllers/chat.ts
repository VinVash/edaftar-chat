import { Request, Response } from "express";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import * as Sentry from "@sentry/node";
import { CreateRoomInput, JoinRoomInput, LoadMessageInput } from "../types/types";

export const createRoom = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to create chat room",
            });
        }
        const body = req.body as CreateRoomInput;
        if (!body.conversationName || !body.documentId) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to create chat room",
            });
        }
        const conversation = await Conversation.findOne({ conversationName: body.conversationName });
        if (conversation) {
            return res.status(200).json({
                error: false,
                message: "Chat room already exists",
                data: conversation,
            });
        }
        const newConversation = new Conversation({
            conversationName: body.conversationName,
            documentId: body.documentId,
        });
        await newConversation.save();
        return res.status(200).json({
            error: false,
            message: "Chat room created successfully",
            data: newConversation
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
};

export const joinRoom = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to join chat room",
            });
        }
        const body = req.body as JoinRoomInput;
        if (!body.roomId || !body.employeeId || !body.name) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to join chat room",
            });
        }
        const conversation = await Conversation.findOne({ _id: body.roomId });
        if (!conversation) {
            return res.status(400).json({
                error: true,
                message: "Chat room does not exist",
            });
        }
        const userExists = conversation.participants.find(participant => participant.id === body.employeeId);
        if (userExists) {
            return res.status(200).json({
                error: false,
                message: "User already exists in chat room",
            });
        }
        else {
            conversation.participants.push({
                id: body.employeeId,
                info: {
                    id: body.employeeId,
                    name: body.name
                }
            });
            await conversation.save();
            return res.status(200).json({
                error: false,
                message: "User joined chat room successfully",
            });
        }
    }
    catch (err) {
        Sentry.captureException(err);
        await Sentry.flush(2000);
        res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    try {
        if (!req.query["employeeId"]) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to get chat room",
            });
        }
        const employeeId = req.query["employeeId"];
        const conversations = await Conversation.find({
            "participants.id": employeeId
        });
        if (!conversations) {
            return res.status(400).json({
                error: true,
                message: "No chat room found",
            });
        }
        return res.status(200).json({
            error: false,
            message: "Chat room fetched successfully",
            data: conversations
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
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        if (!req.query["roomId"]) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to get chat room",
            });
        }
        const roomId = req.query["roomId"];
        const messages = await Message.find({
            conversationId: roomId
        });
        if (!messages) {
            return res.status(400).json({
                error: true,
                message: "No chat room found",
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
};

// Find the conversation with the documentId
export const getConversation = async (req: Request, res: Response) => {
    try {
        if (!req.query["documentId"]) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to get conversation",
            });
        }
        const documentId = req.query["documentId"];
        const conversation = await Conversation.findOne({
            documentId: documentId
        });
        if (!conversation) {
            return res.status(400).json({
                error: true,
                message: "No conversation found",
            });
        }
        return res.status(200).json({
            error: false,
            message: "Conversation fetched successfully",
            data: conversation
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
}

export const loadMessage = async (req: Request, res: Response) => {
    try {
        if (!req.query) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to load message",
            });
        }
        const employeeId = req.query["employeeId"];
        const pageNo = parseInt(req.query["pageNo"] as string);
        const filter = req.query["filter"];
        if (!employeeId || !pageNo || !filter) {
            return res.status(400).json({
                error: true,
                message: "Invalid request to load message",
            });
        }
        if (filter !== "primary" && filter !== "sent") {
            return res.status(400).json({
                error: true,
                message: "Invalid filter",
            });
        }
        const conversations = await Conversation.find({
            "participants.id": employeeId
        });
        if (!conversations) {
            return res.status(400).json({
                error: true,
                message: "No conversation found",
            });
        }
        const allMessages = [];
        for (const conversation of conversations) {
            let messages = await Message.find({
                conversationId: conversation._id
            });
            if (filter === "primary") {
                // Filter messages that are not sent by the employee
                messages = messages.filter(message => message.senderId !== employeeId);
            }
            else if (filter === "sent") {
                // Filter messages that are sent by the employee
                messages = messages.filter(message => message.senderId === employeeId);
            }
            allMessages.push(...messages);
        }
        if (allMessages.length === 0) {
            return res.status(200).json({
                error: true,
                message: "No message found",
            });
        }
        // sort the messages in decreasing order of createdAt
        const sorrtedMessages = allMessages.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        // In a single page return 20 messages
        const messages = sorrtedMessages.slice((pageNo - 1) * 20, pageNo * 20);
        return res.status(200).json({
            error: false,
            message: "Messages fetched successfully",
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
}
