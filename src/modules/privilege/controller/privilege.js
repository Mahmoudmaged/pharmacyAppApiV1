
import privilegeModel from '../../../../DB/model/privilege.js';
import { asyncHandler } from '../../../utils/errorHandling.js';


export const createPrivilege = asyncHandler(async (req, res, next) => {
    const { title, label } = req.body;
    if (await privilegeModel.findOne({ title })) {
        return next(new Error(`Duplicate privilege set name ${title}`, { cause: 409 }))
    }
    const privilege = await privilegeModel.create({
        title,
        label,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: 'Done', privilege })
})

export const updatePrivilege = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { title } = req.body;

    const privilege = await privilegeModel.findById(id)
    if (!privilege) {
        return next(new Error(`Not found`, { cause: 404 }))
    }

    if (title.toLowerCase() == privilege.title) {
        return next(new Error(`Cannot update privilege set with the same old name: ${title}`, { cause: 400 }))
    }

    if (await privilegeModel.findOne({ title })) {
        return next(new Error(`Duplicate privilege set name: ${title}`, { cause: 409 }))
    }
    req.body.updatedBy = req.user._id
    const updatedPrivilege = await privilegeModel.updateOne({ _id: id }, req.body)
    return res.status(200).json({ message: 'Done', updatedPrivilege })
})


export const deletePrivilege = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const privilege = await privilegeModel.deleteOne({ _id: id })
    if (!privilege) {
        return next(new Error(`In-valid  privilege set item or  privilege set not exist`, { cause: 400 }))
    }

    return res.status(200).json({ message: 'Done', privilege })
})

export const getAll = asyncHandler(async (req, res, next) => {

    const privilege = await privilegeModel.find()
    return res.status(200).json({ message: 'Done', privilege })
})

export const getById = asyncHandler(async (req, res, next) => {

    const privilege = await privilegeModel.findById(req.params.id)
    return res.status(200).json({ message: 'Done', privilege })
})




// export const updatePrivilegeItem = asyncHandler(async (req, res, next) => {
//     const { id, itemId } = req.params;
//     const { title } = req.body;

//     const privilege = await privilegeModel.findOneAndUpdate(
//         { _id: id, actions: { $elemMatch: { _id: itemId } } },
//         {
//             $set: { [`actions.$[outer].title`]: title },
//             updatedBy: req.user._id
//         },
//         {
//             "arrayFilters": [{ "outer._id": itemId }],
//             new: true
//         }

//     )
//     if (!privilege) {
//         return next(new Error(`In-valid  privilege set item or  privilege set not exist`, { cause: 400 }))
//     }

//     return res.status(200).json({ message: 'Done', privilege })
// })

// export const deletePrivilegeItem = asyncHandler(async (req, res, next) => {
//     const { id, itemId } = req.params;
//     const privilege = await privilegeModel.findOneAndUpdate(
//         { _id: id, actions: { $elemMatch: { _id: itemId } } },
//         {
//             $pull: { actions: { _id: itemId } },
//             updatedBy: req.user._id
//         },
//         {
//             new: true,
//         }

//     )
//     if (!privilege) {
//         return next(new Error(`In-valid  privilege set item or  privilege set not exist`, { cause: 400 }))
//     }

//     return res.status(200).json({ message: 'Done', privilege })
// })

// export const addPrivilegeItem = asyncHandler(async (req, res, next) => {
//     const { id } = req.params;
//     const privilege = await privilegeModel.findOneAndUpdate(
//         { _id: id },
//         {
//             $addToSet: { actions: { title: req.body.title } },
//             updatedBy: req.user._id
//         },
//         {
//             new: true,
//         }
//     )
//     if (!privilege) {
//         return next(new Error(`In-valid  privilege set or  privilege set not exist`, { cause: 404 }))
//     }
//     return res.status(200).json({ message: 'Done', privilege })
// })




