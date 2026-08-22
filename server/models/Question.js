import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    default: 'General'
  },
  hint: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true // Base64 data URL or HTTP image URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
