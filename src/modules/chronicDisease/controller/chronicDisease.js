import ChronicDiseaseModel from '../../../../DB/model/ChronicDisease.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';


export const getChronicDiseaseList = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const chronicDisease = await ChronicDiseaseModel.find({ isDeleted: req.query.freeze == 'true' ? true : false }).populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", chronicDiseases: chronicDisease })
})

export const getChronicDiseaseById = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const chronicDisease = await ChronicDiseaseModel.findById(req.params.chronicDiseaseId).populate([
        {
            path: "createdBy"
        },
        {
            path: "updatedBy"
        },
    ])

    return chronicDisease ?
        res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", chronicDisease }) :
        next(new Error(lang == "EN" ? 'In-valid chronicDisease ID' : " لم يتم العثور علي  نتيجه ", { cause: { code: 404, customCode: 1004 } }));
})


export const createChronicDisease = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const { disease } = req.body;
    if (
        await ChronicDiseaseModel.findOne({
            $or: [
                { "disease.EN": disease.EN },
                { "disease.AR": disease.AR },

            ]
        })
    ) {
        return next(new Error(lang == "EN" ? `Duplicate disease name` : "عفوا يوجد بالفعل مرض مسجل بهذا الاسم", { cause: { code: 409, customCode: 1011 } }))
    }

    const chronicDisease = await ChronicDiseaseModel.create({
        disease,
        createdBy: req.user._id
    })
    return res.status(201).json({ message: lang == "EN" ? 'Done' : "تم", chronicDisease })
})

export const updateChronicDisease = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";

    const chronicDisease = await ChronicDiseaseModel.findById(req.params.chronicDiseaseId)

    if (!chronicDisease) {
        return next(new Error(lang == "EN" ? 'In-valid chronicDisease ID' : "لم يتم العثور    ", { cause: { code: 404, customCode: 1004 } }));

    }
    if (req.body.disease) {
        if (req.body?.disease?.AR) {
            if (chronicDisease.disease.AR == req.body.disease.AR.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ? `Sorry cannot update chronicDisease with the old AR disease:${req.body.disease.AR}` : ` ${req.body.disease.AR}لا يمكن تحديث  بنفس الاسم العربي`
                    , { cause: { code: 409, customCode: 1011 } }))
            }
        }

        if (req.body?.disease?.EN) {
            if (chronicDisease.disease.EN == req.body.disease.EN.toLowerCase()) {
                return next(new Error(
                    lang == "EN" ? `Sorry  cannot update chronicDisease with the old EN disease:${req.body.disease.EN}` : ` ${req.body.disease.EN}لا يمكن تحديث  بنفس الاسم الانجليزي`,
                    { cause: { code: 409, customCode: 1011 } }))
            }
        }


        if (await ChronicDiseaseModel.findOne({
            $or: [
                { "disease.EN": req.body.disease.EN },
                { "disease.AR": req.body.disease.AR },
            ]
        })) {
            return next(new Error(lang == "EN" ? `Duplicate chronicDisease disease` : "عفوا يوجد بالفعل علامه تجاريه مسجله بهذا الاسم", { cause: { code: 409, customCode: 1011 } }))
        }

        chronicDisease.disease = {
            AR: req.body.disease?.AR ? req.body.disease?.AR : chronicDisease.disease.AR,
            EN: req.body.disease?.EN ? req.body.disease?.EN : chronicDisease.disease.EN
        }

    }


    chronicDisease.updatedBy = req.user._id
    await chronicDisease.save()
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", chronicDisease })
})

export const deleteChronicDisease = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const chronicDisease = await ChronicDiseaseModel.findByIdAndUpdate(req.params.chronicDiseaseId, { isDeleted: true, updatedBy: req.user._id }, { new: true })
    if (!chronicDisease) {
        return next(new Error(lang == "EN" ? 'In-valid chronicDisease ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
    }
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", chronicDisease })
})

export const unfreezeChronicDisease = asyncHandler(async (req, res, next) => {
    const lang = req.headers.lang || "EN";
    const chronicDisease = await ChronicDiseaseModel.findByIdAndUpdate(req.params.chronicDiseaseId, { isDeleted: false, updatedBy: req.user._id }, { new: true })
    if (!chronicDisease) {
        return next(new Error(lang == "EN" ? 'In-valid chronicDisease ID' : "لم يتم العثور علي  العلامه التجاريه", { cause: { code: 404, customCode: 1004 } }));
    }
    return res.status(200).json({ message: lang == "EN" ? 'Done' : "تم", chronicDisease })
})