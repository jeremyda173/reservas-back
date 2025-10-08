import express from 'express';
import "./src/config/dbConfig";
import app from "./src/app";
import cors from 'cors'
import { initSocket } from './src/config/socket.io';
import http, { METHODS, Server } from "http"

const PORT = process.env.PORT || 3000;
const server = http.createServer(app)

//Cors 
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://reservas-web.vercel.app",
  methods:  ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}))

//Inicialice socket
initSocket(server)

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});