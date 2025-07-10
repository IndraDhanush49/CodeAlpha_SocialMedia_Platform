const Post = require('../models/Post');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage }).single('image');

const createPost = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      const { content } = req.body;
      const image = req.file ? req.file.path : null;
      
      const post = new Post({
        userId: req.user._id,
        content,
        image
      });
      
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const userId = req.user._id;
    const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
    
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.comments.push({
      userId: req.user._id,
      content: req.body.content
    });
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPost, getPosts, likePost, addComment };