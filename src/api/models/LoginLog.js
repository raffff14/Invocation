import mongoose from 'mongoose';

const LoginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, default: Date.now },
  ip: String,
  city: String,
  region: String,
  country: String,
  org: String,
  latitude: Number,
  longitude: Number,
  deviceInfo: {
    os: String,
    browser: String,
    language: String,
    screenResolution: String,
    timeZone: String
  }
});

export default mongoose.model('LoginLog', LoginLogSchema);
