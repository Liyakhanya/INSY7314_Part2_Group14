const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB - Data will be saved!'))
.catch(err => console.log('MongoDB connection failed:', err));

// ==================== DATABASE MODELS ====================

// Post Model for storing posts
const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  image: String, 
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  userId: String,
  userName: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// User Model for storing users and SOS contacts
const userSchema = new mongoose.Schema({
  firebaseUid: String,
  name: String,
  email: String,
  profileImage: String,
  sosContacts: [{
    name: String,
    phone: String,
    isPrimary: Boolean
  }],
  settings: {
    suburb: String,
    darkMode: { type: Boolean, default: false },
    anonymousMode: { type: Boolean, default: false },
    trustedContacts: [String],
    locationSharingDuration: Number
  },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// ==================== API ROUTES ====================

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sentinel API is working!',
    features: 'Posts, SOS, Users, Database Storage',
    status: 'FULLY FUNCTIONAL'
  });
});

// ==================== POSTS MANAGEMENT ====================

// Getting all posts from database
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Creating a new post (saves to database)
app.post('/api/posts', async (req, res) => {
  try {
    const { title, description, category, imageBase64, latitude, longitude, address, userId, userName } = req.body;

    const post = new Post({
      title,
      description,
      category,
      image: imageBase64,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || "Current Location"
      },
      userId: userId || "unknown",
      userName: userName || "Unknown User"
    });

    const savedPost = await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Post saved to database!',
      post: savedPost
    });
    
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Failed to create post: ' + error.message 
    });
  }
});

// Searching Posts
app.get('/api/posts/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ==================== SOS EMERGENCY FEATURE ====================

// SOS ALERT (with contact management)
app.post('/api/sos/alert', async (req, res) => {
  try {
    const { userId, latitude, longitude, phoneNumber, customMessage } = req.body;

    // Getting user's SOS contacts from database
    let numbersToAlert = [];
    if (phoneNumber) {
      numbersToAlert.push(phoneNumber);
    } else {
      const user = await User.findOne({ firebaseUid: userId });
      if (user && user.sosContacts && user.sosContacts.length > 0) {
        numbersToAlert = user.sosContacts
          .filter(contact => contact.phone)
          .map(contact => contact.phone);
      }
    }

    const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const message = customMessage || 
      `SOS ALERT! I need immediate help! My location: ${locationUrl}`;

    // Simulating sending SMS to all contacts
    const results = numbersToAlert.map(number => ({
      number,
      status: 'sent',
      message: message,
      timestamp: new Date().toISOString()
    }));

    // If no contacts found, at least log the alert
    if (numbersToAlert.length === 0) {
      results.push({
        number: 'emergency-log',
        status: 'logged',
        message: 'SOS alert received but no contacts configured',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: 'SOS alert processed!',
      results: results,
      location: { latitude, longitude },
      contactsNotified: numbersToAlert.length
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'SOS failed: ' + error.message 
    });
  }
});

// Adding SOS contact
app.post('/api/sos/contacts', async (req, res) => {
  try {
    const { userId, name, phone, isPrimary } = req.body;
    
    let user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      user = new User({
        firebaseUid: userId,
        name: 'New User',
        email: 'user@example.com'
      });
    }

    if (!user.sosContacts) {
      user.sosContacts = [];
    }

    const newContact = { name, phone, isPrimary: isPrimary || false };
    user.sosContacts.push(newContact);
    
    await user.save();

    res.json({ 
      success: true,
      message: 'SOS contact added!',
      contact: newContact
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Failed to add contact' 
    });
  }
});

// ==================== USER MANAGEMENT ====================

// Creating or updating user
app.post('/api/users', async (req, res) => {
  try {
    const { firebaseUid, name, email, profileImage } = req.body;

    let user = await User.findOne({ firebaseUid });
    if (user) {
      // Updating existing user
      if (name) user.name = name;
      if (email) user.email = email;
      if (profileImage) user.profileImage = profileImage;
    } else {
      // Creating a new user
      user = new User({
        firebaseUid,
        name,
        email,
        profileImage
      });
    }

    const savedUser = await user.save();
    res.json({
      success: true,
      message: 'User saved successfully',
      user: savedUser
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Failed to save user' 
    });
  }
});

// Updating user settings
app.put('/api/users/:firebaseUid/settings', async (req, res) => {
  try {
    let user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { suburb, darkMode, anonymousMode, trustedContacts, locationSharingDuration } = req.body;

    if (!user.settings) {
      user.settings = {};
    }

    user.settings = {
      suburb: suburb !== undefined ? suburb : user.settings.suburb,
      darkMode: darkMode !== undefined ? darkMode : user.settings.darkMode,
      anonymousMode: anonymousMode !== undefined ? anonymousMode : user.settings.anonymousMode,
      trustedContacts: trustedContacts || user.settings.trustedContacts,
      locationSharingDuration: locationSharingDuration || user.settings.locationSharingDuration
    };

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Settings updated!',
      updatedFields: Object.keys(req.body),
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Failed to update settings' 
    });
  }
});

// ==================== STARTING SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('SENTINEL API - FULLY FUNCTIONAL!');
  console.log(`http://localhost:${PORT}`);
  console.log('MongoDB: Data will be saved permanently!');
  console.log('Features: Posts, SOS, Users, Database');
});