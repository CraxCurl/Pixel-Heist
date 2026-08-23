import mongoose from 'mongoose';

const GameStateSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'current_game',
    unique: true
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['IDLE', 'RUNNING', 'REVEALED', 'TIMEOUT'],
    default: 'IDLE'
  },
  startTime: {
    type: Number,
    default: null
  },
  elapsedTime: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 20000
  },
  revealedAtTime: {
    type: String,
    default: null
  },
  usedIds: {
    type: [String],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const GameState = mongoose.models.GameState || mongoose.model('GameState', GameStateSchema);
