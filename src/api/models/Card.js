import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  rarity: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Character', 'Action'] // Add other categories if needed
  },
  element: {
    type: String,
    required: function() { return this.category === 'Character'; }
  },
  weapon: {
    type: String,
    required: function() { return this.category === 'Character'; }
  },
  faction: {
    type: String,
    required: function() { return this.category === 'Character'; }
  }
}, {
  timestamps: true
});

const Card = mongoose.model('Card', cardSchema);

export default Card;
