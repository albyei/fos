import express from "express";
import {
  getAllmenus,
  createMenu,
  updatedMenu,
  deleteMenu,
  changePicture,
} from "../controllers/menuController";
import { verifyAddMenu, verifyEditMenu } from "../middlewares/verifyMenu";
import uploadFile from "../middlewares/menuUpload";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.get(`/`,[verifyToken, verifyRole(["MANAGER","CASHIER"]),], getAllmenus);
app.post(`/`, [verifyToken, verifyRole(["MANAGER"]),verifyAddMenu], createMenu);
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"]),verifyEditMenu], updatedMenu);
app.put(`/pic/:id`, [verifyToken, verifyRole(["MANAGER"]),uploadFile.single("picture")], changePicture);
//"picture" nama hatus sama seperti yang di db
app.delete(`/:id`,[verifyToken, verifyRole(["MANAGER"])], deleteMenu);
// []: midlleware

export default app;
