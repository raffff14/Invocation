import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';

import User from './models/User.js';
import Token from './models/Token.js';
import Listing from './models/Listing.js';
import LoginLog from './models/LoginLog.js';
import Card from './models/Card.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://invocation:invocation_cloudcomp@invocation-db.cluster-cvy282oaw78u.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsCAFile: 'global-bundle.pem'
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log("Connected successfully to DocumentDB");
});

// JWT secret (use a strong, random string in production and store it securely)
const JWT_SECRET = 'your_jwt_secret';

// Registration route
app.post('/api/register', [
  body('name').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('birthday').isDate().withMessage('Invalid date format'), // Validate birthday as a date
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'), // Validate gender
  body('number').isMobilePhone().withMessage('Invalid phone number'), // Validate mobile phone number
  body('address').notEmpty().withMessage('Address is required'), // Validate address
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, clientInfo, deviceInfo, birthday, gender, number, address } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      clientInfo: JSON.stringify(clientInfo),
      deviceInfo: JSON.stringify(deviceInfo),
      birthday, // Store the birthday
      gender,   // Store the gender
      number,   // Store the phone number
      address, // Store the address
      isFirstLogin: true
    });

    await user.save();

    // Create login log
    const loginLog = new LoginLog({
      user: user._id,
      ip: clientInfo.ip,
      city: clientInfo.city,
      region: clientInfo.region,
      country: clientInfo.country_name,
      org: clientInfo.org,
      latitude: clientInfo.latitude,
      longitude: clientInfo.longitude,
      deviceInfo: deviceInfo
    });
    await loginLog.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      token,
      message: "User registered successfully. Please change your password for security reasons.",
      isFirstLogin: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, clientInfo, deviceInfo } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create login log
    const loginLog = new LoginLog({
      user: user._id,
      ip: clientInfo.ip,
      city: clientInfo.city,
      region: clientInfo.region,
      country: clientInfo.country_name,
      org: clientInfo.org,
      latitude: clientInfo.latitude,
      longitude: clientInfo.longitude,
      deviceInfo: deviceInfo
    });
    await loginLog.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ 
      token, 
      isFirstLogin: user.isFirstLogin,
      message: user.isFirstLogin ? "Please change your password for security reasons." : undefined
    });

    // Update isFirstLogin if it's true
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      await user.save();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Gacha pull route
app.post('/api/gacha/pull', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // if (user.balance < 1) {
    //   return res.status(400).json({ error: 'Insufficient balance' });
    // }

    // Get all available cards
    const allCards = await Card.find();
    if (allCards.length === 0) {
      return res.status(400).json({ error: 'No cards available' });
    }

    // Implement rarity-based probability
    const rarityProbabilities = {
      5: 0.006, // 0.6% chance for 5-star
      4: 0.051, // 5.1% chance for 4-star
      3: 0.943  // 94.3% chance for 3-star
    };

    let selectedRarity;
    const randomValue = Math.random();
    let cumulativeProbability = 0;

    for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
      cumulativeProbability += probability;
      if (randomValue <= cumulativeProbability) {
        selectedRarity = parseInt(rarity);
        break;
      }
    }

    // Filter cards by the selected rarity
    const cardsOfSelectedRarity = allCards.filter(card => card.rarity === selectedRarity);

    // If no cards of the selected rarity, fallback to all cards
    const availableCards = cardsOfSelectedRarity.length > 0 ? cardsOfSelectedRarity : allCards;

    // Select a random card
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

    // Update user balance and collection
    // user.balance -= 1;
    user.collection.push(randomCard._id);
    await user.save();

    res.json({
      id: randomCard._id,
      name: randomCard.name,
      rarity: randomCard.rarity,
      image: randomCard.image,
      category: randomCard.category,
      element: randomCard.element,
      weapon: randomCard.weapon,
      faction: randomCard.faction
    });
  } catch (error) {
    console.error('Error pulling gacha:', error);
    res.status(500).json({ error: 'Failed to pull gacha' });
  }
});

