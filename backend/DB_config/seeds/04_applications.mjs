import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('application').del();

  const student = await knex('user').where('role', 'student').first();
  const companyMentor = await knex('user').where('role', 'mentor').first();
  const facultyMentor = await knex('user').where('role', 'professor').first();
  const company = await knex('company').first();

  await knex('application').insert([
    {
      id: uuid(),
      student_id: student.id,
      company_id: company.id,
      company_mentor_id: companyMentor.id,
      faculty_mentor_id: facultyMentor.id,
      uputnica_file: null,
      uptnica_status: 'pending',
      status: 'submitted',
    },
  ]);
}
