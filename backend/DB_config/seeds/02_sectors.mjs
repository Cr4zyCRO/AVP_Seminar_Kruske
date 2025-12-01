import { v4 as uuid } from 'uuid';

exports.seed = async function (knex) {
  await knex('sector').del();

  await knex('sector').insert([
    {
      id: uuid(),
      sector_name: 'Information Technology',
    },
    {
      id: uuid(),
      sector_name: 'Mechanical Engineering',
    },
    {
      id: uuid(),
      sector_name: 'Accounting and Finance',
    },
    {
      id: uuid(),
      sector_name: 'Electrical Engineering',
    },
    {
      id: uuid(),
      sector_name: 'Trade and Tourism Management',
    },
  ]);
};
