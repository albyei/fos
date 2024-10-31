import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { request } from "http";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllOrder = async (request: Request, response: Response) => {
  try {
    /** get requested data (data has been sent from request) */
    const { search } = request.query;

    /**proccess to get order, contains means search name or table number customors order dased on sent keyword */

    const allOrders = await prisma.order.findMany({
      where: {
        OR: [
          { customer: { contains: search?.toString() || "" } },
          { table_number: { contains: search?.toString() || "" } },
        ],
      },
      orderBy: { createdAt: "desc" } /**sort by descending order date */,
      include: {
        orderLists: true,
      } /**include detail of order (itwm that solid) */,
    });
    return response.status(200).json({
      status: true,
      data: allOrders,
      message: `Order list has retrivied`,
    });
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error.${error}`,
    });
  }
};


// export const createOrder = async (request: Request, response: Response) => {
//   try {
//     const { customer, table_number, payment_method, status, orderLists } = request.body;

//     // Sisa kode untuk memproses pesanan tetap sama
//     // ...
//   } catch (error) {
//     return response.status(500).json({
//       status: false,
//       message: `An error occurred: ${error}`,
//     });
//   }
// };

export const createOrder = async (request: Request, response: Response) => {
  try {
    /**       /** get requested data (data has been sent from request) */
    const { customer, table_number, payment_method, status, orderLists } =
      request.body;

      // Validasi untuk customer
    if (!customer || customer.trim() === '') {
      return response.status(400).json({
        status: false,
        message: "Customer name is required"
      });
    }

    // Validasi untuk table_number
if (!table_number) {
      return response.status(400).json({
        status: false,
        message: "Table number is required"
      });
    }


    if (!table_number || table_number.trim() === '') {
      return response.status(400).json({
        status: false,
        message: "Table number is required"
      });
    }

    // Validasi untuk orderLists
    if (!orderLists) {
      return response.status(400).json({
        status: false,
        message: "Order lists is required"
      });
    }

    if (!Array.isArray(orderLists)) {
      return response.status(400).json({
        status: false,
        message: "Order lists must be an array"
      });
    }

    if (orderLists.length === 0) {
      return response.status(400).json({
        status: false,
        message: "Order lists cannot be empty"
      });
    }

    // Validasi setiap item dalam orderLists
    for (const item of orderLists) {
      if (!item.menuId) {
        return response.status(400).json({
          status: false,
          message: "Each order item must have a menuId"
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        return response.status(400).json({
          status: false,
          message: "Each order item must have a valid quantity"
        });
      }
    }

    const user = request.body.user;
    const uuid = uuidv4();

    /**
     * assume that "orderlists" is an array of object that has keys:
     * menuId, quantity, note
     * */

    /** loop details of order to check menu and count the total price */

    // let total_price = 0;
    // for (let index = 0; index < orderLists.length; index++) {
    //   const { menuId } = orderLists[index];
    //   const detailMenu = await prisma.menu.findFirst({
    //     where: {
    //       id: menuId,
    //     },
    //   });
    //   if (!detailMenu)
    //     return response
    //       .status(200)
    //       .json({
    //         status: false,
    //         message: `Menu with id ${menuId} is not found`,
    //       });
    //   total_price += detailMenu.price * orderLists[index].quantity;
    // }
    // /** process to save new order */

    let total_price = 0;
    for (const orderItem of orderLists) {
      const detailMenu = await prisma.menu.findFirst({
        where: { id: orderItem.menuId },
      });

      if (!detailMenu) {
        return response.status(404).json({
          status: false,
          message: `Menu with id ${orderItem.menuId} is not found`,
        });
      }

      total_price += detailMenu.price * orderItem.quantity;
    }

    //     const newOrder = await prisma.order.create({
    //       data: {
    //         uuid,
    //         customer,
    //         table_number,
    //         total_price,
    //         payment_method,
    //         status,
    //         userid: user.id,
    //       },
    //     });
    //     /** loop details of Order to save in database */

    //     for (let index = 0; index < orderLists.length; index++) {
    //       const uuid = uuidv4();
    //       const { menuId, quantity, note } = orderLists[index];
    //       await prisma.orderLists.create({
    //         data: {
    //           uuid,
    //           OrderId: newOrder.id,
    //           MenuId: Number(menuId),
    //           quantity: Number(quantity),
    //           note,
    //         },
    //       });
    //     }
    //     return response
    //       .json({
    //         status: true,
    //         data: newOrder,
    //         message: `New Order Has Created`,
    //       })
    //       .status(200);
    //   } catch (error) {
    //     return response
    //       .json({
    //         status: false,
    //         message: `There is an error.${error}`,
    //       })
    //       .status(400);
    //   }
    // };

    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          uuid: uuidv4(),
          customer,
          table_number,
          total_price,
          payment_method,
          status,
          userid: user.id,
        },
      });

      // Buat order items
      const orderListsPromises = orderLists.map((item) =>
        tx.orderLists.create({
          data: {
            uuid: uuidv4(),
            OrderId: newOrder.id,
            MenuId: Number(item.menuId),
            quantity: Number(item.quantity),
            note: item.note,
          },
        })
      );

      await Promise.all(orderListsPromises);

      return newOrder;
    });

    return response.status(201).json({
      status: true,
      data: result,
      message: `New Order Has Been Created`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
    return response.status(500).json({
      status: false,
      message: `An error occurred: ${error.message}`,
    });
  }
  return response.status(500).json({
    status: false,
    message: "An unknown error occurred"
  })
}
};


export const updateStatusOrder = async (request: Request, response: Response) => {
  try {
      /** get id of order's id that sent in parameter of URL */
      const { id } = request.params
      /** get requested data (data has been sent from request) */
      const { status } = request.body
      const user = request.body.user


      /** make sure that data is exists in database */
      const findOrder = await prisma.order.findFirst({ where: { id: 


Number(id) } })
       if (!findOrder) return response
           .status(200)
           .json({ status: false, message: `Order is not found` })


       /** process to update menu's data */
       const updatedStatus = await prisma.order.update({
           data: {
               status: status || findOrder.status,
               userid: user.id ? user.id : findOrder.userid
           },
           where: { id: Number(id) }
       })


       return response.json({
           status: true,
           data: updatedStatus,
           message: `Order has updated`
       }).status(200)
   } catch (error) {
       return response
           .json({
               status: false,
               message: `There is an error. ${error}`
           })
           .status(400)
   }
}

// export const deleteOrder = async (request: Request, response: Response) => {
//   try {
//     /** get id of order's id that sent in parameter of URL */
//     const { id } = request.params;

//     /** make sure that data is exists in database */
//     const findOrder = await prisma.order.findFirst({
//       where: { id: Number(id) },
//     });
//     if (!findOrder)
//       return response
//         .status(200)
//         .json({ status: false, message: `Order Is Not Found` });

//     /** process to delete details of order */
//     let deleteOrderList = await prisma.orderLists.deleteMany({
//       where: { OrderId: Number(id) },
//     });
//     /** process to delete of Order */
//     let deleteOrder = await prisma.order.delete({ where: { id: Number(id) } });

//     return response
//       .json({
//         status: true,
//         data: deleteOrder,
//         message: `Order Has Deleted`,
//       })
//       .status(200);
//   } catch (error) {
//     return response
//       .json({
//         status: false,
//         message: `There id an error. ${error}`,
//       })
//       .status(400);
//   }
// };
export const deleteOrder = async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    // Gunakan transaksi untuk menghapus order dan detail-nya
    await prisma.$transaction(async (tx) => {
      await tx.orderLists.deleteMany({
        where: { OrderId: Number(id) },
      });

      const deleteOrder = await tx.order.delete({
        where: { id: Number(id) },
      });

      if (!deleteOrder) {
        throw new Error("Order not found");
      }

      return deleteOrder;
    });

    return response.status(200).json({
      status: true,
      message: `Order Has Been Deleted`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Order not found") {
        return response.status(404).json({
          status: false,
          message: "Order not found",
        });
      }
    }

    return response.status(500).json({
      status: false,
      message: `An error occurred: ${error}`,
    });
  }
};
