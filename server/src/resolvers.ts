import mongoose from 'mongoose';
import Board from './models/Board';
import List from './models/List';
import Card from './models/Card';

export const resolvers = {
  Query: {
    boards: async () => await Board.find(),
    board: async (_: any, { id }: { id: string }) => await Board.findById(id),
    lists: async (_: any, { boardId }: { boardId?: string }) => {
      return boardId ? await List.find({ board: boardId }) : await List.find();
    },
    list: async (_: any, { id }: { id: string }) => await List.findById(id),
    cards: async (_: any, { listId }: { listId?: string }) => {
      return listId 
        ? await Card.find({ list: listId }).sort('position')
        : await Card.find().sort('position');
    },
    card: async (_: any, { id }: { id: string }) => await Card.findById(id),
  },
  
  Mutation: {
    createBoard: async (_: any, { title }: { title: string }) => {
      const board = new Board({ title });
      await board.save();
      return board;
    },
    updateBoard: async (_: any, { id, title }: { id: string, title: string }) => {
      return await Board.findByIdAndUpdate(id, { title }, { new: true });
    },
    deleteBoard: async (_: any, { id }: { id: string }) => {
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
      
      await Board.findByIdAndUpdate(boardId, {
        $push: { lists: list._id }
      });
      
      return list;
    },
    updateList: async (_: any, { id, title }: { id: string, title: string }) => {
      return await List.findByIdAndUpdate(id, { title }, { new: true });
    },
    deleteList: async (_: any, { id }: { id: string }) => {
      await Card.deleteMany({ list: id });
      
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
      if (position === undefined) {
        const lastCard = await Card.findOne({ list: listId }).sort('-position');
        position = lastCard ? lastCard.position + 1 : 0;
      }
      
      const card = new Card({ title, list: listId, description, position });
      await card.save();
      
      await List.findByIdAndUpdate(listId, {
        $push: { cards: card._id }
      });
      
      return await Card.findById(card._id);
    },
    updateCard: async (_: any, 
      { id, title, description, listId, position }: 
      { id: string, title?: string, description?: string, listId?: string, position?: number }) => {
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (position !== undefined) updateData.position = position;
      
      if (listId !== undefined) {
        const card = await Card.findById(id);
        
        if (card && card.list.toString() !== listId) {
          await List.findByIdAndUpdate(card.list, {
            $pull: { cards: card._id }
          });
          
          await List.findByIdAndUpdate(listId, {
            $push: { cards: card._id }
          });
          
          updateData.list = listId;
        }
      }
      
      await Card.findByIdAndUpdate(id, updateData, { new: true });
      
      return await Card.findById(id);
    },
    deleteCard: async (_: any, { id }: { id: string }) => {
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
      
      if (sourceListId !== listId) {
        await List.findByIdAndUpdate(sourceListId, {
          $pull: { cards: card._id }
        });
        
        await List.findByIdAndUpdate(listId, {
          $push: { cards: card._id }
        });
        
        card.list = new mongoose.Types.ObjectId(listId);
      }
      
      await Card.updateMany(
        { 
          list: listId,
          position: { $gte: position },
          _id: { $ne: id }
        },
        { $inc: { position: 1 } }
      );
      
      card.position = position;
      await card.save();
      
      return card;
    }
  },
  
  Board: {
    lists: async (parent: any) => {
      return await List.find({ _id: { $in: parent.lists } });
    }
  },
  
  List: {
    board: async (parent: any) => await Board.findById(parent.board),
    cards: async (parent: any) => await Card.find({ list: parent._id }).sort('position')
  },
  
  Card: {
    list: async (parent: any) => await List.findById(parent.list)
  }
};

export default resolvers;