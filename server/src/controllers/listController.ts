import { Request, Response } from 'express';
import List from '../models/List';
import Board from '../models/Board';

// Create a new list
export const createList = async (req: Request, res: Response) => {
  const { title, boardId } = req.body;
  try {
    const list = new List({ title, board: boardId });
    await list.save();

    // Add the list to the board's lists array
    await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error creating list', error });
  }
};

// Get all lists for a board
export const getLists = async (req: Request, res: Response) => {
  const { boardId } = req.params;
  try {
    const lists = await List.find({ board: boardId }).populate('cards');
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lists', error });
  }
};
