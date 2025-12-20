import express from "express";
import Joi from "joi";
import CompanyController from "../controllers/companiesController.js"; 
import { jwtCheck } from "../middleware/authMiddleware.js"; 
import { query, params } from "../middleware/validate.js"; 

// Destrukturiramo funkcije iz kontrolera
const { getCompanies, getCompanyDetails } = CompanyController;

const router = express.Router();

// --- JOI SHEME ZA VALIDACIJU ---

// Validacija query parametara za listu (GET /)
const getCompaniesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('address', 'city', 'id', 'name').default('id'), 
    
    // Filtriranje po ID-u sektora (UUID)
    sectorId: Joi.string().uuid().optional(),
    
    // Filtriranje po gradu
    city: Joi.string().max(100).optional(), 
    
    // Pretraživanje po nazivu kompanije (min 3 znaka)
    search: Joi.string().min(3).max(255).optional().allow(''),
});

// Validacija ID parametra za detalje (GET /:id)
const getCompanyParamsSchema = Joi.object({
    id: Joi.string().guid({ version: 'uuidv4' }).required(), 
});

// --- RUTE ---

/**
 * @route   GET /companies
 * @desc    Dohvaća listu aktivnih kompanija s paginacijom i filterima
 * @access  Private (JWT)
 */
router.get(
    "/", 
    jwtCheck,                   // Provjera tokena
    query(getCompaniesSchema),  // Validacija queryja (search, page, sectorId...)
    getCompanies                // Funkcija iz kontrolera
);

/**
 * @route   GET /companies/:id
 * @desc    Dohvaća detalje jedne kompanije prema ID-u
 * @access  Private (JWT)
 */
router.get(
    "/:id", 
    jwtCheck,                       // Provjera tokena
    params(getCompanyParamsSchema),  // Validacija da je ID ispravan UUID
    getCompanyDetails               // Funkcija iz kontrolera
);

export default router;