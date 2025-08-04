import express from "express";
import cors from "cors"
import user_router from "./routes/user.route"
import table_router from "./routes/table.route"
import reservation_router from './routes/reservation.route'

const app = express();

//Cors 
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost/5173",
  methods:  ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}))

app.use(express.json())

app.get("/", (_, res) => {
    res.send("ApI funcionando correctamente con Typescript y firebase");
});
app.use("/user", user_router)
app.use('/table', table_router)
app.use('/reservation', reservation_router)

export default app;