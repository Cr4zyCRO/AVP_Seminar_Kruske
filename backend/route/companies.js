

import express from "express";
import Joi from "joi";
import { getActiveCompanies, getCompanyById } from "../repo/companies.js";
import { jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query, params } from "../middleware/validate.js";         // Middleware za Joi validaciju

const router = express.Router();

// joi schema za validaciju query parametara (paginacija, sortiranje)
const getCompaniesSchema = {
   
    page: Joi.number().integer().min(1).default(1),
    
    limit: Joi.number().integer().min(1).max(100).default(10),
    
    sortBy: Joi.string().valid('name').default('name'), 
};

// joi schema za validaciju ID parametra (GET /companies/{id})
const getCompanyParamsSchema = {
    // ID mora biti ispravan UUID
    id: Joi.string().guid({ version: 'uuidv4' }).required(), 
};

// GET /companies?page=1&limit=10&sortBy=name
// Endpoint za dohvat paginirane liste aktivnih kompanija
router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    query(getCompaniesSchema), // validacija query parametara
    async (req, res) => {
        try {
            // parametri su vec validirani i postavljeni na defaultne vrijednosti
            const { page, limit, sortBy } = req.query;

            // dohvat podataka iz repo
            const result = await getActiveCompanies({ page, limit, sortBy });
            
            // slanje paginiranog rezultata
            res.json(result);
        } catch (err) {
            console.error("Error fetching companies:", err.message);
            res.status(500).json({ error: "Failed to fetch company list" });
        }
    }
);




// GET /companies/{id} (Detalji) ---
// endpoint za dohvat detalja jedne kompanije
router.get(
    "/:id", 
    jwtCheck, // zasticeno za sve autentificirane korisnike
    params(getCompanyParamsSchema), // validacija ID-a
    async (req, res) => {
        const { id } = req.params;
   
        try {
            const company = await getCompanyById(id);

            if (!company) {
             
                return res.status(404).json({ error: `Company with ID ${id} not found.` });
            }

            // Vraca detalje kompanije
            res.json(company);

        } catch (err) {
            console.error(`Error fetching company details for ID ${id}:`, err.message);
            res.status(500).json({ error: "Failed to fetch company details" });
        }
    }
);



export default router;