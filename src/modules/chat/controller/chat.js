import userModel from "../../../../DB/model/User.model.js";
import chatModel from "../../../../DB/model/chat.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { getIo } from "../../../utils/server.js";



export const sendMessage = asyncHandler(async (req, res, next) => {
    const { message, destId } = req.body;

    const destUser = await userModel.findById(destId)
    if (!destUser) {
        return next(new Error("In-valid user", { cause: 404 }))
    }

    const chat = await chatModel.findOne({
        $or: [
            { POne: req.user._id, PTwo: destId },
            { POne: destId, PTwo: req.user._id },
        ]
    }).populate([
        {
            path: "POne"
        },
        {
            path: "PTwo"
        }
    ])

    if (!chat) {
        const chat = await chatModel.create({
            POne: req.user._id,
            PTwo: destId,
            messages: [{
                from: req.user._id,
                to: destId,
                message
            }]
        })
        getIo().to(destUser.socketId).emit('receiveMessage', message)
        return res.status(201).json({ message: "Done", chat })
    }

    chat.messages.push({
        from: req.user._id,
        to: destId,
        message
    })
    await chat.save()
    getIo().to(destUser.socketId).emit('receiveMessage', message)
    return res.status(200).json({ message: 'Done', chat })

})

export const getChat = asyncHandler(async (req, res, next) => {

    const { destId } = req.params;
    const chat = await chatModel.findOne({
        $or: [
            { POne: req.user._id, PTwo: destId },
            { POne: destId, PTwo: req.user._id },
        ]

    }).populate([
        {
            path: "POne"
        },
        {
            path: "PTwo"
        }
    ])

    return res.status(200).json({ message: "Done", chat })
})