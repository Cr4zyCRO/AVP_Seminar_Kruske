// repo/companies.js
//import Company from '../models/Company.js'; // Pretpostavka da se može importovati Company model unatoč module.exports u samom modelu

//import CompanyModule from '../models/Company.js';
//const Company = CompanyModule.default || CompanyModule;
import Company from '../models/Company.js'; // CommonJS Uvoz

/**
 * Repozitorij za upravljanje podacima Kompanija (Company).
 * Koristi ORM (Objection.js/Knex).
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
        
        // 1. Primjena Filtriranja (Filters)
        if (address) {
            query = query.where('LOWER(address)', address.toLowerCase()); // select * where lower(address)...
        }

        if (city) {
            // Pretraga po gradu mora biti case-insensitive ako to dozvoljava baza
            query = query.whereRaw('LOWER(city) = ?', city.toLowerCase()); // select * where lower(city)...
        }

        // 2. Primjena Pretrage (Search)
        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            // Traženje po company_oib, adresi, mailu (primjer)
            query = query.where((builder) => {
                builder
                    .whereRaw('LOWER(company_oib) LIKE ?', searchTerm)
                    .orWhereRaw('LOWER(address) LIKE ?', searchTerm)
                    .orWhereRaw('LOWER(email) LIKE ?', searchTerm);
            });
        }

        // 3. Definicija upita za sortiranje
        if (sortBy === 'city') {
            // Sortiranje po company_oib umjesto name, kao što je zahtijevano
            query = query.orderBy('city', 'asc');
        }
        else if (sortBy === 'address') {
            query = query.orderBy('address', 'asc');
        }
        else {
            // Default sortiranje
            query = query.orderBy('id', 'asc');
        }

        // 4. Izvršavanje paginiranog upita
        const result = await query.page(pageNum - 1, limitNum);

        // 5. Vraćanje strukturiranog odgovora
        return {
            data: result.results,
            total: result.total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(result.total / limitNum)
        };
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

export default CompanyRepository;