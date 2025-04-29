import mongoose from 'mongoose';
import Board from './models/Board';
import List from './models/List';
import Card from './models/Card';

export const resolvers = {
  Query: {
    boards: async () => {
      return await Board.find();
    },
    board: async (_: any, { id }: { id: string }) => {
      return await Board.findById(id);
    },
    lists: async (_: any, { boardId }: { boardId?: string }) => {
      if (boardId) {
        return await List.find({ board: boardId });
      }
      return await List.find();
    },
    list: async (_: any, { id }: { id: string }) => {
      return await List.findById(id);
    },
    cards: async (_: any, { listId }: { listId?: string }) => {
      if (listId) {
        return await Card.find({ list: listId }).sort('position');
      }
      return await Card.find().sort('position');
    },
    card: async (_: any, { id }: { id: string }) => {
      return await Card.findById(id);
    },
  },
  
  Mutation: {
    createBoard: async (_: any, { title }: { title: string }) => {
      const board = new Board({ title });
      await board.save();
      return board;
    },
    updateBoard: async (_: any, { id, title }: { id: string, title: string }) => {
      return await Board.findByIdAndUpdate(
        id,
        { title },
        { new: true }
      );
    },
    deleteBoard: async (_: any, { id }: { id: string }) => {
      // Delete associated lists and cards
      const board = await Board.findById(id);
      if (board) {
        const lists = await List.find({ board: id });
        for (const list of lists) {
          await Card.deleteMany({ list: list._id });
          await List.findByIdAndDelete(list._id);
        }
        await Board.findByIdAndDelete(id);
      }
      return { _id: id};
    },
    
    createList: async (_: any, { title, boardId }: { title: string, boardId: string }) => {
      const list = new List({ title, board: boardId });
      await list.save();
      
      // Add list to board
      await Board.findByIdAndUpdate(boardId, {
        $push: { lists: list._id }
      });
      
      return list;
    },
    updateList: async (_: any, { id, title }: { id: string, title: string }) => {
      return await List.findByIdAndUpdate(
        id,
        { title },
        { new: true }
      );
    },
    deleteList: async (_: any, { id }: { id: string }) => {
      // Delete associated cards
      await Card.deleteMany({ list: id });
      
      // Remove list from board
      const list = await List.findById(id);
      if (list) {
        await Board.findByIdAndUpdate(list.board, {
          $pull: { lists: list._id }
        });
        await List.findByIdAndDelete(id);
      }
      
      return { _id: id };
    },
    
    createCard: async (_: any, { title, listId, description, position }: 
      { title: string, listId: string, description?: string, position?: number }) => {
      // Get the highest position if not provided
      if (position === undefined) {
        const lastCard = await Card.findOne({ list: listId }).sort('-position');
        position = lastCard ? lastCard.position + 1 : 0;
      }
      
      const card = new Card({ 
        title, 
        list: listId, 
        description,
        position 
      });
      await card.save();
      
      // Add card to list
      await List.findByIdAndUpdate(listId, {
        $push: { cards: card._id }
      });
      
      // Return card with populated list field
      return await Card.findById(card._id);
    },
    updateCard: async (_: any, 
      { id, title, description, listId, position }: 
      { id: string, title?: string, description?: string, listId?: string, position?: number }) => {
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (position !== undefined) updateData.position = position;
      
      let card;
      
      if (listId !== undefined) {
        // If the list is changing, we need to update the list references
        card = await Card.findById(id);
        
        if (card && card.list.toString() !== listId) {
          // Remove card from old list
          await List.findByIdAndUpdate(card.list, {
            $pull: { cards: card._id }
          });
          
          // Add card to new list
          await List.findByIdAndUpdate(listId, {
            $push: { cards: card._id }
          });
          
          updateData.list = listId;
        }
      }
      
      // Update card
      await Card.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      // Return card with populated list field
      return await Card.findById(id);
    },
    deleteCard: async (_: any, { id }: { id: string }) => {
      // Remove card from list
      const card = await Card.findById(id);
      if (card) {
        await List.findByIdAndUpdate(card.list, {
          $pull: { cards: card._id }
        });
        await Card.findByIdAndDelete(id);
      }
      
      return id;
    },
    moveCard: async (_: any, 
      { id, listId, position }: 
      { id: string, listId: string, position: number }) => {
      
      const card = await Card.findById(id);

      if (!card) {
        throw new Error('Card not found');
      }
      
      const sourceListId = card.list._id.toString();
      
      // If moving to a different list
      if (sourceListId !== listId) {
        // Remove from old list
        await List.findByIdAndUpdate(sourceListId, {
          $pull: { cards: card._id }
        });
        
        // Add to new list
        await List.findByIdAndUpdate(listId, {
          $push: { cards: card._id }
        });
        
        // Update the card's list reference
        card.list = new mongoose.Types.ObjectId(listId);
      }
      
      // Adjust position of other cards in the target list
      await Card.updateMany(
        { 
          list: listId,
          position: { $gte: position },
          _id: { $ne: id }
        },
        { $inc: { position: 1 } }
      );
      
      // Update card position
      card.position = position;
      await card.save();
      
      return card;
    }
  },
  
  // Relationship resolvers
  Board: {
    lists: async (parent: any) => {
      return await List.find({ _id: { $in: parent.lists } });
    }
  },
  
  List: {
    board: async (parent: any) => {
      // Return the full Board object
      return await Board.findById(parent.board);
    },
    cards: async (parent: any) => {
      return await Card.find({ list: parent._id }).sort('position');
    }
  },
  
  Card: {
    list: async (parent: any) => {
      // Return the full List object
      return await List.findById(parent.list);
    }
  }
};

export default resolvers;