const { v4: uuid } = require('uuid');

exports.seed = async function (knex) {
  await knex('user').del();

  await knex('user').insert([
    {
      id: uuid(),
      firstname: 'Admin',
      lastname: 'Superuser',
      email: 'admin@example.hr',
      password: '$2b$10$w0J5Cm6MI.EL2.i9Lti/d.EnxeFIyHpTFvtw2msuJLDvRybaLuTRi',
      role: 'admin',
      jmbag: '0012345677',
      oib: '12345678900',
    },
    {
      id: uuid(),
      firstname: 'Stipe',
      lastname: 'Stipić',
      email: 'ss887121@unist.hr',
      password: '$2b$10$w0J5Cm6MI.EL2.i9Lti/d.EnxeFIyHpTFvtw2msuJLDvRybaLuTRi',
      role: 'student',
      jmbag: '0012345678',
      oib: '12345678901',
    },
    {
      id: uuid(),
      firstname: 'Ante',
      lastname: 'Antić',
      email: 'antic@gmail.com',
      password: '$2b$10$w0J5Cm6MI.EL2.i9Lti/d.EnxeFIyHpTFvtw2msuJLDvRybaLuTRi',
      role: 'mentor',
      jmbag: '0012345679',
      oib: '12345678902',
    },
    {
      id: uuid(),
      firstname: 'Iva',
      lastname: 'Ivić',
      email: 'i.ivic@unist.hr',
      password: '$2b$10$w0J5Cm6MI.EL2.i9Lti/d.EnxeFIyHpTFvtw2msuJLDvRybaLuTRi',
      role: 'professor',
      jmbag: '0012345680',
      oib: '12345678903',
    },
  ]);
};
