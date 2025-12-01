/**
 * Knex migration to create full internship/practice schema
 */

exports.up = async function (knex) {
  // =========================
  // user
  // =========================
  await knex.schema.createTable('user', (table) => {
    table.uuid('id').primary();
    table.string('firstname');
    table.string('lastname');
    table.string('email').notNullable().unique();
    table.string('password');
    table.string('role');
    table.string('jmbag').notNullable().unique();
    table.string('oib').notNullable().unique();

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());
  });

  // =========================
  // sector
  // =========================
  await knex.schema.createTable('sector', (table) => {
    table.uuid('id').primary();
    table.string('sector_name', 255).notNullable().unique();
    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());
  });

  // =========================
  // company
  // =========================
  await knex.schema.createTable('company', (table) => {
    table.uuid('id').primary();
    table.string('company_oib', 20).notNullable();
    table.string('address', 255);
    table.string('city', 108);
    table.string('email', 255).notNullable().unique();
    table.string('owner_id', 255).notNullable();
    table.uuid('sector_id').notNullable();

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());

    table.foreign('sector_id').references('sector.id').onDelete('CASCADE');
    table.foreign('owner_id').references('user.id').onDelete('CASCADE');
  });

  // =========================
  // application
  // =========================
  await knex.schema.createTable('application', (table) => {
    table.uuid('id').primary();
    table.uuid('student_id').notNullable();
    table.uuid('company_id').notNullable();
    table.uuid('company_mentor_id').notNullable();
    table.uuid('faculty_mentor_id').notNullable();

    table.text('uputnica_file');
    table.string('uptnica_status', 50).defaultTo('pending');
    table.string('status').defaultTo('submitted');

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());

    table.foreign('student_id').references('user.id').onDelete('CASCADE');

    table.foreign('company_id').references('company.id').onDelete('CASCADE');

    table
      .foreign('company_mentor_id')
      .references('user.id')
      .onDelete('SET NULL');

    table
      .foreign('faculty_mentor_id')
      .references('user.id')
      .onDelete('SET NULL');
  });

  // =========================
  // certificate
  // =========================
  await knex.schema.createTable('certificate', (table) => {
    table.uuid('id').primary();

    table.uuid('student_id').notNullable();
    table.uuid('application_id').notNullable();

    table.string('certificate_name', 255).notNullable();
    table.text('content');
    table.string('status', 50);

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());

    table.foreign('student_id').references('user.id').onDelete('CASCADE');

    table
      .foreign('application_id')
      .references('application.id')
      .onDelete('CASCADE');
  });

  // =========================
  // work_diary
  // =========================
  await knex.schema.createTable('work_diary', (table) => {
    table.uuid('id').primary();
    table.uuid('student_id').notNullable();
    table.uuid('application_id').notNullable();

    table.text('content').notNullable();
    table.string('status', 50).notNullable();

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());

    table.foreign('student_id').references('user.id').onDelete('CASCADE');
    table
      .foreign('application_id')
      .references('application.id')
      .onDelete('CASCADE');
  });

  // =========================
  // practice_report
  // =========================
  await knex.schema.createTable('practice_report', (table) => {
    table.uuid('id').primary();

    table.uuid('application_id').notNullable();
    table.uuid('student_id').notNullable();
    table.uuid('faculty_mentor_id');

    table.text('report_file');
    table.string('report_status', 50);
    table.string('final_grade', 10);

    table.timestamp('is_created').defaultTo(knex.fn.now());
    table
      .timestamp('is_updated')
      .defaultTo(knex.fn.now())
      .alter()
      .onUpdate(knex.fn.now());

    table
      .foreign('application_id')
      .references('application.id')
      .onDelete('CASCADE');

    table.foreign('student_id').references('user.id').onDelete('CASCADE');

    table
      .foreign('faculty_mentor_id')
      .references('user.id')
      .onDelete('SET NULL');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('practice_report');
  await knex.schema.dropTableIfExists('work_diary');
  await knex.schema.dropTableIfExists('certificate');
  await knex.schema.dropTableIfExists('application');
  await knex.schema.dropTableIfExists('company');
  await knex.schema.dropTableIfExists('sector');
  await knex.schema.dropTableIfExists('user');
};
