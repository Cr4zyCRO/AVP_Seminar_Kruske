import sectorController from '../controllers/sectorController';
import { createSectorSchema } from '../middleware/validation/sectorValidator';
import express from 'express';
import { body } from '../middleware/validate';
import { jwtCheck } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/sector/', jwtCheck, sectorController.getAllSectors);
router.get('/sector/id/:id', jwtCheck, sectorController.getSectorById);
router.get('/sector/name/:name', jwtCheck, sectorController.getSectorByName);

router.post(
  '/sector/',
  jwtCheck,
  body(createSectorSchema),
  sectorController.createSector
);

router.delete('/sector/:name', jwtCheck, sectorController.deleteSector);

export default router;
