import express from 'express';
import { getBoards, createBoard } from '../controllers/boardController';

const router = express.Router();

router.get('/', getBoards);
router.post('/', createBoard);

export default router;
