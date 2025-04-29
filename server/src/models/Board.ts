import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  lists: mongoose.Types.ObjectId[];
}

const BoardSchema: Schema = new Schema({
  title: { type: String, required: true },
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
});

export default mongoose.model<IBoard>('Board', BoardSchema);