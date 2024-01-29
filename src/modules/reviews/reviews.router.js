import { auth } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './reviews.validation.js'
import { endpoint } from './reviews.endPoint.js'

import * as reviewController from './controller/review.js'
import { Router } from "express";
const router = Router({ mergeParams: true })




router.post("/",
    auth(endpoint.createReview),
    validation(validators.createReview),
    reviewController.createReview)

router.put("/:reviewId",
    auth(endpoint.updateReview),
    validation(validators.updateReview),
    reviewController.updateReview)




export default router