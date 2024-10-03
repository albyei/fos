import { Request } from "express";
import multer from "multer";
import { BASE_URL } from "../global";
import { error } from "console";


// define storage configurate of menu picture 
const storage = multer.diskStorage({
    destination: (request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {

    //define location pf upload picture, make sure that ypu have crate a " public" folder in root folder
    //then create folder "menu_picture" inside pf "public folder"

    cb (null, `${BASE_URL}/public/profile_picture/`)
    
    },
    filename: (request:Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {

        //define file name of upload file
        cb(null, `${(new Date().getTime().toString())}-${file.originalname}`)
    }
})

const uploadFile = multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024} //define max size of upload file, in this case max siza is 2 mb

})

export default uploadFile