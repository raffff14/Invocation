import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  rarity: { type: Number, required: true, min: 1, max: 6 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  element: { type: String },
  weapon: { type: String },
  faction: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Token', TokenSchema);
