// controllers/companiesController.cjs

// Uvozimo instancu Repozitorija koristeći CommonJS
import CompanyRepository from '../repo/companies.js'; 

/**
 * Dohvaća paginiranu listu kompanija.
 */
async function getCompanies(req, res) {
    try {
        const { page, limit, sortBy, city, address ,search } = req.query;
        const result = await CompanyRepository.getActiveCompanies({ page, limit, sortBy, city, address ,search });
        res.json(result);
    } catch (err) {
        console.error("Error fetching companies:", err.message);
        res.status(500).json({ error: "Failed to fetch company list" });
    }
}


/**
 * Dohvaća detalje jedne kompanije po ID-u.
 */
async function getCompanyDetails(req, res) {
    const { id } = req.params;
    
    try {
        const company = await CompanyRepository.getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: `Company with ID ${id} not found.` });
        }
        res.json(company);
    } catch (err) {
        console.error(`Error fetching company details for ID ${id}:`, err.message);
        res.status(500).json({ error: "Failed to fetch company details" });
    }
}

// Izvoz CommonJS-om
export default {
    getCompanies,
    getCompanyDetails
};