// Multi-pull gacha route
app.post('/api/gacha/multi-pull', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // if (user.balance < 10) {  // 10 pulls at 0.005 each
    //   return res.status(400).json({ error: 'Insufficient balance' });
    // }

    // Get all available cards
    const allCards = await Card.find();
    if (allCards.length === 0) {
      return res.status(400).json({ error: 'No cards available' });
    }

    // Implement rarity-based probability
    const rarityProbabilities = {
      5: 0.006, // 0.6% chance for 5-star
      4: 0.051, // 5.1% chance for 4-star
      3: 0.943  // 94.3% chance for 3-star
    };

    const pulledCards = [];
    // user.balance -= 10;

    for (let i = 0; i < 10; i++) {
      let selectedRarity;
      const randomValue = Math.random();
      let cumulativeProbability = 0;

      for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
        cumulativeProbability += probability;
        if (randomValue <= cumulativeProbability) {
          selectedRarity = parseInt(rarity);
          break;
        }
      }

      // Filter cards by the selected rarity
      const cardsOfSelectedRarity = allCards.filter(card => card.rarity === selectedRarity);

      // If no cards of the selected rarity, fallback to all cards
      const availableCards = cardsOfSelectedRarity.length > 0 ? cardsOfSelectedRarity : allCards;

      // Select a random card
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];

      pulledCards.push({
        id: randomCard._id,
        name: randomCard.name,
        rarity: randomCard.rarity,
        image: randomCard.image,
        category: randomCard.category,
        element: randomCard.element,
        weapon: randomCard.weapon,
        faction: randomCard.faction
      });

      // Add card to user's collection
      user.collection.push(randomCard._id);

    }

    await user.save();

    res.json(pulledCards);
  } catch (error) {
    console.error('Error multi-pulling gacha:', error);
    res.status(500).json({ error: 'Failed to multi-pull gacha' });
  }
});

// List token for sale
app.post('/api/marketplace/list', authenticateToken, async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    const user = await User.findById(req.user.id);
    const token = await Token.findById(tokenId);

    if (!token || !user.collection.includes(tokenId)) {
      return res.status(400).json({ error: 'Not the owner of the token' });
    }

    const newListing = new Listing({
      token: tokenId,
      seller: req.user.id,
      price: price
    });

    await newListing.save();
    res.json({ message: 'Token listed successfully' });
  } catch (error) {
    console.error('Error listing token:', error);
    res.status(500).json({ error: 'Failed to list token' });
  }
});

// Buy listed token
app.post('/api/marketplace/buy', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId).populate('token');
    const buyer = await User.findById(req.user.id);
    const seller = await User.findById(listing.seller);

    if (!listing || !listing.active) {
      return res.status(400).json({ error: 'Listing not found or not active' });
    }

    if (buyer.balance < listing.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Process the sale
    const token = listing.token;

    buyer.balance -= listing.price;
    seller.balance += listing.price * 0.97; // 3% fee
    
    // Update collections
    seller.collection = seller.collection.filter(id => !id.equals(token._id));
    buyer.collection.push(token._id);

    token.owner = buyer._id;

    listing.active = false;

    await buyer.save();
    await seller.save();
    await token.save();
    await listing.save();

    res.json({ message: 'Token purchased successfully' });
  } catch (error) {
    console.error('Error buying token:', error);
    res.status(500).json({ error: 'Failed to buy token' });
  }
});

// Middleware to verify JWT token and set user in request
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Adjusted endpoint to use authenticated user
app.get('/api/collection', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('collection');
    res.json(user.collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Get marketplace listings
app.get('/api/marketplace/listings', async (req, res) => {
  try {
    const listings = await Listing.find({ active: true }).populate('token');
    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Change password route
app.post('/api/changepassword', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Find the user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get login logs
app.get('/api/login-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .populate('user', 'name email') // Populate user details
      .sort({ loginTime: -1 }) // Sort by login time, most recent first
      .limit(100); // Limit to 100 entries for performance, adjust as needed

    const formattedLogs = logs.map(log => ({
      _id: log._id,
      user: log.user ? `${log.user.name} (${log.user.email})` : 'Unknown User',
      loginTime: log.loginTime,
      ip: log.ip,
      city: log.city,
      region: log.region,
      country: log.country,
      org: log.org,
      latitude: log.latitude,
      longitude: log.longitude,
      deviceInfo: log.deviceInfo
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

// Get user balance route
app.get('/api/user/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ error: 'Failed to fetch user balance' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
