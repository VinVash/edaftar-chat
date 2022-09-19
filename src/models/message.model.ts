import mongoose from "mongoose";

type Message = mongoose.Document & {
    senderId: string;
    subject: string;
    content: string;
    conversationId: string;
    senderName: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<Message>(
    {
        senderId: {
            type: String,
            required: true,
        },
        content: {
            type: String,
        },
        subject: {
            type: String,
        },
        conversationId: {
            type: String,
        },
        senderName: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Message = mongoose.model<Message>("Message", MessageSchema);