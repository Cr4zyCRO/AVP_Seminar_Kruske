import express from "express";
import Joi from "joi";
import { getActiveCompanies, getCompanyById, createCompany, updateCompany } from "../repo/companies.js";
import { jwtCheck, authorizeAdmin } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query, params, body } from "../middleware/validate.js";         // Middleware za Joi validaciju
import { createCompanySchema, updateCompanySchema } from "../middleware/validation/companyValidator.js";
const router = express.Router();

const getCompaniesSchema = {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name').default('name'),
    search: Joi.string().allow('').optional(),
    sectorId: Joi.string().guid({ version: 'uuidv4' }).optional().allow(''),
};


const getCompanyParamsSchema = {
    // ID mora biti ispravan UUID
    id: Joi.string().guid({ version: 'uuidv4' }).required(), 
};


// Endpoint za dohvat paginirane liste aktivnih kompanija
router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    query(getCompaniesSchema), // validacija query parametara
    async (req, res) => {
        try {
            // parametri su vec validirani i postavljeni na defaultne vrijednosti
            const { page, limit, sortBy, search, sectorId } = req.query;

            // dohvat podataka iz repo
            const result = await getActiveCompanies({ page, limit, sortBy, search, sectorId });
            
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


// Endpoint za kreiranje nove kompanije
router.post(
  "/",                   // PUT ili POST na /companies
  jwtCheck,              // samo prijavljeni korisnici
  authorizeAdmin,        // samo admin
  body(createCompanySchema), // Joi validacija
  async (req, res) => {
    try {
      const company = await createCompany(req.body);
      res.status(201).json(company);
    } catch (err) {
      console.error("Error creating company:", err.message);
      res.status(500).json({ error: "Failed to create company" });
    }
  }
);

router.put(
  "/:id",
  jwtCheck,
  authorizeAdmin,
  body(updateCompanySchema),
  async (req, res) => {
    try {
      console.log(req.body);
      const company = await updateCompany(req.params.id, req.body);
      if (!company) {
        return res.status(404).json({ error: `Company with ID ${req.params.id} not found.` });
      }
      res.json(company);
    } catch (err) {
      console.error(`Error updating company with ID ${req.params.id}:`, err.message);
      res.status(500).json({ error: "Failed to update company"});
    }
  }
);



export default router;