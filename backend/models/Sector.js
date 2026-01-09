import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Sector extends Model {
  static get tableName() {
    return 'sector';
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
      required: ['sector_name'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        sector_name: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      companies: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Company.js'),
        join: {
          from: 'sector.id',
          to: 'company.sector_id',
        },
      },
    };
  }
}

export default Sector;
