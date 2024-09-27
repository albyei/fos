import express from "express";
import { getAllmenus, createMenu, updatedMenu, deleteMenu } from "../controllers/menuController";
import { verifyAddMenu, verifyEditMenu } from "../middlewares/verifyMenu";

const app = express();
app.use(express.json());

app.get(`/`, getAllmenus);
app.post(`/`,[verifyAddMenu], createMenu);
app.put(`/:id`, [verifyEditMenu], updatedMenu)
app.delete(`/:id`, deleteMenu)
// []: midlleware

export default app;
