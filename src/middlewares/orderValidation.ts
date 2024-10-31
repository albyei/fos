import { NextFunction, Request, Response } from "express";
import { request } from "http";
import Joi from "joi";

const orderListSchema = Joi.object({
  menuId: Joi.number().required(),
  quantity: Joi.number().required(),
  note: Joi.string().optional(),
});

const addDataSchema = Joi.object({
  customer: Joi.string().required(),
  table_number: Joi.number().required().label("tableNumber"),
  paymentMethod: Joi.string().valid("CASH", "QRIS").uppercase().required(),
  status: Joi.string().valid("NEW", "PAID", "DONE").uppercase().required(),
  userId: Joi.number().optional(),
  orderLists: Joi.array().items(orderListSchema).min(1).required(),
  user: Joi.optional(),
})
.rename('tableNumber','table_number')  // Mengubah 'tableNumber' menjadi 'table_number'
.rename('payment_method','paymentMethod')
.unknown(true);


export const verifyAddOrder = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
/** validasi isi permintaan dan ambil kesalahan jika keluar */
  const { error } = addDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
   /** jika terjadi kesalahan, maka berikan respon seperti ini */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    });
  }
  return next();
};

/** membuat skema saat mengedit kode status pesanan data */

const editDataSchema = Joi.object({
  status: Joi.string().valid("NEW", "PAID", "DONE").uppercase().required(),
  user: Joi.optional()
});

export const verifyEditStatus = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  /**validasi isi permintaan dan ambil kesalahan jika keluar */
  const { error } = editDataSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    /** jika ada kesalahan maka berikan respon seperti ini */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    });
  }
  return next();
};

export const validateOrderInput = (req: Request, res: Response, next: NextFunction) => {
  const { customer, table_number, payment_method, status, orderLists } = req.body;

  // Validasi table_number
  if (!table_number) {
    return res.status(400).json({
      status: false,
      message: "Table number is required"
    });
  }

  if (typeof table_number !== 'string' || table_number.trim() === '') {
    return res.status(400).json({
      status: false,
      message: "Table number must be a non-empty string"
    });
  }

  // Validasi field lainnya
  if (!customer) {
    return res.status(400).json({
      status: false,
      message: "Customer name is required"
    });
  }

  if (!payment_method) {
    return res.status(400).json({
      status: false,
      message: "Payment method is required"
    });
  }

  if (!status) {
    return res.status(400).json({
      status: false,
      message: "Status is required"
    });
  }

  if (!orderLists || !Array.isArray(orderLists) || orderLists.length === 0) {
    return res.status(400).json({
      status: false,
      message: "Order lists are required and must be non-empty array"
    });
  }

  // Validasi setiap item dalam orderLists
  for (const item of orderLists) {
    if (!item.menuId || !item.quantity) {
      return res.status(400).json({
        status: false,
        message: "Each order item must have menuId and quantity"
      });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        status: false,
        message: "Quantity must be greater than 0"
      });
    }
  }

  return next();
};