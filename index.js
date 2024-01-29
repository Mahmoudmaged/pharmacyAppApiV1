import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'
import chalk from 'chalk'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })

import express from 'express'
import bootstrap from './src/index.router.js'
import { socketAuth } from './src/middleware/auth.js'
import { roles } from './src/middleware/auth.js'
import userModel from './DB/model/User.model.js'
import { initIo } from './src/utils/server.js'

const app = express()
const port = process.env.PORT || 5000;
app.use("/uploads" , express.static('./src/uploads'))

bootstrap(app, express)

const httpServer = app.listen(port, () => console.log(chalk.blue(`Example app listening on port`) + " " + chalk.green(`${port}!`)))

//socket Io
// const io = initIo(httpServer)
// io.on('connection', (socket) => {
//     console.log(socket.id);

//     socket.on("updateSocketId", async (data) => {
//         console.log(data);
//         const { _id } = await socketAuth(data.token, Object.values(roles), socket.id)
//         if (_id) {
//             await userModel.updateOne({ _id }, { socketId: socket.id })
//             socket.emit("updateSocketId", "Done")
//         }
//     })

// })
