//import db from "../DB_config/knex.js"; 

//export async function getAllCompanies() {
//  return db("company").select("*");
//}

import db from "../DB_config/knex.js";

/**
 * Dohvaca paginiranu listu kompanija.
 * PRILAGOĐENO: Privremeno uklonjen filter 'is_active' jer polje ne postoji u bazi.
 * PRILAGOĐENO: Sortiranje se vrši po 'company_oib' umjesto 'name' za 'sortBy=name'.
 * @param {object} params - Parametri za upit.
 * @param {number} params.page - Trenutna stranica (default 1).
 * @param {number} params.limit - Broj rezultata po stranici (default 10).
 * @param {string} params.sortBy - Polje za sortiranje (trenutno podrzava 'name').
 * @returns {Promise<{data: Array, total: number, page: number, limit: number, totalPages: number}>}
 */
export async function getActiveCompanies({ page = 1, limit = 10, sortBy = 'name' }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // dohvati ukupan broj kompanija (bez filtera is_active)
    const countResult = await db('company')
        .count('id as total')
        .first();
    
    const total = parseInt(countResult.total, 10);

    // dohvati paginirane podatke
    let query = db('company')
        
        .select('*') 
    
        .limit(limitNum)
        .offset(offset);

    // opcionalno sortiranje (koristimo company_oib umjesto name)
    if (sortBy === 'name') {
        // Sortiranje po company_oib
        query = query.orderBy('company_oib', 'asc');
    } else {
        // Default sortiranje
        query = query.orderBy('id', 'asc');
    }

    const data = await query;

    return {
        data,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
    };
}