
import pharmacyRouter from "../pharmacy/pharmacy.router.js";

import { Router } from "express";
const router = Router();
router.use("/pharmacy", pharmacyRouter);


export default router;
