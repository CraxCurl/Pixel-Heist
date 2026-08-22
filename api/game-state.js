import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;

const StateSchema = new mongoose.Schema({
  key: { type: String, default: 'active', unique: true },
  currentIndex: { type: Number, default: 0 },
  status: { type: String, default: 'IDLE' },
  startTime: { type: Number, default: null },
  elapsedTime: { type: Number, default: 0 },
  revealedAtTime: { type: String, default: null },
  showHint: { type: Boolean, default: false },
  usedIds: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

const GameState = mongoose.models.GameState || mongoose.model('GameState', StateSchema);

let inMemoryState = {
  currentIndex: 0,
  status: 'IDLE',
  startTime: null,
  elapsedTime: 0,
  revealedAtTime: null,
  showHint: false,
  usedIds: []
};

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) return;
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      if (mongoose.connection.readyState >= 1) {
        let doc = await GameState.findOne({ key: 'active' });
        if (!doc) {
          doc = await GameState.create({ key: 'active', ...inMemoryState });
        }
        return res.status(200).json({
          currentIndex: doc.currentIndex,
          status: doc.status,
          startTime: doc.startTime,
          elapsedTime: doc.elapsedTime,
          revealedAtTime: doc.revealedAtTime,
          showHint: doc.showHint,
          usedIds: doc.usedIds
        });
      }
      return res.status(200).json(inMemoryState);
    }

    if (req.method === 'POST') {
      const updates = req.body || {};
      inMemoryState = { ...inMemoryState, ...updates };

      if (mongoose.connection.readyState >= 1) {
        const doc = await GameState.findOneAndUpdate(
          { key: 'active' },
          { ...updates, updatedAt: Date.now() },
          { new: true, upsert: true }
        );
        return res.status(200).json(doc);
      }

      return res.status(200).json(inMemoryState);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('State API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
