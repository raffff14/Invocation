import mongoose from 'mongoose';
import { characters } from '../data/characters.js';
import { items } from '../data/items.js';

// MongoDB connection URI
const uri = 'mongodb://invocation:invocation_cloudcomp@invocation-db.cluster-cvy282oaw78u.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false';

// Define the Card schema
const cardSchema = new mongoose.Schema({
  id: Number,
  name: String,
  rarity: Number,
  image: String,
  category: String,
  // Fields specific to characters
  element: String,
  weapon: String,
  faction: String,
  // Fields specific to items (if any)
  // Add any item-specific fields here if needed
});

const Card = mongoose.model('Card', cardSchema);

async function uploadCards() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    await Card.deleteMany({});
    console.log('Cleared existing cards');

    // Prepare character data
    const characterCards = characters.map(char => ({
      ...char,
      category: 'Character'
    }));

    // Prepare item data
    const itemCards = items.map(item => ({
      ...item,
      element: null,
      weapon: null,
      faction: null
    }));

    // Combine characters and items
    const allCards = [...characterCards, ...itemCards];

    // Insert new data
    const result = await Card.insertMany(allCards);
    console.log(`${result.length} cards inserted`);

  } catch (error) {
    console.error('Error uploading cards:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

uploadCards().catch(console.error);
