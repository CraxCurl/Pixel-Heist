import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { v2 as cloudinary } from 'cloudinary';
import { Question } from './models/Question.js';
import { GameState } from './models/GameState.js';

// Force Node.js to use Google & Cloudflare Public DNS (8.8.8.8 / 1.1.1.1) 
// to bypass Windows/ISP DNS blocking of MongoDB Atlas _mongodb._tcp SRV records!
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
  console.log('🌐 Configured Node.js DNS resolvers for MongoDB Atlas SRV lookup');
} catch (e) {
  console.warn('DNS config note:', e.message);
}

dotenv.config();

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'pixelhiest',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_KEY
    });
  }
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pixel_heist';

let memoryQuestions = [];
let isMongoConnected = false;

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas database:', MONGODB_URI.split('@')[1] || MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas Database!');
  } catch (err) {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    console.warn('⚠️ Falling back to in-memory storage due to network/IP whitelist restriction.');
    isMongoConnected = false;
  }
}

connectDB();

async function getQuestionsFromDB() {
  if (isMongoConnected) {
    try {
      const docs = await Question.find().sort({ createdAt: 1 });
      return docs.map(d => ({
        id: d._id.toString(),
        title: d.title,
        answer: d.answer,
        category: d.category,
        hint: d.hint,
        image: d.image
      }));
    } catch (e) {
      console.error('Error fetching questions from MongoDB Atlas:', e.message);
      return memoryQuestions;
    }
  }
  return memoryQuestions;
}

let activeGameState = {
  currentIndex: 0,
  status: 'IDLE',
  startTime: null,
  elapsedTime: 0,
  revealedAtTime: null,
  showHint: false,
  usedIds: []
};

// REST API ROUTES
app.get('/api/questions', async (req, res) => {
  const questions = await getQuestionsFromDB();
  res.json(questions);
});

app.post('/api/questions', async (req, res) => {
  const { title, answer, category, hint, image } = req.body;
  if (!answer || !image) {
    return res.status(400).json({ error: 'Answer and image are required' });
  }

  let finalImageUrl = image;

  // Cloudinary upload if available
  if (image.startsWith('data:image') && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      console.log('☁️ Uploading image to Cloudinary CDN...');
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'pixel_heist'
      });
      if (uploadRes && uploadRes.secure_url) {
        finalImageUrl = uploadRes.secure_url;
        console.log('✅ Cloudinary upload successful:', finalImageUrl);
      }
    } catch (cErr) {
      console.warn('⚠️ Cloudinary upload warning, storing image directly:', cErr.message);
    }
  }

  const newQuestionData = {
    id: String(Date.now()),
    title: title || answer,
    answer: answer.toUpperCase(),
    category: category || 'Custom Upload',
    hint: hint || '',
    image: finalImageUrl
  };

  if (isMongoConnected) {
    try {
      const created = await Question.create({
        title: newQuestionData.title,
        answer: newQuestionData.answer,
        category: newQuestionData.category,
        hint: newQuestionData.hint,
        image: newQuestionData.image
      });
      newQuestionData.id = created._id.toString();
      console.log('💾 Successfully saved document to MongoDB Atlas! ID:', newQuestionData.id);
    } catch (e) {
      console.error('❌ Failed to save to MongoDB Atlas:', e.message);
      memoryQuestions.push(newQuestionData);
    }
  } else {
    memoryQuestions.push(newQuestionData);
  }

  const updatedQuestions = await getQuestionsFromDB();
  io.emit('questions:updated', updatedQuestions);

  res.status(201).json(newQuestionData);
});

app.delete('/api/questions/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await Question.findByIdAndDelete(id);
      console.log('🗑️ Deleted document from MongoDB Atlas:', id);
    } catch (e) {
      console.error('❌ Failed to delete from MongoDB Atlas:', e.message);
      memoryQuestions = memoryQuestions.filter(q => q.id !== id);
    }
  } else {
    memoryQuestions = memoryQuestions.filter(q => q.id !== id);
  }

  const updatedQuestions = await getQuestionsFromDB();
  io.emit('questions:updated', updatedQuestions);

  res.json({ success: true, message: 'Question deleted' });
});

// SOCKET.IO EVENT HANDLERS
io.on('connection', async (socket) => {
  const questions = await getQuestionsFromDB();
  socket.emit('questions:updated', questions);
  socket.emit('game:state_changed', activeGameState);

  socket.on('admin:start_round', (data) => {
    activeGameState = {
      ...activeGameState,
      currentIndex: data.index !== undefined ? data.index : activeGameState.currentIndex,
      status: 'RUNNING',
      startTime: data.startTime || Date.now(),
      elapsedTime: 0,
      revealedAtTime: null,
      showHint: false,
      usedIds: data.usedIds || activeGameState.usedIds
    };
    io.emit('game:state_changed', activeGameState);
  });

  socket.on('admin:reveal_answer', (data) => {
    activeGameState = {
      ...activeGameState,
      status: 'REVEALED',
      elapsedTime: data.finalElapsed || 20000,
      revealedAtTime: data.seconds || '20.00'
    };
    io.emit('game:state_changed', activeGameState);
  });

  socket.on('admin:toggle_hint', (data) => {
    activeGameState = {
      ...activeGameState,
      showHint: data.showHint !== undefined ? data.showHint : !activeGameState.showHint
    };
    io.emit('game:state_changed', activeGameState);
  });

  socket.on('admin:select_question', (data) => {
    activeGameState = {
      ...activeGameState,
      currentIndex: data.index,
      status: 'IDLE',
      startTime: null,
      elapsedTime: 0,
      revealedAtTime: null,
      showHint: false,
      usedIds: data.usedIds || activeGameState.usedIds
    };
    io.emit('game:state_changed', activeGameState);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Pixel Heist MongoDB Server listening on http://localhost:${PORT}`);
});
