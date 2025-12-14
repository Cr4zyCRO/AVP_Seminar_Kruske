import Sector from '../models/Sector.js';

class SectorRepository {
  async getAll() {
    return await Sector.query().select('*');
  }

  async getById(id) {
    return await Sector.query().findById(id);
  }

  async getByName(name) {
    return await Sector.query().findOne({ sector_name: name });
  }

  async create() {
    return await Sector.query().insert(data).returning('*');
  }

  async delete(name) {
    const sector = await this.getByName(name);

    if (!sector) {
      throw new Error(`Sector ${name} was not found.`);
    }
    await Sector.query().deleteById(sector.$id);
  }
}

export default new SectorRepository();
