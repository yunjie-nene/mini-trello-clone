import { gql } from '@apollo/client';

// Board queries
export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      _id
      title
      lists {
        _id
        title
      }
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      _id
      title
      lists {
        _id
        title
      }
    }
  }
`;

// Board mutations
export const CREATE_BOARD = gql`
  mutation CreateBoard($title: String!) {
    createBoard(title: $title) {
      _id
      title
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: ID!, $title: String!) {
    updateBoard(id: $id, title: $title) {
      _id
      title
    }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id) {
      _id
    }
  }
`;

// List queries
export const GET_LISTS = gql`
  query GetLists($boardId: ID) {
    lists(boardId: $boardId) {
      _id
      title
      cards {
        _id
        title
        description
        position
        list {
            _id
            title
        }
      }
    }
  }
`;

// List mutations
export const CREATE_LIST = gql`
  mutation CreateList($title: String!, $boardId: ID!) {
    createList(title: $title, boardId: $boardId) {
      _id
      title
      board {
        _id
        title
      }
    }
  }
`;

export const UPDATE_LIST = gql`
  mutation UpdateList($id: ID!, $title: String!) {
    updateList(id: $id, title: $title) {
      _id
      title
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id) {
      _id
    }
  }
`;

// Card queries
export const GET_CARDS = gql`
  query GetCards($listId: ID) {
    cards(listId: $listId) {
      _id
      title
      description
      position
      list {
        _id
        title
      }
    }
  }
`;

// Card mutations
export const CREATE_CARD = gql`
  mutation CreateCard($title: String!, $listId: ID!, $description: String) {
    createCard(title: $title, listId: $listId, description: $description) {
      _id
      title
      description
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $title: String, $description: String) {
    updateCard(id: $id, title: $title, description: $description) {
      _id
      title
      description
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
  }
`;

export const MOVE_CARD = gql`
  mutation MoveCard($id: ID!, $listId: ID!, $position: Int!) {
    moveCard(id: $id, listId: $listId, position: $position) {
      _id
      position
      list {
        _id
        title
      }
    }
  }
`;