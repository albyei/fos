import express from "express";
import {
  getAllOrder,
  createOrder,
  deleteOrder,
  updateStatusOrder
} from "../controllers/orderController";
import {
  verifyAddOrder,
  verifyEditStatus,
  validateOrderInput,
} from "../middlewares/orderValidation";
import { verifyRole, verifyToken } from "../middlewares/authorization";

const app = express();
app.use(express.json());
app.get(`/`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllOrder);
app.post(
  `/orders`,
  [verifyToken, verifyRole(["CASHIER"]), verifyAddOrder],
  validateOrderInput,
  createOrder
);
app.put(`/:id`, [verifyToken, verifyRole(["CASHIER"]), verifyEditStatus],updateStatusOrder); //updatestatusorder belum
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteOrder);

export default app;
