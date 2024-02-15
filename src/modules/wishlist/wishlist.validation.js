import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'



export const checkId = joi.object({
    medicineId: generalFields.id
}).required()


