import express from 'express';
import { getLists, createList } from '../controllers/listController';

const router = express.Router();

router.get('/', getLists);
router.post('/', createList);

export default router;
