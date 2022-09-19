import app from "./app";
import http from "http";
import { Server } from "socket.io";
import { userJoin, createNewMessageInDb, userLeave, getRoomFromDocumentId, checkIfRoomHasNoMessages } from "./utils/chat";
import { SocketLeaveRoomInput, SocketPrivateMessageInput, SocketRegisterInput } from "./types/types";
import * as Sentry from "@sentry/node";

const PORT = app.get("port");
const httpServer = http.createServer(app);
httpServer.listen(PORT);
httpServer.on("listening", onListening);
httpServer.on("error", onError);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://sih-2022.vercel.app", "https://sih-2022-server.azurewebsites.net"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Socket.io connected");

    socket.on("register", async (data) => {
        try {
            console.log(data);
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            const _data = data as SocketRegisterInput;
            userJoin(_data.userId, _data.userName, _data.userId);
            socket.join(_data.userId);
            console.log("User joined: " + _data.userId);
        }
        catch (err) {
            Sentry.captureException(err);
            await Sentry.flush(2200);
            return;
        }
    });

    // socket.on("join-room", async (data) => {
    //     try {
    //         if (typeof data === "string") {
    //             data = JSON.parse(data);
    //         }
    //         const _data = data as SocketJoinRoomInput;
    //         if (!_data.userId || !_data.userName || !_data.roomId) {
    //             return;
    //         }
    //         console.log(`User ${_data.userName} wants to join room ${_data.roomId}`);
    //         if (_data.roomId) {
    //             const user = userJoin(_data.userId, _data.userName, _data.roomId);
    //             console.log(`${_data.userName} joined room ${_data.roomId}`);
    //             socket.join(user.room);
    //             // console.log(`User ${userName} joined room`);
    //         }
    //         else {
    //             return;
    //         }
    //     }
    //     catch (err) {
    //         Sentry.captureException(err);
    //         await Sentry.flush(2200);
    //         return;
    //     }
    // });
    socket.on("leave-room", async (data) => {
        try {
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            const _data = data as SocketLeaveRoomInput;
            const user = userLeave(_data.userId);
            if (user) {
                socket.leave(user.room);
                console.log(`${_data.userName} left room ${user.room}`);
            }
        }
        catch (err) {
            Sentry.captureException(err);
            await Sentry.flush(2200);
            return;
        }
    });

    // when a new message is sent it is broadcasted to every user
    // socket.on("message", async (data) => {
    //     try {
    //         if (typeof data === "string") {
    //             data = JSON.parse(data);
    //         }
    //         const _data = data as SocketMessageInput;
    //         console.log(`${_data.senderId} sent message: ${_data.content}`);
    //         const user = getCurrentUser(_data.senderId);
    //         io.to(user.room).emit("message", {
    //             senderId: _data.senderId,
    //             content: _data.content,
    //             createdAt: _data.createdAt,
    //             senderuserName: _data.senderName,
    //             subject: _data.subject
    //         });
    //         createNewMessageInDb(_data.senderId, _data.content, user.room, _data.senderName, _data.subject);
    //     }
    //     catch (err) {
    //         Sentry.captureException(err);
    //         await Sentry.flush(2200);
    //         return;
    //     }
    // });

    socket.on("private-message", async (data) => {
        try {
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            const _data = data as SocketPrivateMessageInput;
            const conversation = await getRoomFromDocumentId(_data.documentId);
            if (conversation.error) {
                return;
            }
            // create message in room if no previous message exists
            const noMessages = await checkIfRoomHasNoMessages(conversation.room._id);
            if (noMessages) {
                await createNewMessageInDb(_data.senderId, _data.content, conversation.room._id, _data.senderName, _data.subject);
            }
            console.log(`${_data.senderId} sent private message to ${_data.receiverId}: ${_data.content}`);
            io.to(_data.receiverId).emit("private-message", {
                senderId: _data.senderId,
                content: _data.content,
                createdAt: _data.createdAt,
                senderuserName: _data.senderName,
                subject: _data.subject,
            });
        }
        catch (err) {
            Sentry.captureException(err);
            await Sentry.flush(2200);
            return;
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket.io disconnected");
    });
});
/**
 * Event listener for HTTP httpServer "error" event.
 */

function onError(error: any) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP httpServer "listening" event.
 */

function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("App is running at http://localhost:" + PORT + " in " + app.get("env") + " mode");
}