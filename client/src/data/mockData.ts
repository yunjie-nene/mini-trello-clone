import { Board, List, Card } from '../types';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const STORAGE_KEYS = {
  BOARDS: 'trello_boards',
  LISTS: 'trello_lists',
  CARDS: 'trello_cards',
};

const initializeMockData = () => {
  const existingBoards = localStorage.getItem(STORAGE_KEYS.BOARDS);
  if (existingBoards) return;

  const boardId = generateId();
  const board: Board = {
    _id: boardId,
    title: 'My Project Board',
    lists: [],
  };

  const todoListId = generateId();
  const inProgressListId = generateId();
  const doneListId = generateId();

  const todoList: List = {
    _id: todoListId,
    title: 'To Do',
    board: boardId,
    cards: [],
  };

  const inProgressList: List = {
    _id: inProgressListId,
    title: 'In Progress',
    board: boardId,
    cards: [],
  };

  const doneList: List = {
    _id: doneListId,
    title: 'Done',
    board: boardId,
    cards: [],
  };

  board.lists = [todoListId, inProgressListId, doneListId];

  const cards: Card[] = [
    {
      _id: generateId(),
      title: 'Research project requirements',
      description: 'Gather all necessary information about project scope',
      list: todoListId,
    },
    {
      _id: generateId(),
      title: 'Set up project structure',
      description: 'Initialize repository and create basic file structure',
      list: todoListId,
    },
    {
      _id: generateId(),
      title: 'Design database schema',
      description: 'Create ERD and define relationships between entities',
      list: inProgressListId,
    },
    {
      _id: generateId(),
      title: 'Implement authentication',
      description: 'Add user registration and login functionality',
      list: inProgressListId,
    },
    {
      _id: generateId(),
      title: 'Write documentation',
      description: 'Document API endpoints and usage instructions',
      list: doneListId,
    },
  ];

  cards.forEach((card) => {
    const listId = card.list;
    if (listId === todoListId) {
      todoList.cards.push(card._id);
    } else if (listId === inProgressListId) {
      inProgressList.cards.push(card._id);
    } else if (listId === doneListId) {
      doneList.cards.push(card._id);
    }
  });

  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify([board]));
  localStorage.setItem(
    STORAGE_KEYS.LISTS,
    JSON.stringify([todoList, inProgressList, doneList])
  );
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
};

const getBoards = (): Board[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BOARDS);
  return data ? JSON.parse(data) : [];
};

const getLists = (): List[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LISTS);
  return data ? JSON.parse(data) : [];
};

const getCards = (): Card[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CARDS);
  return data ? JSON.parse(data) : [];
};

const getListsForBoard = (boardId: string): List[] => {
  const lists = getLists();
  return lists.filter(list => list.board === boardId);
};

const getCardsForList = (listId: string): Card[] => {
  const cards = getCards();
  return cards.filter(card => card.list === listId);
};

const createBoard = (title: string): Board => {
  const boards = getBoards();
  const newBoard: Board = {
    _id: generateId(),
    title,
    lists: [],
  };
  
  boards.push(newBoard);
  localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  
  return newBoard;
};

const createList = (title: string, boardId: string): List => {
  const lists = getLists();
  const newList: List = {
    _id: generateId(),
    title,
    board: boardId,
    cards: [],
  };
  
  lists.push(newList);
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  
  const boards = getBoards();
  const boardIndex = boards.findIndex(b => b._id === boardId);
  
  if (boardIndex >= 0) {
    boards[boardIndex].lists.push(newList._id);
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  }
  
  return newList;
};

const createCard = (title: string, listId: string, description?: string): Card => {
  const cards = getCards();
  const newCard: Card = {
    _id: generateId(),
    title,
    description,
    list: listId,
  };
  
  cards.push(newCard);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  
  const lists = getLists();
  const listIndex = lists.findIndex(l => l._id === listId);
  
  if (listIndex >= 0) {
    lists[listIndex].cards.push(newCard._id);
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }
  
  return newCard;
};

const updateCard = (updatedCard: Card): Card => {
  const cards = getCards();
  const cardIndex = cards.findIndex(c => c._id === updatedCard._id);
  
  if (cardIndex >= 0) {
    const oldListId = cards[cardIndex].list;
    const newListId = updatedCard.list;
    
    cards[cardIndex] = updatedCard;
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    
    if (oldListId !== newListId) {
      const lists = getLists();
      
      const oldListIndex = lists.findIndex(l => l._id === oldListId);
      if (oldListIndex >= 0) {
        lists[oldListIndex].cards = lists[oldListIndex].cards.filter(
          id => id !== updatedCard._id
        );
      }
      
      const newListIndex = lists.findIndex(l => l._id === newListId);
      if (newListIndex >= 0) {
        lists[newListIndex].cards.push(updatedCard._id);
      }
      
      localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
    }
  }
  
  return updatedCard;
};

const deleteCard = (cardId: string): void => {
  const cards = getCards();
  const card = cards.find(c => c._id === cardId);
  
  if (!card) return;
  
  const updatedCards = cards.filter(c => c._id !== cardId);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updatedCards));
  
  const lists = getLists();
  const listIndex = lists.findIndex(l => l._id === card.list);
  
  if (listIndex >= 0) {
    lists[listIndex].cards = lists[listIndex].cards.filter(id => id !== cardId);
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }
};

const moveCard = (cardId: string, targetListId: string, position: number): Card | null => {
  const cards = getCards();
  const cardIndex = cards.findIndex(c => c._id === cardId);
  
  if (cardIndex < 0) return null;
  
  const card = cards[cardIndex];
  const sourceListId = card.list;
  
  card.list = targetListId;
  cards[cardIndex] = card;
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  
  const lists = getLists();
  
  const sourceListIndex = lists.findIndex(l => l._id === sourceListId);
  if (sourceListIndex >= 0) {
    lists[sourceListIndex].cards = lists[sourceListIndex].cards.filter(
      id => id !== cardId
    );
  }
  
  const targetListIndex = lists.findIndex(l => l._id === targetListId);
  if (targetListIndex >= 0) {
    const newCards = [...lists[targetListIndex].cards];
    newCards.splice(position, 0, cardId);
    lists[targetListIndex].cards = newCards;
  }
  
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  
  return card;
};

const deleteList = (listId: string): void => {
  const lists = getLists();
  const list = lists.find(l => l._id === listId);
  
  if (!list) return;
  
  const cards = getCards();
  const listCards = cards.filter(card => card.list === listId);
  
  listCards.forEach(card => {
    deleteCard(card._id);
  });
  
  const updatedLists = lists.filter(l => l._id !== listId);
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(updatedLists));
  
  const boards = getBoards();
  const boardIndex = boards.findIndex(b => b._id === list.board);
  
  if (boardIndex >= 0) {
    boards[boardIndex].lists = boards[boardIndex].lists.filter(id => id !== listId);
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  }
};

initializeMockData();

export {
  generateId,
  getBoards,
  getLists,
  getCards,
  getListsForBoard,
  getCardsForList,
  createBoard,
  createList,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  deleteList
};