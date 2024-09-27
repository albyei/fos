import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { request } from "http";
import { number } from "joi";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllmenus = async (request: Request, response: Response) => {
  // fungsi async bisa langsung eksekusi
  try {
    // input
    const { search } = request.query;
    //main
    const allmenus = await prisma.menu.findMany({
      where: { name: { contains: search?.toString() || "" } },
      //contains mengandung (mencari)
      //tostring mengubah data menjadi string
      //|| untuk mencari jika salah satu kosong berarti ngambil yang "" (menampilkan salah satu)
    });
    return response
      .json({
        status: true,
        data: allmenus,
        message: `Menus Has Retrieved`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `there is an error. ${error}`,
      })
      .status(400);
  }
  //try mengelompokkan error
};
export const createMenu = async (request: Request, response: Response) => {
  try {
    const { name, price, category, description } = request.body;
    const uuid = uuidv4();

    const newMenu = await prisma.menu.create({
      // await menunggu dijalankan sebelum ada output nya
      data: { uuid, name, price: Number(price), category, description }, // number untuk mengubah harga string ke int
    });

    return response
      .json({
        status: true,
        data: newMenu,
        message: `New Menu Has Created`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `there is an error.${error}`,
      })
      .status(400);
  }
};

export const updatedMenu = async (request: Request, response: Response) => {
  try {
    const { id } = request.params; //get id of menu id that sent ini parameter of url
    const { name, price, category, description } = request.body;

    const findMenu = await prisma.menu.findFirst({ where: { id: Number(id) } });
    if (!findMenu)
      return response
        .status(200)
        .json({ status: false, message: `Menu is not found` });

    const updatedMenu = await prisma.menu.update({
      data: {
        name: name || findMenu.name,
        price: price ? Number(price) : findMenu.price, //sebelum tanda tanya disebut kondisi oprasi ternary seperti if else
        category: category || findMenu.category,
        description: description || findMenu.description,
      },
      where: { id: Number(id) },
    });
    return response
      .json({
        status: true,
        data: updatedMenu,
        message: `New Menu Has Updated`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `there is an error.${error}`,
      })
      .status(400);
  }
};

//id mana yang mau diedit
//find frist menemukan data yang paling atas
//pake OR karena untuk mengambil salah satu data misal yang diedit

export const deleteMenu = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    const findMenu = await prisma.menu.findFirst({ where: { id: Number(id) } });
    if (!findMenu)
      return response
        .status(200)
        .json({ status: false, message: `is not found` });

    const deletedMenu = await prisma.menu.delete({
      where: { id: Number(id) },
    });

    return response
      .json({
        status: true,
        data: deletedMenu,
        message: `Menu Has Deleted`,
      })
      .status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is Error. ${error}`,
      })
      .status(400);
  }
};
