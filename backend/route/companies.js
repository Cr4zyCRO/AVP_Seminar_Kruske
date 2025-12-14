import express from "express";
import Joi from "joi";
// PROMENA: Uvozimo kontroler sa novom ekstenzijom
// Opet koristimo ES Modules za uvoz CommonJS, što je Node trebalo da reši.
import CompanyController from "../controllers/companiesController.js"; 
import { jwtCheck } from "../middleware/authMiddleware.js"; 
import { query, params } from "../middleware/validate.js"; 

// Destrukturiramo funkcije iz uvezenog objekta
const { getCompanies, getCompanyDetails } = CompanyController; // <--- PROMENA

const router = express.Router();

// 1. JOI SCHEMA DEFINICIJE ostaju u RUTE sloju (dio validacije ulaza)
const getCompaniesSchema = {
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(100).default(10),

    sortBy: Joi.string().valid('address', 'city').default('id'), 
    
    // NOVO: Filtriranje po ID-u sektora (pretpostavka UUID)
    sectorId: Joi.string().uuid().optional(),
    
    // NOVO: Filtriranje po gradu (string)
    city: Joi.string().max(100).optional(), 
    
    // NOVO: Pretraživanje po nazivu kompanije (djelomični string)
    search: Joi.string().min(3).max(255).optional().allow(''),
};

const getCompanyParamsSchema = {
    id: Joi.string().guid({ version: 'uuidv4' }).required(), 
};

// GET /companies?page=1&limit=10&sortBy=name
// Ruta sada SAMO poziva funkciju kontrolera
router.get(
    "/", 
    jwtCheck,
    query(getCompaniesSchema),
    getCompanies // Pozivamo Controller funkciju
);


// GET /companies/{id} (Detalji)
// Ruta sada SAMO poziva funkciju kontrolera
router.get(
    "/:id", 
    jwtCheck,
    params(getCompanyParamsSchema),
    getCompanyDetails // Pozivamo Controller funkciju
);


export default router;