import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 10 },
  registrationDate: { type: Date, default: Date.now },
  isFirstLogin: { type: Boolean, default: true },
  collection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Token' }]
});

export default mongoose.model('User', UserSchema);
