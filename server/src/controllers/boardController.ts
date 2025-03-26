import { Request, Response } from 'express';
import Board from '../models/Board';

// Create a new board
export const createBoard = async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const board = new Board({ title });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error creating board', error });
  }
};

// Get all boards
export const getBoards = async (req: Request, res: Response) => {
  try {
    const boards = await Board.find().populate('lists');
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boards', error });
  }
};
