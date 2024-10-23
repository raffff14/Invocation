const mongoose = require('mongoose');
const { characters } = require('../data/characters');

// MongoDB connection URI
const uri = 'mongodb://invocation:invocation_cloudcomp@invocation-db.cluster-cvy282oaw78u.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false';

// Define the Character schema
const characterSchema = new mongoose.Schema({
  id: Number,
  name: String,
  rarity: Number,
  element: String,
  weapon: String,
  faction: String,
  image: String,
  category: String
});

const Character = mongoose.model('Character', characterSchema);

async function uploadCharacters() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    await Character.deleteMany({});
    console.log('Cleared existing characters');

    // Insert new data
    const result = await Character.insertMany(characters);
    console.log(`${result.length} characters inserted`);

  } catch (error) {
    console.error('Error uploading characters:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

uploadCharacters().catch(console.error);
