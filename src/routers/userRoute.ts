import express from "express";
import {
  getAllUser,
  createUser,
  updatedUser,
  deleteAllUser,
  authentication,
} from "../controllers/userController";
import { verifyAddUser, verifyAuthentication, verifyEditUser } from "../middlewares/verifyUser";
import uploadFile from "../middlewares/userUpload";
import { profileUser } from "../controllers/userController";

const app = express();
app.use(express.json());

app.get(`/`, getAllUser);
app.post(`/`, [verifyAddUser], createUser);
app.post(`/login`,verifyAuthentication,authentication)
app.put(`/:id`, [verifyEditUser], updatedUser);
app.put(`/picture/:id`, [uploadFile.single("picture")], profileUser);
app.delete(`/:id`, deleteAllUser);
// []: midlleware

export default app;




// import express from "express";
// import { authentication,createUser } from "../controllers/userController";
// import validateEmail from "../middlewares/userValidation"
// import { verifyAuthentication } from "../middlewares/userValidation";



// const app = express();
// app.use(express.json());

// app.post(`/create`, [validateEmail], createUser)
// app.post(`login`, [verifyAuthentication], authentication)

// export default app;