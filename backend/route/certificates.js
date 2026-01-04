import express from "express";
import Joi from "joi";
import { query, params } from "../middleware/validate.js"; 
import { authorizeStudent, jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import CompanyController from "../controllers/certificatesController.js"


const { getCertificateContent, getCertificates } = CompanyController
const router = express.Router();


// Validacija ID parametra za detalje (GET /:id)
const getCompanyParamsSchema = {
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
);

/**
 * @route   GET /certificates/:id
 * @desc    Dohvaća pdf content certifikata
 * @access  Private (JWT)
 */

router.get(
    "/:id",
    jwtCheck,
    params(getCompanyParamsSchema),
    getCertificateContent
);

export default router;