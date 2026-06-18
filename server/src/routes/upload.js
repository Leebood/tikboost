import express from 'express';
import crypto from 'crypto';
import multer from 'multer';

const router = express.Router();

const uploadedImages = new Map();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }
    
    const imageId = crypto.randomUUID();
    const imageUrl = `https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800`;
    
    uploadedImages.set(imageId, imageUrl);
    
    res.json({
      success: true,
      data: {
        id: imageId,
        url: imageUrl,
        cdn_url: imageUrl
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/images/:imageId', (req, res) => {
  try {
    const { imageId } = req.params;
    const imageUrl = uploadedImages.get(imageId);
    
    if (!imageUrl) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: imageId,
        url: imageUrl
      }
    });
    
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
