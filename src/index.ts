import express from 'express'
import cors from'cors'
import MenuRoute from './routers/menuRoute' //ini
import userRoute from './routers/userRoute'
import { PORT } from './global'

const app = express()
app.use(cors())

app.use(`/menu`, MenuRoute)
app.use(`/user`,userRoute)

app.listen(PORT, () => {
    console.log (`[server]: Server is runing at http://localhost:${PORT}`)
})