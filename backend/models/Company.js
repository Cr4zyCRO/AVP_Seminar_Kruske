import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Company extends Model {
  static get tableName() {
    return 'company';
  }

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['company_oib', 'email', 'owner_id', 'sector_id'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        company_oib: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        email: { type: 'string' },
        owner_id: { type: 'string', format: 'uuid' },
        sector_id: { type: 'string', format: 'uuid' },
      },
    };
  }

  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'company.owner_id',
          to: 'user.id',
        },
      },

      sector: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Sector.js'),
        join: {
          from: 'company.sector_id',
          to: 'sector.id',
        },
      },

      applications: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'company.id',
          to: 'application.company_id',
        },
      },
    };
  }
}

export default Company;