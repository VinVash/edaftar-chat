import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import * as Sentry from "@sentry/node";
const users: any[] = [];

// Join user to chat
export function userJoin(id: string, username: string, room: string) {
    const user = { id, username, room };
    // check if user alerady exists in users array(to avoid duplicates)
    if (users.indexOf(user) === -1) {
        users.push(user);
        return user;
    }
    else {
        return users[users.indexOf(user)];
    }
}

// Get current user
export function getCurrentUser(id: string) {
    return users.find((user) => user.id === id);
}

// User leaves chat
export function userLeave(id: string) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room users
export function getRoomUsers(room: string) {
    return users.filter((user) => user.room === room);
}


export async function createNewMessageInDb(userId: string, message: string, roomId: string, senderName: string, subject: string) {
    // check if room exists
    const conversation = await Conversation.findOne({ _id: roomId });
    if (!conversation) {
        return {
            error: true,
            message: "Chat room does not exist"
        }
    }
    const newMessage = new Message({
        senderId: userId,
        content: message,
        conversationId: roomId,
        senderName: senderName,
        subject: subject
    });
    await newMessage.save();
}

export async function getRoomFromDocumentId(documentId: string) {
    try {
        const conversation = await Conversation.findOne({ documentId: documentId });
        if (!conversation) {
            return {
                error: true,
                message: "Chat room does not exist"
            }
        }
        return {
            error: false,
            room: conversation
        }
    }
    catch (err) {
        Sentry.captureException(err);
        await Sentry.flush(2200);
        return {
            error: true,
            message: "Error getting room"
        }
    }
}

export async function checkIfRoomHasNoMessages(roomId: string) {
    const messages = await Message.find({ conversationId: roomId });
    if (messages.length === 0) {
        return true;
    }
    else {
        return false;
    }
}