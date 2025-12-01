import { v4 as uuid } from 'uuid';

export async function seed(knex) {
  await knex('practice_report').del();

  const student = await knex('user').where('role', 'student').first();
  const application = await knex('application').first();
  const facultyMentor = await knex('user').where('role', 'professor').first();

  await knex('practice_report').insert([
    {
      id: uuid(),
      application_id: application.id,
      student_id: student.id,
      faculty_mentor_id: facultyMentor.id,
      report_file: null,
      report_status: 'draft',
      final_grade: null,
    },
  ]);
}
