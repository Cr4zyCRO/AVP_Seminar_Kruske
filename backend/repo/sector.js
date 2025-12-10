const Sector = require('../models/Sector');

class SectorRepository {
  async getAll() {
    return await Sector.query().select('*');
  }
}
