import { Request, Response } from 'express';
import Card from '../models/Card';
import List from '../models/List';

// Create a new card
export const createCard = async (req: Request, res: Response) => {
  const { title, description, listId } = req.body;
  try {
    const card = new Card({ title, description, list: listId });
    await card.save();

    // Add the card to the list's cards array
    await List.findByIdAndUpdate(listId, { $push: { cards: card._id } });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card', error });
  }
};

// Get all cards for a list
export const getCards = async (req: Request, res: Response) => {
  const { listId } = req.params;
  try {
    const cards = await Card.find({ list: listId });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cards', error });
  }
};
