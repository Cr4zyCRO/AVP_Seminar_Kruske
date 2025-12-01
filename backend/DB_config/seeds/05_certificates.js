const { v4: uuid } = require('uuid');

exports.seed = async function (knex) {
  await knex('certificate').del();

  const student = await knex('user').where('role', 'student').first();
  const application = await knex('application').first();

  await knex('certificate').insert([
    {
      id: uuid(),
      student_id: student.id,
      application_id: application.id,
      certificate_name: 'Internship Approval Certificate',
      content: 'Approved for practical training.',
      status: 'draft',
    },
  ]);
};
