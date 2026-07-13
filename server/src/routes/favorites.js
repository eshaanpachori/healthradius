import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:source/:hospitalId', authenticate, removeFavorite);

export default router;
