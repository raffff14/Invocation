import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000 }, // NOT USED
  birthday: { type: Date, required: true }, // New field for birthday
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] }, // New field for gender
  number: { type: String, required: true }, // New field for phone number
  address: { type: String, required: true }, // New field for address
  registrationDate: { type: Date, default: Date.now },
  isFirstLogin: { type: Boolean, default: true },
  
  collection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
});

export default mongoose.model('User', UserSchema);
