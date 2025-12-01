import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import Knex from 'knex';
import { staging } from './knexfile.mjs';

// za migraciju pokrenite ovaj file ili priko "node runMigrationAndSeed.js" ili npm run start:migration

const knex = Knex(staging);

async function runLatestMigration() {
  try {
    const migrationsDir = path.resolve('./DB_config/migrations');
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.mjs'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    const latestFile = files[files.length - 1];
    console.log('Running latest migration:', latestFile);

    const migrationPath = pathToFileURL(
      path.join(migrationsDir, latestFile)
    ).href;
    const migration = await import(migrationPath);

    if (migration.up) {
      await migration.up(knex);
    } else if (migration.default?.up) {
      await migration.default.up(knex);
    } else {
      throw new Error('Migration file does not export "up" function.');
    }

    console.log('Migration ran successfully.');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

async function runSeeds() {
  try {
    const seedsDir = path.resolve('./DB_config/seeds');
    const files = fs
      .readdirSync(seedsDir)
      .filter((f) => f.endsWith('.mjs'))
      .sort();

    if (files.length === 0) {
      console.log('No seed files found.');
      return;
    }

    for (const file of files) {
      console.log('Running seed:', file);
      const seedPath = pathToFileURL(path.join(seedsDir, file)).href;
      const seed = await import(seedPath);

      if (seed.seed) {
        await seed.seed(knex);
      } else if (seed.default?.seed) {
        await seed.default.seed(knex);
      } else {
        console.error(`Seed file ${file} does not export "seed" function.`);
      }

      console.log(`Seed ${file} ran successfully.`);
    }
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  }
}

async function main() {
  try {
    await runLatestMigration();
    await runSeeds();
  } finally {
    await knex.destroy();
  }
}

main();
