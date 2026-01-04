import express from "express";
import Joi from "joi";
import { query, params } from "../middleware/validate.js"; 
import { authorizeStudent, jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import CertificatesController from "../controllers/certificatesController.js"

const router = express.Router();


/**
 * @route   GET /certificates
 * @desc    Dohvaća listu svih userovih certifikata
 * @access  Private (JWT)
 */

router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    authorizeStudent, // provjera da samo student može pozvati ovaj endpoint
    CertificatesController.getCertificates
);

/**
 * @route   GET /certificates/:id
 * @desc    Dohvaća pdf content certifikata
 * @access  Private (JWT)
 */

router.get(
    "/:id",
    jwtCheck,
    CertificatesController.getCertificateContent
);

export default router;