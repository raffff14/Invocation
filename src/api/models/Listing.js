import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Listing', ListingSchema);
