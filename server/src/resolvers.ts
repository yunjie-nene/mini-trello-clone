import mongoose from 'mongoose';
import Board from './models/Board';
import List from './models/List';
import Card from './models/Card';
import User from './models/User';
import { generateToken, getUserId } from './auth';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { Request } from 'express';

interface Context {
  req: Request;
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      return await User.findById(userId);
    },

    boards: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      return await Board.find({ user: userId });
    },

    board: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const board = await Board.findById(id);
      if (!board) throw new Error('Board not found');

      if (board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to access this board');
      }

      return board;
    },

    lists: async (_: any, { boardId }: { boardId?: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      if (boardId) {
        const board = await Board.findById(boardId);
        if (!board) throw new Error('Board not found');

        if (board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to access this board');
        }

        return await List.find({ board: boardId });
      } else {
        // Return lists from user's boards
        const boards = await Board.find({ user: userId });
        const boardIds = boards.map(board => board._id);

        return await List.find({ board: { $in: boardIds } });
      }
    },

    list: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const list = await List.findById(id);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to access this list');
      }

      return list;
    },

    cards: async (_: any, { listId }: { listId?: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      if (listId) {
        const list = await List.findById(listId);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to access cards from this list');
        }

        return await Card.find({ list: listId }).sort('position');
      } else {
        // Return cards from user's boards
        const boards = await Board.find({ user: userId });
        const boardIds = boards.map(board => board._id);

        const lists = await List.find({ board: { $in: boardIds } });
        const listIds = lists.map(list => list._id);

        return await Card.find({ list: { $in: listIds } }).sort('position');
      }
    },

    card: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const card = await Card.findById(id);
      if (!card) throw new Error('Card not found');

      const list = await List.findById(card.list);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to access this card');
      }

      return card;
    },
  },

  Mutation: {
    register: async (_: any, { username, password }: { username: string, password: string }) => {
      const existingUser = await User.findOne({ $or: [ { username }] });
      if (existingUser) {
        throw new Error('User with that username already exists');
      }
      if(password.length < 6) {
        throw new Error('Password must be at least 6 characters long'); 
      }

      const user = new User({ username, password });
      await user.save();

      const token = generateToken((user._id as { toString: () => string}).toString());

      return {
        token,
        user
      };
    },

    login: async (_: any, { username, password }: { username: string, password: string }) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken((user._id as { toString: () => string}).toString());

      return {
        token,
        user
      };
    },

    createBoard: async (_: any, { title }: { title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const board = new Board({ title, user: userId });
      await board.save();
      return board;
    },

    updateBoard: async (_: any, { id, title }: { id: string, title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const board = await Board.findById(id);
      if (!board) throw new Error('Board not found');

      if (board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to update this board');
      }

      return await Board.findByIdAndUpdate(id, { title }, { new: true });
    },

    deleteBoard: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const board = await Board.findById(id);
      if (!board) throw new Error('Board not found');

      if (board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to delete this board');
      }

      const lists = await List.find({ board: id });
      for (const list of lists) {
        await Card.deleteMany({ list: list._id });
        await List.findByIdAndDelete(list._id);
      }

      await Board.findByIdAndDelete(id);

      return { _id: id };
    },

    createList: async (_: any, { title, boardId }: { title: string, boardId: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const board = await Board.findById(boardId);
      if (!board) throw new Error('Board not found');

      if (board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to create a list in this board');
      }

      const list = new List({ title, board: boardId });
      await list.save();

      await Board.findByIdAndUpdate(boardId, {
        $push: { lists: list._id }
      });

      return list;
    },

    updateList: async (_: any, { id, title }: { id: string, title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const list = await List.findById(id);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to update this list');
      }

      return await List.findByIdAndUpdate(id, { title }, { new: true });
    },

    deleteList: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const list = await List.findById(id);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to delete this list');
      }

      await Card.deleteMany({ list: id });

      await Board.findByIdAndUpdate(list.board, {
        $pull: { lists: list._id }
      });

      await List.findByIdAndDelete(id);

      return { _id: id };
    },

    createCard: async (_: any,
      { title, listId, description, position }:
        { title: string, listId: string, description?: string, position?: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const list = await List.findById(listId);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to create a card in this list');
      }

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
        { id: string, title?: string, description?: string, listId?: string, position?: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const card = await Card.findById(id);
      if (!card) throw new Error('Card not found');

      const list = await List.findById(card.list);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to update this card');
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (position !== undefined) updateData.position = position;

      if (listId !== undefined) {
        // Verify user owns the target list
        const targetList = await List.findById(listId);
        if (!targetList) throw new Error('Target list not found');

        const targetBoard = await Board.findById(targetList.board);
        if (!targetBoard || targetBoard.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to move card to this list');
        }

        if (card.list.toString() !== listId) {
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

    deleteCard: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const card = await Card.findById(id);
      if (!card) throw new Error('Card not found');

      const list = await List.findById(card.list);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to delete this card');
      }

      await List.findByIdAndUpdate(card.list, {
        $pull: { cards: card._id }
      });

      await Card.findByIdAndDelete(id);

      return id;
    },

    moveCard: async (_: any,
      { id, listId, position }:
        { id: string, listId: string, position: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const card = await Card.findById(id);
      if (!card) throw new Error('Card not found');

      // Verify source list ownership
      const sourceList = await List.findById(card.list);
      if (!sourceList) throw new Error('Source list not found');

      const sourceBoard = await Board.findById(sourceList.board);
      if (!sourceBoard || sourceBoard.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to move this card');
      }

      // Verify target list ownership
      const targetList = await List.findById(listId);
      if (!targetList) throw new Error('Target list not found');

      const targetBoard = await Board.findById(targetList.board);
      if (!targetBoard || targetBoard.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to move card to this list');
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

  // Type resolvers
  Board: {
    lists: async (parent: any) => {
      return await List.find({ _id: { $in: parent.lists } });
    },
    user: async (parent: any) => await User.findById(parent.user)
  },

  List: {
    board: async (parent: any) => await Board.findById(parent.board),
    cards: async (parent: any) => await Card.find({ list: parent._id }).sort('position')
  },

  Card: {
    list: async (parent: any) => await List.findById(parent.list)
  },

  User: {
    password: () => null
  }
};

export default resolvers;