import { v4 as uuid } from 'uuid';

exports.seed = async function (knex) {
  await knex('work_diary').del();

  const student = await knex('user').where('role', 'student').first();
  const application = await knex('application').first();

  await knex('work_diary').insert([
    {
      id: uuid(),
      student_id: student.id,
      application_id: application.id,
      content: 'Worked on backend APIs and documentation.',
      status: 'submitted',
    },
  ]);
};
