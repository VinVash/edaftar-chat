import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateRoomInput {
    @IsString()
    conversationName: string;
    @IsString()
    documentId: string;
}

export class JoinRoomInput {
    @IsString()
    roomId: string;
    @IsString()
    employeeId: string;
    @IsString()
    name: string;
}

export class LoadMessageInput {
    @IsString()
    employeeId: string;
    @IsNumber()
    pageNo: number;
    @IsString()
    filter: string;
}

// export class SocketJoinRoomInput {
//     @IsString()
//     userId: string;
//     @IsString()
//     userName: string;
//     @IsString()
//     roomId: string;
// }

export class SocketRegisterInput {
    @IsString()
    userId: string;
    @IsString()
    userName: string;
}

// export class SocketMessageInput {
//     @IsString()
//     senderId: string;
//     @IsString()
//     content: string;
//     @IsString()
//     createdAt: string;
//     @IsString()
//     senderName: string;
//     @IsString()
//     subject: string;
// }

export class SocketPrivateMessageInput {
    @IsString()
    senderId: string;
    @IsString()
    content: string;
    @IsString()
    createdAt: string;
    @IsString()
    senderName: string;
    @IsString()
    subject: string;
    @IsString()
    receiverId: string;
    @IsString()
    receiverName: string;
    @IsString()
    documentId: string;
}

export class SocketLeaveRoomInput {
    @IsString()
    userId: string;
    @IsString()
    userName: string;
}