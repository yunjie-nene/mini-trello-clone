import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
  title: string;
  board: mongoose.Types.ObjectId;
  cards: mongoose.Types.ObjectId[];
}

const ListSchema: Schema = new Schema({
  title: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
});

export default mongoose.model<IList>('List', ListSchema);
