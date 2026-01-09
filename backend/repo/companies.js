import db from "../DB_config/knex.js";

/**
 * Dohvaca paginiranu listu kompanija.
 
  Sortiranje se vrsi po 'company_oib' umjesto 'name' za 'sortBy=name'.
 * @param {object} params - parametri za upit.
 * @param {number} params.page - trenutna stranica (default 1).
 * @param {number} params.limit - broj rezultata po stranici (default 10).
 * @param {string} params.sortBy - polje za sortiranje 
 * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
 */
class CompanyRepository {

    /**
     * Dohvaća paginiranu listu kompanija, filtriranu i pretraživanu, te ukupni broj zapisa.
     * Sortiranje se vrši po 'company_oib' ako je 'sortBy' postavljen na 'name'.
     *
     * @param {object} params - parametri za upit.
     * @param {number} [params.page=1] - trenutna stranica.
     * @param {number} [params.limit=10] - broj rezultata po stranici.
     * @param {string} [params.sortBy='name'] - polje za sortiranje.
     * @param {string} [params.address] - Adresa za filtriranje
     * @param {string} [params.city] - Grad za filtriranje.
     * @param {string} [params.search] - String za pretragu (djelomični match).
     * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
     */
    async getActiveCompanies({ page = 1, limit = 10, sortBy, address, city, search }) { // req.query dolazi ovde
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        let query = Company.query().select('*');
        
        .select('*') 
    
        .limit(limitNum)
        .offset(offset);

    // opcionalno sortiranje (koristi company_oib umjesto name)
    if (sortBy === 'name') {
        // sortiranje po company_oib
        query = query.orderBy('company_oib', 'asc');
    } else {
        // default sortiranje
        query = query.orderBy('id', 'asc');
    }

    /**
     * Dohvaća kompaniju prema ID-u.
     * @param {string} id - UUID kompanije.
     * @returns {Promise<Company|null>}
     */
    async getCompanyById(id) {
        const company = await Company.query().findById(id); 
        return company || null;
    }
}

    return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
    };
}

export async function getCompanyById(id) {
    const company = await db('company')
        .where('id', id)
        .first();

    return company || null;
}
