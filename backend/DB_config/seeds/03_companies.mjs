import { v4 as uuid } from 'uuid';

exports.seed = async function (knex) {
  await knex('company').del();

  // get FK references
  const owner = await knex('user').where('role', 'mentor').first();
  const sector = await knex('sector')
    .where('sector_name', 'Information Technology')
    .first();

  await knex('company').insert([
    {
      id: uuid(),
      company_oib: '98765432101',
      address: 'Tech Street 5',
      city: 'Zagreb',
      email: 'company@example.com',
      owner_id: owner.id,
      sector_id: sector.id,
    },
  ]);
};
