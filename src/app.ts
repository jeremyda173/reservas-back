import express from "express";
import cors from "cors"
import user_router from "./routes/user.route"

const app = express();
app.use(cors({
}));

app.use(express.json())

app.get("/", (_, res) => {
    res.send("ApI funcionando correctamente con Typescript y firebase");
});
app.use("/user", user_router)
export default app;