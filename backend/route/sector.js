import sectorController from '../controllers/sectorController.js';
import { createSectorSchema } from '../middleware/validation/sectorValidator.js';
import express from 'express';
import { body } from '../middleware/validate.js';
import { jwtCheck } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', jwtCheck, sectorController.getAllSectors);

router.get('/id/:id', jwtCheck, sectorController.getSectorById);


router.get('/name/:name', jwtCheck, sectorController.getSectorByName);

router.post(
  '/',
  jwtCheck,
  body(createSectorSchema),
  sectorController.createSector
);


router.delete('/:name', jwtCheck, sectorController.deleteSector);

export default router;
