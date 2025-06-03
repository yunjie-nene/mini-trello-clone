import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  lists: mongoose.Types.ObjectId[];
  user: mongoose.Types.ObjectId; // Added user field
}

const BoardSchema: Schema = new Schema({
  title: { type: String, required: true },
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.model<IBoard>('Board', BoardSchema);