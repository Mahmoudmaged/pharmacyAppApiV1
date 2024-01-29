import userModel from '../../../../DB/model/User.model.js'
import { asyncHandler } from '../../../utils/errorHandling.js'



export const userList  = asyncHandler(async(req,res,next)=>{
    const users = await userModel.find({_id:{$ne:req.user._id}});
    return  res.status(200).json({message:"Done" , users})
})