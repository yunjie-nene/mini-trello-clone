import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  title: string;
  description?: string;
  list: mongoose.Types.ObjectId;
}

const CardSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
});

export default mongoose.model<ICard>('Card', CardSchema);
