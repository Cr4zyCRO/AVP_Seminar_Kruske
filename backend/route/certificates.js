import express from "express";
import Joi from "joi";
import { getActiveCompanies, getCompanyById } from "../repo/companies.js";
import { authorizeStudent, jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query, params } from "../middleware/validate.js";         // Middleware za Joi validaciju

const router = express.Router();


router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    authorizeStudent, // provjera da samo student može pozvati ovaj endpoint
    async (req, res) => {
        try {
            
            const result = await getUserCertificates(req.user.id); // this req.user.id should return currently logged in user certificates
                            
            res.json(result);
        } catch (err) {
            console.error("Error fetching companies:", err.message);
            res.status(500).json({ error: "Failed to fetch user certificates list" });
        }
    }
)


export default router;