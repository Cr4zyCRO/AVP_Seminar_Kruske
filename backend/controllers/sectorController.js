import { EMPTY } from 'sqlite3';
import SectorRepository from '../repo/sector';

class sectorController {
  async getAllSectors(req, res) {
    try {
      const sectors = await SectorRepository.getAll();
      res.status(200).json(sectors);
    } catch (error) {
      console.log('Error fetching all sectors: ' + error);
      res.status(500).json({ error: 'Error fetching all sectors' });
    }
  }

  async getSectorById(req, res) {
    try {
      const id = req.params;
      const sector = await SectorRepository.getById(id);

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      res.status(200).json(sector);
    } catch (error) {
      console.log('Error fetching a sector (getSectorById): ' + error);
      res
        .status(500)
        .json({ error: 'Error fetching a sector (getSectorById)' });
    }
  }

  async getSectorByName(req, res) {
    try {
      const name = req.params;
      const sector = await SectorRepository.getByName(name);

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      res.status(200).json(sector);
    } catch (error) {
      console.log('Error fetching a sector (getSectorByName): ' + error);
      res
        .status(500)
        .json({ error: 'Error fetching a sector (getSectorByName)' });
    }
  }

  async createSector(req, res) {
    try {
      const data = req.body;
      const newSector = await SectorRepository.create(data);
      res.status(200).json(newSector);
    } catch (error) {
      console.log('Error creating a sector: ' + error);
      res.status(500).json({ error: 'Error creating a sector' });
    }
  }

  async deleteSector(req, res) {
    try {
      const { name } = req.params;
      await SectorRepository.delete(name);
      res
        .status(200)
        .json({ message: `Sector "${name}" deleted successfully.` });
    } catch (error) {
      console.log('Error deleting a sector: ' + error);
      res.status(500).json({ error: 'Error deleting a sector' });
    }
  }
}

export default new sectorController();
