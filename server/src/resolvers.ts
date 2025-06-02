import mongoose from 'mongoose';
import Board from './models/Board';
import List from './models/List';
import Card from './models/Card';
import User from './models/User';
import { generateToken, getUserId } from './auth';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { Request } from 'express';

interface Context {
  req: Request;
}

const validateInput = {
  username: (username: string) => {
    if (!username || typeof username !== 'string') {
      throw new UserInputError('Username is required');
    }
    if (username.length < 3 || username.length > 30) {
      throw new UserInputError('Username must be between 3 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new UserInputError('Username can only contain letters, numbers, and underscores');
    }
    return username.trim().toLowerCase();
  },
  
  password: (password: string) => {
    if (!password || typeof password !== 'string') {
      throw new UserInputError('Password is required');
    }
    if (password.length < 6 || password.length > 100) {
      throw new UserInputError('Password must be between 6 and 100 characters');
    }
    return password;
  },
  
  title: (title: string, type: string = 'Title') => {
    if (!title || typeof title !== 'string') {
      throw new UserInputError(`${type} is required`);
    }
    const trimmed = title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) {
      throw new UserInputError(`${type} must be between 1 and 100 characters`);
    }
    return trimmed;
  },
  
  objectId: (id: string, type: string = 'ID') => {
    if (!id || typeof id !== 'string') {
      throw new UserInputError(`${type} is required`);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new UserInputError(`Invalid ${type.toLowerCase()}`);
    }
    return id;
  }
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const user = await User.findById(userId).populate('boards');
      if (!user) throw new AuthenticationError('User not found');
      
      return user;
    },

    boards: async (_: any, __: any, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      return await Board.find({ user: userId }).populate('lists');
    },

    board: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');
      
      validateInput.objectId(id, 'Board ID');

      const board = await Board.findById(id).populate('lists');
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
        validateInput.objectId(boardId, 'Board ID');
        
        const board = await Board.findById(boardId);
        if (!board) throw new Error('Board not found');

        if (board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to access this board');
        }

        return await List.find({ board: boardId }).populate('cards');
      } else {
        const boards = await Board.find({ user: userId });
        const boardIds = boards.map(board => board._id);
        return await List.find({ board: { $in: boardIds } }).populate('cards');
      }
    },

    list: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');
      
      validateInput.objectId(id, 'List ID');

      const list = await List.findById(id).populate('cards');
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
        validateInput.objectId(listId, 'List ID');
        
        const list = await List.findById(listId);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to access cards from this list');
        }

        return await Card.find({ list: listId }).sort('position');
      } else {
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
      
      validateInput.objectId(id, 'Card ID');

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
      try {
        const validUsername = validateInput.username(username);
        const validPassword = validateInput.password(password);

        const existingUser = await User.findOne({ username: validUsername });
        if (existingUser) {
          throw new UserInputError('User with that username already exists');
        }

        const user = new User({ username: validUsername, password: validPassword }) as mongoose.Document & { _id: mongoose.Types.ObjectId };
        await user.save();

        const token = generateToken((user._id as mongoose.Types.ObjectId).toString());


        return {
          token,
          user
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof Error) {
          throw error;
        }
        console.error('Registration error:', error);
        throw new Error('Registration failed');
      }
    },

    login: async (_: any, { username, password }: { username: string, password: string }) => {
      try {
        const validUsername = validateInput.username(username);
        const validPassword = validateInput.password(password);

        const user = await User.findOne({ username: validUsername }) as (mongoose.Document & { _id: mongoose.Types.ObjectId, comparePassword: (password: string) => Promise<boolean> });
        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }

        const isMatch = await user.comparePassword(validPassword);
        if (!isMatch) {
          throw new AuthenticationError('Invalid credentials');
        }

        const token = generateToken(user._id.toString());

        return {
          token,
          user
        };
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof UserInputError) {
          throw error;
        }
        console.error('Login error:', error);
        throw new Error('Login failed');
      }
    },

    createBoard: async (_: any, { title }: { title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      const validTitle = validateInput.title(title, 'Board title');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const board = new Board({ title: validTitle, user: userId });
        await board.save({ session });

        await User.findByIdAndUpdate(
          userId,
          { $push: { boards: board._id } },
          { session }
        );

        await session.commitTransaction();
        return board;
      } catch (error) {
        await session.abortTransaction();
        console.error('Create board error:', error);
        throw new Error('Failed to create board');
      } finally {
        session.endSession();
      }
    },

    updateBoard: async (_: any, { id, title }: { id: string, title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'Board ID');
      const validTitle = validateInput.title(title, 'Board title');

      const board = await Board.findById(id);
      if (!board) throw new Error('Board not found');

      if (board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to update this board');
      }

      return await Board.findByIdAndUpdate(id, { title: validTitle }, { new: true });
    },

    deleteBoard: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'Board ID');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const board = await Board.findById(id).session(session);
        if (!board) throw new Error('Board not found');

        if (board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to delete this board');
        }

        const lists = await List.find({ board: id }).session(session);
        for (const list of lists) {
          await Card.deleteMany({ list: list._id }).session(session);
        }

        await List.deleteMany({ board: id }).session(session);

        await User.findByIdAndUpdate(
          userId,
          { $pull: { boards: id } },
          { session }
        );

        await Board.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        return { _id: id };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    createList: async (_: any, { title, boardId }: { title: string, boardId: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(boardId, 'Board ID');
      const validTitle = validateInput.title(title, 'List title');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const board = await Board.findById(boardId).session(session);
        if (!board) throw new Error('Board not found');

        if (board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to create a list in this board');
        }

        const list = new List({ title: validTitle, board: boardId });
        await list.save({ session });

        await Board.findByIdAndUpdate(
          boardId,
          { $push: { lists: list._id } },
          { session }
        );

        await session.commitTransaction();
        return list;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    updateList: async (_: any, { id, title }: { id: string, title: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'List ID');
      const validTitle = validateInput.title(title, 'List title');

      const list = await List.findById(id);
      if (!list) throw new Error('List not found');

      const board = await Board.findById(list.board);
      if (!board || board.user.toString() !== userId) {
        throw new ForbiddenError('Not authorized to update this list');
      }

      return await List.findByIdAndUpdate(id, { title: validTitle }, { new: true });
    },

    deleteList: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'List ID');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const list = await List.findById(id).session(session);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board).session(session);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to delete this list');
        }

        await Card.deleteMany({ list: id }).session(session);

        await Board.findByIdAndUpdate(
          list.board,
          { $pull: { lists: list._id } },
          { session }
        );

        await List.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        return { _id: id };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    createCard: async (_: any,
      { title, listId, description, position }:
        { title: string, listId: string, description?: string, position?: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(listId, 'List ID');
      const validTitle = validateInput.title(title, 'Card title');
      const validDescription = description ? description.trim() : undefined;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const list = await List.findById(listId).session(session);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board).session(session);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to create a card in this list');
        }

        if (position === undefined) {
          const lastCard = await Card.findOne({ list: listId })
            .sort('-position')
            .session(session);
          position = lastCard ? lastCard.position + 1 : 0;
        } else if (position < 0) {
          position = 0;
        }

        const card = new Card({ 
          title: validTitle, 
          list: listId, 
          description: validDescription, 
          position 
        });
        await card.save({ session });

        await List.findByIdAndUpdate(
          listId,
          { $push: { cards: card._id } },
          { session }
        );

        await session.commitTransaction();
        return await Card.findById(card._id);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    updateCard: async (_: any,
      { id, title, description, listId, position }:
        { id: string, title?: string, description?: string, listId?: string, position?: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'Card ID');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const card = await Card.findById(id).session(session);
        if (!card) throw new Error('Card not found');

        const list = await List.findById(card.list).session(session);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board).session(session);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to update this card');
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = validateInput.title(title, 'Card title');
        if (description !== undefined) updateData.description = description?.trim() || '';
        if (position !== undefined) updateData.position = Math.max(0, position);

        if (listId !== undefined) {
          validateInput.objectId(listId, 'Target List ID');
          
          const targetList = await List.findById(listId).session(session);
          if (!targetList) throw new Error('Target list not found');

          const targetBoard = await Board.findById(targetList.board).session(session);
          if (!targetBoard || targetBoard.user.toString() !== userId) {
            throw new ForbiddenError('Not authorized to move card to this list');
          }

          if (card.list.toString() !== listId) {
            await List.findByIdAndUpdate(
              card.list,
              { $pull: { cards: card._id } },
              { session }
            );

            await List.findByIdAndUpdate(
              listId,
              { $push: { cards: card._id } },
              { session }
            );

            updateData.list = listId;
          }
        }

        await Card.findByIdAndUpdate(id, updateData, { session });
        await session.commitTransaction();

        return await Card.findById(id);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    deleteCard: async (_: any, { id }: { id: string }, context: Context) => {
      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'Card ID');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const card = await Card.findById(id).session(session);
        if (!card) throw new Error('Card not found');

        const list = await List.findById(card.list).session(session);
        if (!list) throw new Error('List not found');

        const board = await Board.findById(list.board).session(session);
        if (!board || board.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to delete this card');
        }

        await List.findByIdAndUpdate(
          card.list,
          { $pull: { cards: card._id } },
          { session }
        );

        await Card.findByIdAndDelete(id).session(session);
        await session.commitTransaction();

        return id;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    moveCard: async (_: any,
      { id, listId, position }:
        { id: string, listId: string, position: number },
      context: Context) => {

      const userId = getUserId(context.req);
      if (!userId) throw new AuthenticationError('Not authenticated');

      validateInput.objectId(id, 'Card ID');
      validateInput.objectId(listId, 'List ID');

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const card = await Card.findById(id).session(session);
        if (!card) throw new Error('Card not found');

        const sourceList = await List.findById(card.list).session(session);
        if (!sourceList) throw new Error('Source list not found');

        const sourceBoard = await Board.findById(sourceList.board).session(session);
        if (!sourceBoard || sourceBoard.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to move this card');
        }

        const targetList = await List.findById(listId).session(session);
        if (!targetList) throw new Error('Target list not found');

        const targetBoard = await Board.findById(targetList.board).session(session);
        if (!targetBoard || targetBoard.user.toString() !== userId) {
          throw new ForbiddenError('Not authorized to move card to this list');
        }

        const safePosition = Math.max(0, position);
        const sourceListId = card.list.toString();

        if (sourceListId !== listId) {
          await List.findByIdAndUpdate(
            sourceListId,
            { $pull: { cards: card._id } },
            { session }
          );

          await List.findByIdAndUpdate(
            listId,
            { $push: { cards: card._id } },
            { session }
          );

          card.list = new mongoose.Types.ObjectId(listId);
        }

        await Card.updateMany(
          {
            list: listId,
            position: { $gte: safePosition },
            _id: { $ne: id }
          },
          { $inc: { position: 1 } },
          { session }
        );

        card.position = safePosition;
        await card.save({ session });

        await session.commitTransaction();
        return card;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
  },

  Board: {
    lists: async (parent: any) => {
      return await List.find({ _id: { $in: parent.lists } }).sort('_id');
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
    password: () => null, 
    boards: async (parent: any) => await Board.find({ _id: { $in: parent.boards } })
  }
};

export default resolvers;