import { NextFunction, Request, Response } from "express";
import { request } from "http";
import Joi, { required } from "joi";
import { emit } from "process";

const addDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
  role: Joi.string().valid(`CASHIER`, `MANAGER`).required(),
  profile_picture: Joi.allow().optional(),
  
});

const UpdateDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(3).alphanum().optional(),
  role: Joi.string().valid(`CASHIER`, `MANAGER`).optional(),
  profile_picture: Joi.allow().optional(),
});

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
});

export const verifyAuthentication = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = authSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      });
     
  }
  return next();
};

export const verifyAddUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = addDataSchema.validate(request.body, { abortEarly: false });

  if (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      })
      .status(400);
  }
  return next();
};

export const verifyEditUser = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { error } = UpdateDataSchema.validate(request.body, {
    abortEarly: false,
  });

  if (error) {
    return response
      .status(400)
      .json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      })
      .status(400);
  }
  return next();
};
