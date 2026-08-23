import mongoose from 'mongoose';
import dns from 'dns';
import { v2 as cloudinary } from 'cloudinary';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI;

const QuestionSchema = new mongoose.Schema({
  title: String,
  answer: { type: String, required: true },
  category: { type: String, default: 'General' },
  hint: { type: String, default: '' },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) return;
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });
}

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      if (mongoose.connection.readyState >= 1) {
        const docs = await Question.find().sort({ createdAt: 1 });
        const list = docs.map(d => ({
          id: d._id.toString(),
          title: d.title,
          answer: d.answer,
          category: d.category,
          hint: d.hint,
          image: d.image
        }));
        return res.status(200).json(list);
      }
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { title, answer, category, hint, image } = req.body || {};
      if (!answer || !image) {
        return res.status(400).json({ error: 'Answer and image are required' });
      }

      let finalImageUrl = image;
      if (image.startsWith('data:image') && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          const uploadRes = await cloudinary.uploader.upload(image, {
            folder: 'pixel_heist'
          });
          if (uploadRes && uploadRes.secure_url) {
            finalImageUrl = uploadRes.secure_url;
          }
        } catch (cErr) {
          console.warn('Cloudinary upload warning:', cErr.message);
        }
      }

      const newQ = {
        title: title || answer,
        answer: answer.toUpperCase(),
        category: category || 'General',
        hint: hint || '',
        image: finalImageUrl
      };

      if (mongoose.connection.readyState >= 1) {
        const created = await Question.create(newQ);
        return res.status(201).json({
          id: created._id.toString(),
          ...newQ
        });
      }

      return res.status(201).json({ id: String(Date.now()), ...newQ });
    }

    if (req.method === 'PUT') {
      const { id, title, answer, category, hint, image } = req.body || {};
      if (!id) {
        return res.status(400).json({ error: 'Question ID is required for editing' });
      }

      let updates = {
        title: title || answer,
        answer: answer ? answer.toUpperCase() : undefined,
        category: category || 'General',
        hint: hint !== undefined ? hint : ''
      };

      if (image) {
        let finalImageUrl = image;
        if (image.startsWith('data:image') && process.env.CLOUDINARY_CLOUD_NAME) {
          try {
            const uploadRes = await cloudinary.uploader.upload(image, {
              folder: 'pixel_heist'
            });
            if (uploadRes && uploadRes.secure_url) {
              finalImageUrl = uploadRes.secure_url;
            }
          } catch (cErr) {
            console.warn('Cloudinary upload warning:', cErr.message);
          }
        }
        updates.image = finalImageUrl;
      }

      if (mongoose.connection.readyState >= 1) {
        const updated = await Question.findByIdAndUpdate(id, updates, { new: true });
        return res.status(200).json({
          id: updated._id.toString(),
          title: updated.title,
          answer: updated.answer,
          category: updated.category,
          hint: updated.hint,
          image: updated.image
        });
      }

      return res.status(200).json({ id, ...updates });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (id && mongoose.connection.readyState >= 1) {
        await Question.findByIdAndDelete(id);
      }
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
