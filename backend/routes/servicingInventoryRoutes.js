import express from 'express';

import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/servicingInventoryController.js';
import { protect  } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getInventoryItems);
router.route('/:id').get(protect, getInventoryItemById);
router.route('/').post(protect, createInventoryItem);
router.route('/:id').put(protect, updateInventoryItem);
router.route('/:id').delete(protect, deleteInventoryItem);

export default router;
