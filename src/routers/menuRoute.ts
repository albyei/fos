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

const app = express();
app.use(express.json());

app.get(`/`, getAllmenus);
app.post(`/`, [verifyAddMenu], createMenu);
app.put(`/:id`, [verifyEditMenu], updatedMenu);
app.put(`/pic/:id`, [uploadFile.single("picture")], changePicture);
//"picture" nama hatus sama seperti yang di db
app.delete(`/:id`, deleteMenu);
// []: midlleware

export default app;
