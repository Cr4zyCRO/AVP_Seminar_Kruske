import db from "../DB_config/knex.js";

export async function getUserCertificates(userId) {
    const certificates = await db('certificates')
        .where('userId', userId)
        .first();

    return certificates || null;
}