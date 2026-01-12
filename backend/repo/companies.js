import db from "../DB_config/knex.js";

/**
 * Dohvaca paginiranu listu kompanija.
 * Sortiranje se vrsi po 'company_oib' umjesto 'name' za 'sortBy=name'.
 * @param {object} params - parametri za upit.
 * @param {number} params.page - trenutna stranica (default 1).
 * @param {number} params.limit - broj rezultata po stranici (default 10).
 * @param {string} params.sortBy - polje za sortiranje 
 * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
 */
export async function getActiveCompanies({ page = 1, limit = 10, sortBy, address, city, search, sectorId }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let query = db('company').select('*');

    // filtriranje po adresi
    if (address) {
        query = query.where('address', 'like', `%${address}%`);
    }

    // filtriranje po gradu
    if (city) {
        query = query.where('city', 'like', `%${city}%`);
    }

    // pretraga po email-u (company nema name polje)
    if (search) {
        query = query.where('email', 'like', `%${search}%`);
    }

    // filtriranje po sektoru
    if (sectorId) {
        query = query.where('sector_id', sectorId);
    }

    // sortiranje
    if (sortBy === 'name') {
        query = query.orderBy('company_oib', 'asc');
    } else {
        query = query.orderBy('id', 'asc');
    }

    // dohvati ukupni broj
    let countQuery = db('company').count('* as count');
    if (search) {
        countQuery = countQuery.where('email', 'like', `%${search}%`);
    }
    if (sectorId) {
        countQuery = countQuery.where('sector_id', sectorId);
    }
    const totalResult = await countQuery.first();
    const total = totalResult.count;

    // primijeni paginaciju
    const data = await query.limit(limitNum).offset(offset);

    return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
    };
}

/**
 * Dohvaca kompaniju prema ID-u.
 * @param {string} id - UUID kompanije.
 * @returns {Promise<object|null>}
 */
export async function getCompanyById(id) {
    const company = await db('company')
        .where('id', id)
        .first();

    return company || null;
}
