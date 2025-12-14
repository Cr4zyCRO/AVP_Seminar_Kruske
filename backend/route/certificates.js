import express from "express";
import Joi from "joi";
import { getActiveCompanies, getCompanyById } from "../repo/companies.js";
import { jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query, params } from "../middleware/validate.js";         // Middleware za Joi validaciju

const router = express.Router();


router.get(
    "/", 
        jwtCheck, // provjera jwt tokena
        async (req, res) => {
            try {
                
                let userId = 0;
                // privremeno settamo na 0, očekivano je da ovisno o tome koji je 
                // korisnik logiran da se njegovi certifikati prikažu
                const result = await getUserCertificates(userId);
                                
                res.json(result);
            } catch (err) {
                console.error("Error fetching companies:", err.message);
                res.status(500).json({ error: "Failed to fetch user certificates list" });
            }
        }
)


export default router;