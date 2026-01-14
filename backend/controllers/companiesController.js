// controllers/companiesController.cjs

// Uvozimo instancu Repozitorija koristeći CommonJS
import { getActiveCompanies, getCompanyById, createCompany, updateCompany}  from '../repo/companies.js'; 

/**
 * Dohvaća paginiranu listu kompanija.
 */
async function getCompanies(req, res) {
    try {
        const { page, limit, sortBy, city, address ,search } = req.query;
        const result = await getActiveCompanies({ page, limit, sortBy, city, address ,search });
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
        const company = await getCompanyById(id);
        if (!company) {
            return res.status(404).json({ error: `Company with ID ${id} not found.` });
        }
        res.json(company);
    } catch (err) {
        console.error(`Error fetching company details for ID ${id}:`, err.message);
        res.status(500).json({ error: "Failed to fetch company details" });
    }
}

async function createNewCompany(req, res) {
  try {
    const company = await createCompany(req.body);
    res.status(201).json(company);
  } catch (err) {
    console.error("Create company error:", err.message);
    res.status(500).json({ error: "Failed to create company" });
  }
}


/**
 * Ažurira kompaniju po ID-u
 */
async function updateCompanyById(req, res) {
  const { id } = req.params;
  try {
    const company = await updateCompany(id, req.body);

    if (!company) {
      return res.status(404).json({ error: `Company with ID ${id} not found.` });
    }

    res.json(company);
  } catch (err) {
    console.error(`Update company error for ID ${id}:`, err.message);
    res.status(500).json({ error: "Failed to update company" });
  }
}

// Izvoz CommonJS-om
export default {
  getCompanies,
  getCompanyDetails,
  createNewCompany,
  updateCompanyById
};

