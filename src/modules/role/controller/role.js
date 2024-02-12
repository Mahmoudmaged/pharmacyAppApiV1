import roleModel from '../../../../DB/model/Role.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';

//create
export const createRole = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const { title, privileges } = req.body;
    if (await roleModel.findOne({ title })) {
        return next(new Error(lang == "EN" ? `Duplicate Role  name ${title}` : "يوجد بالفعل صلاحيه بنفس الاسم", { cause: { code: 409, customCode: 1011 } }))
    }
    const Role = await roleModel.create({
        title,
        privileges,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})

export const addRoleItem = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const { roleId } = req.params;
    const { privileges } = req.body;
    const privilege = await roleModel.findById(roleId)
    if (!privilege) {
        return next(new Error(lang == "EN" ? `not exist` : "لا توجد صلاحيه بهذا اللاسم", { cause: { code: 404, customCode: 1004 } }))
    }

    const Role = await roleModel.updateOne({ _id: roleId }, {
        $addToSet: { privileges },
        updatedBy: req.user._id
    })
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})


//get
export const getAll = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const Role = await roleModel.find().populate({
        path: 'privileges',
        options: {
            localField: 'privileges', // Specify the local field in the 'roles' collection
            foreignField: 'actions._id'
        }
        // populate: { path: 'actions' }
    })
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})
export const getById = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const Role = await roleModel.findById(req.params.roleId)
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})


//delete
export const deleteRoleItem = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

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
        return next(new Error(lang == "EN" ? `In-valid  Role set item or  Role set not exist` : "خطاء لاتوجد الصلاحيه المطلويه", { cause: { code: 404, customCode: 1004 } }))
    }

    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})
export const deleteRole = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { roleId } = req.params;
    const Role = await roleModel.deleteOne({ _id: roleId })
    if (!Role) {
        return next(new Error(lang == "EN" ? `In-valid  Role set item or  Role set not exist` : "خطاء لاتوجد الصلاحيه المطلويه", { cause: { code: 404, customCode: 1004 } }))

    }
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", Role })
})


//update
export const updateRole = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { roleId } = req.params;
    const { title } = req.body;

    const role = await roleModel.findById(roleId)
    if (!role) {
        return next(new Error(lang == "EN" ? `not exist` : "لا توجد صلاحيه بهذا اللاسم", { cause: { code: 404, customCode: 1004 } }))

    }

    if (title.toLowerCase() == role.title) {
        return next(new Error(lang == "EN" ? `Cannot update role set with the same old name: ${title}` : "لا يمكن التحديث باستخدم نفس الاسم", { cause: { code: 409, customCode: 1011 } }))
    }

    if (await roleModel.findOne({ title })) {
        return next(new Error(lang == "EN" ? `Duplicate role set name: ${title}` : "توجد بالفعل صلاحيه تحمل نفس الاسم", { cause: { code: 409, customCode: 1011 } }))
    }
    req.body.updatedBy = req.user._id
    const updatedRole = await roleModel.updateOne({ _id: roleId }, req.body)
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", updatedRole })
})







