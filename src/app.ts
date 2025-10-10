import express from "express";
import cors from "cors"
import user_router from "./routes/user.route"
import table_router from "./routes/table.route"
import reservation_router from './routes/reservation.route'
import admin_router from './routes/admin.route'
import role_router from './routes/role.route'
import init_router from './routes/init.route'
import test_router from './routes/test.route'
import path from "path"

const app = express();

//Cors 
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods:  ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}))

app.use(express.json())

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get("/", (_, res) => {
    res.send("ApI funcionando correctamente con Typescript y firebase");
});
app.use("/user", user_router)
app.use('/table', table_router)
app.use('/reservation', reservation_router)
app.use('/admin', admin_router)
app.use('/role', role_router)
app.use('/init', init_router)
app.use('/test', test_router)

export default app;