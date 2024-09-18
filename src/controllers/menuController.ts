import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
// import { request } from "http";
// import { DateSchema } from "joi";
// import { json } from "stream/consumers";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllmenus = async (request: Request, Response: Response) => {
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
    return Response
      .json({
        status: true,
        data: allmenus,
        message: `menus has retrieved`,
      })
      .status(200);
  } catch (error) {
    return Response
    .json({
        status: false,
        message: `there is an error. ${error}`
      }).status(400)
  }
  //try mengelompokkan error
}
