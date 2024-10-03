import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL, SECRET } from "../global";
import fs from "fs";
import md5 from "md5"; //ENKRIPSI PASSWORD
import { sign } from "jsonwebtoken"; //MEMBUAT TOKEN
import { request } from "http";
import { json } from "stream/consumers";
import { number } from "joi";
import { profile } from "console";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllUser = async (request: Request, response: Response) => {
  try {
    const { search } = request.query;
    const alluser = await prisma.user.findMany({
      where: { name: { contains: search?.toString() || "" } },
    });
    return response
      .json({
        status: true,
        data: alluser,
        message: `User Has Retrivied`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400);
  }
};
export const createUser = async (request: Request, response: Response) => {
  try {
    const { name, email, password, role } = request.body;
    const uuid = uuidv4();

    const newUser = await prisma.user.create({
      data: { uuid, name, email, password, role },
    });

    return response
      .json({
        status: true,
        data: newUser,
        message: `New User Has Created`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There os an error.${error}`,
      })
      .status(400);
  }
};

export const updatedUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { name, email, password, role } = request.body;
    const updateUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, password, role },
    });

    return response
      .json({
        status: true,
        data: updateUser,
        message: "User has updates succesfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({ status: false, message: `There is an error. ${error}` })
      .json(400);
  }
};

export const deleteAllUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const deleteAllUser = await prisma.user.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: deleteAllUser,
        message: "User has deleted successfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({ status: false, message: `There is an error. ${error}` })
      .status(400);
  }
};

export const profileUser = async (request: Request, response: Response) => {
  try {
    const { id} = request.params;
    const findUser = await prisma.user.findFirst({
      where: { id: Number(id) },
    });
    if (!findUser) {
      return response.json({ status: false, message: "User not found" });
    }

    let filename = findUser.profil_picture;

    if (request.file) {
      filename = request.file.filename;
      let path = `${BASE_URL}/public/profil_picture/${filename}`;
      let exists = fs.existsSync(path);
      if (exists && findUser.profil_picture !== ``) {
        fs.unlinkSync(path);
      }
    }

    const updateUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        profil_picture: filename,
      },
    });

    return response
      .json({
        status: true,
        data: updateUser,
        message: "User has retrivied successfully",
      })
      .status(200);
  } catch (error) {
    return response
      .json({ status: false, message: `There is an error.${error}` })
      .status(400);
  }
};

export const authentication = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body;

    const findUser = await prisma.user.findFirst({
      where: { email, password: md5(password) },
    });

    if (!findUser)
      return response.status(200).json({
        status: false,
        logget: false,
        message: `Invalid email or password`,
      });

    let data = {
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
    };

    let payLoad = JSON.stringify(data);
    let token = sign(payLoad, SECRET || "token");
    // const token = sign(payLoad, SECRET || "token");

    return response
      .json({
        status: true,
        logged: true,
        // data: { ...findUser, token },
        message: `User has logged in successfully`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({ status: false, message: `There is an error. ${error}` })
      .status(400);
  }
};
