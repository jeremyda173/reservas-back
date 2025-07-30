import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        },
    });

    io.on("connection", (socket) => {
        console.log("Cliente conectado", socket.id);

    });
    return io;
}

export const getIO = (): Server => {
    if(!io) {
        throw new Error("Socket.io no ha inicializado")
    }
    return io;
 }