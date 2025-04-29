export interface Board {
  _id: string;
  title: string;
  lists: string[];
}

export interface List {
  _id: string;
  title: string;
  board: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  list: string;
  position: number;
}

export interface BoardWithLists {
  _id: string;
  title: string;
  lists: List[];
}

export interface ListWithCards {
  _id: string;
  title: string;
  board: string;
  cards: Card[];
}