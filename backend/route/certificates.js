import express from "express";
import Joi from "joi";
import { authorizeStudent, jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import CompanyController from "../controllers/certificatesController.js"


const { getCertificateContent, getCertificates } = CompanyController
const router = express.Router();


const getCertificateContentParamsSchema = {
    id: Joi.string().guid({ version: 'uuidv4' }).required(), 
};

/**
 * @route   GET /certificates
 * @desc    Dohvaća listu svih userovih certifikata
 * @access  Private (JWT)
 */

router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    authorizeStudent, // provjera da samo student može pozvati ovaj endpoint
    getCertificates
)

/**
 * @route   GET /certificates/:certificateId
 * @desc    Dohvaća pdf content certifikata
 * @access  Private (JWT)
 */
router.get(
    "/:certificateId",
    jwtCheck,
    params(getCertificateContentParamsSchema),
    getCertificateContent
)

export default router;