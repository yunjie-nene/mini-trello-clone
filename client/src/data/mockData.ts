import { v4 as uuidv4 } from 'uuid';
import { Board, List, Card } from '../types';

// LocalStorage keys
const BOARDS_KEY = 'trello_boards';
const LISTS_KEY = 'trello_lists';
const CARDS_KEY = 'trello_cards';

// Initialize default data if none exists
const initializeDefaultData = () => {
  if (!localStorage.getItem(BOARDS_KEY)) {
    // Create default board
    const boardId = uuidv4();
    const todoListId = uuidv4();
    const inProgressListId = uuidv4();
    const doneListId = uuidv4();

    // Default board
    const defaultBoard: Board = {
      _id: boardId,
      title: 'My First Board',
      lists: [todoListId, inProgressListId, doneListId],
    };

    // Default lists
    const defaultLists: List[] = [
      {
        _id: todoListId,
        title: 'To Do',
        board: boardId,
      },
      {
        _id: inProgressListId,
        title: 'In Progress',
        board: boardId,
      },
      {
        _id: doneListId,
        title: 'Done',
        board: boardId,
      },
    ];

    // Default cards
    const defaultCards: Card[] = [
      {
        _id: uuidv4(),
        title: 'Welcome to Nora Trello!',
        description: 'This is your first card. You can edit or delete it.',
        list: todoListId,
        position: 0,
      },
      {
        _id: uuidv4(),
        title: 'Try dragging this card',
        description: 'You can drag cards between lists to change their status.',
        list: todoListId,
        position: 1,
      },
      {
        _id: uuidv4(),
        title: 'Working on a feature',
        description: 'This card is in progress.',
        list: inProgressListId,
        position: 0,
      },
      {
        _id: uuidv4(),
        title: 'Completed task',
        description: 'This task has been completed.',
        list: doneListId,
        position: 0,
      },
    ];

    // Save to localStorage
    localStorage.setItem(BOARDS_KEY, JSON.stringify([defaultBoard]));
    localStorage.setItem(LISTS_KEY, JSON.stringify(defaultLists));
    localStorage.setItem(CARDS_KEY, JSON.stringify(defaultCards));
  }
};

// Initialize data
initializeDefaultData();

// Helper functions
export const getBoards = (): Board[] => {
  const boards = localStorage.getItem(BOARDS_KEY);
  return boards ? JSON.parse(boards) : [];
};

export const getLists = (): List[] => {
  const lists = localStorage.getItem(LISTS_KEY);
  return lists ? JSON.parse(lists) : [];
};

export const getCards = (): Card[] => {
  const cards = localStorage.getItem(CARDS_KEY);
  let cardsArray = cards ? JSON.parse(cards) : [];
  
  // Sort cards by position within each list
  cardsArray.sort((a: Card, b: Card) => {
    if (a.list === b.list) {
      return (a.position || 0) - (b.position || 0);
    }
    return 0;
  });
  
  return cardsArray;
};

// Card CRUD operations
export const createCard = (
  title: string,
  listId: string,
  description?: string
): Card => {
  const cards = getCards();
  
  // Find the highest position in the list to place the new card at the end
  const listCards = cards.filter(card => card.list === listId);
  const highestPosition = listCards.length > 0 
    ? Math.max(...listCards.map(card => card.position || 0)) + 1 
    : 0;
  
  const newCard: Card = {
    _id: uuidv4(),
    title,
    description,
    list: listId,
    position: highestPosition,
  };
  
  localStorage.setItem(CARDS_KEY, JSON.stringify([...cards, newCard]));
  return newCard;
};

export const updateCard = (card: Card): void => {
  const cards = getCards();
  const updatedCards = cards.map(c => (c._id === card._id ? card : c));
  localStorage.setItem(CARDS_KEY, JSON.stringify(updatedCards));
};

export const deleteCard = (cardId: string): void => {
  const cards = getCards();
  const filteredCards = cards.filter(card => card._id !== cardId);
  
  // After deleting, reorder positions to keep them sequential
  reorderPositions(filteredCards);
  
  localStorage.setItem(CARDS_KEY, JSON.stringify(filteredCards));
};

// Helper function to reorder card positions to keep them sequential
const reorderPositions = (cards: Card[]): void => {
  // Group cards by list
  const listGroups: { [key: string]: Card[] } = {};
  
  cards.forEach(card => {
    if (!listGroups[card.list]) {
      listGroups[card.list] = [];
    }
    listGroups[card.list].push(card);
  });
  
  // For each list, sort and renumber positions
  Object.keys(listGroups).forEach(listId => {
    const listCards = listGroups[listId];
    listCards.sort((a, b) => (a.position || 0) - (b.position || 0));
    
    // Reassign positions
    listCards.forEach((card, index) => {
      card.position = index;
    });
  });
};

export const moveCard = (
  cardId: string,
  targetListId: string,
  position: number
): void => {
  const cards = getCards();
  const cardToMove = cards.find(card => card._id === cardId);
  
  if (!cardToMove) return;
  
  const sourceListId = cardToMove.list;
  const isMovingWithinList = sourceListId === targetListId;
  
  // Get the current position of the card
  const currentPosition = cardToMove.position || 0;
  
  // Change the list and position of the card
  cardToMove.list = targetListId;
  
  // Adjust positions of other cards
  cards.forEach(card => {
    // Skip the card we're moving
    if (card._id === cardId) return;
    
    if (isMovingWithinList && card.list === targetListId) {
      // Reordering within the same list
      if (position <= currentPosition && card.position !== undefined && card.position >= position && card.position < currentPosition) {
        // Moving card up - increment positions of cards in between
        card.position += 1;
      } else if (position > currentPosition && card.position !== undefined && card.position > currentPosition && card.position <= position) {
        // Moving card down - decrement positions of cards in between
        card.position -= 1;
      }
    } else if (card.list === sourceListId && card.position !== undefined && card.position > currentPosition) {
      // Card is leaving this list - decrement positions of cards after it
      card.position -= 1;
    } else if (card.list === targetListId && card.position !== undefined && card.position >= position) {
      // Card is entering this list - increment positions of cards at or after the target position
      card.position += 1;
    }
  });
  
  // Set the new position for the moved card
  cardToMove.position = position;
  
  // Save the updated cards to localStorage
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
};