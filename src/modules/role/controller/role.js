import roleModel from '../../../../DB/model/Role.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';

//create
export const createRole = asyncHandler(async (req, res, next) => {
    const { title, privileges } = req.body;
    if (await roleModel.findOne({ title })) {
        return next(new Error(`Duplicate Role  name ${title}`, { cause: 409 }))
    }
    const Role = await roleModel.create({
        title,
        privileges,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: 'Done', Role })
})
export const addRoleItem = asyncHandler(async (req, res, next) => {
    const { roleId } = req.params;
    const { privileges } = req.body;
    const privilege = await roleModel.findById(roleId)
    if (!privilege) {
        return next(new Error(`not exist`, { cause: 404 }))
    }

    const Role = await roleModel.updateOne({ _id: roleId }, {
        $addToSet: { privileges },
        updatedBy: req.user._id
    })
    return res.status(200).json({ message: 'Done', Role })
})
//get
export const getAll = asyncHandler(async (req, res, next) => {
    const Role = await roleModel.find().populate({
        path: 'privileges',
        options: {
            localField: 'privileges', // Specify the local field in the 'roles' collection
            foreignField: 'actions._id'
        }
        // populate: { path: 'actions' }
    })
    return res.status(200).json({ message: 'Done', Role })
})
export const getById = asyncHandler(async (req, res, next) => {

    const Role = await roleModel.findById(req.params.roleId)
    return res.status(200).json({ message: 'Done', Role })
})
//delete
export const deleteRoleItem = asyncHandler(async (req, res, next) => {
    const { roleId, privilegeId } = req.params;

    const Role = await roleModel.findOneAndUpdate(
        { _id: roleId },
        {
            $pull: { privileges: privilegeId },
            updatedBy: req.user._id
        },
        {
            new: true,
        }

    )
    if (!Role) {
        return next(new Error(`In-valid  Role set item or  Role set not exist`, { cause: 400 }))
    }

    return res.status(200).json({ message: 'Done', Role })
})
export const deleteRole = asyncHandler(async (req, res, next) => {
    const { roleId } = req.params;
    const Role = await roleModel.deleteOne({ _id: roleId })
    if (!Role) {
        return next(new Error(`In-valid  Role set item or  Role set not exist`, { cause: 400 }))
    }
    return res.status(200).json({ message: 'Done', Role })
})
//update
export const updateRole = asyncHandler(async (req, res, next) => {
    const { roleId } = req.params;
    const { title } = req.body;

    const role = await roleModel.findById(roleId)
    if (!role) {
        return next(new Error(`Not found`, { cause: 404 }))
    }

    if (title.toLowerCase() == role.title) {
        return next(new Error(`Cannot update role set with the same old name: ${title}`, { cause: 400 }))
    }

    if (await roleModel.findOne({ title })) {
        return next(new Error(`Duplicate role set name: ${title}`, { cause: 409 }))
    }
    req.body.updatedBy = req.user._id
    const updatedRole = await roleModel.updateOne({ _id: roleId }, req.body)
    return res.status(200).json({ message: 'Done', updatedRole })
})







