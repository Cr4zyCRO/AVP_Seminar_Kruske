/*
import express from "express";
import { getAllCompanies } from "../repo/companies.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

export default router;
*/

import express from "express";
import Joi from "joi";
import { getActiveCompanies } from "../repo/companies.js";
import { jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query } from "../middleware/validate.js";         // Middleware za Joi validaciju

const router = express.Router();

// Joi schema za validaciju query parametara (paginacija, sortiranje)
const getCompaniesSchema = {
    // Stranica mora biti broj >= 1, default 1
    page: Joi.number().integer().min(1).default(1),
    // Limit mora biti broj >= 1 i <= 100, default 10
    limit: Joi.number().integer().min(1).max(100).default(10),
    // Podržava samo sortiranje po 'name'
    sortBy: Joi.string().valid('name').default('name'), 
};

// GET /companies?page=1&limit=10&sortBy=name
// Endpoint za dohvat paginirane liste aktivnih kompanija
router.get(
    "/", 
    jwtCheck, // 1. Provjera autentičnosti JWT tokenom
    query(getCompaniesSchema), // 2. Validacija query parametara
    async (req, res) => {
        try {
            // Parametri su već validirani i postavljeni na defaultne vrijednosti
            const { page, limit, sortBy } = req.query;

            // Dohvat podataka iz repozitorija
            const result = await getActiveCompanies({ page, limit, sortBy });
            
            // Slanje paginiranog rezultata
            res.json(result);
        } catch (err) {
            console.error("Error fetching companies:", err.message);
            res.status(500).json({ error: "Failed to fetch company list" });
        }
    }
);

// Koristimo imenovani izvoz
//export const companiesRouter = router;
export default router;