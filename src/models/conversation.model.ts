import mongoose from "mongoose";

export type participants = {
    id: string;
    info: {
        id: string,
        name: string
    }
}

type Conversation = mongoose.Document & {
    conversationName: string,
    documentId: string,
    participants: [{
        id: string,
        info: {
            id: string,
            name: string
        }
    }]
}

const ConversationSchema = new mongoose.Schema<Conversation>(
    {
        conversationName: {
            type: String,
            required: true,
        },
        documentId: {
            type: String,
            required: true,
            unique: true,
        },
        participants: [
            {
                id: {
                    type: String,
                    required: true,
                },
                info: {
                    id: {
                        type: String,
                        required: true,
                    },
                    name: {
                        type: String,
                    },
                },
            },
        ],
    },
    { timestamps: true }
);

export const Conversation = mongoose.model<Conversation>("Conversation", ConversationSchema);