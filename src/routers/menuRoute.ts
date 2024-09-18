import express from "express";
import { getAllmenus } from "../controllers/menuController";

const app = express();
app.use(express.json());

app.get(`/`, getAllmenus);

export default app;
