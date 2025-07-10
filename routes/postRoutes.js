const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createPost, getPosts, likePost, addComment } = require('../controllers/postController');

router.post('/', auth, createPost);
router.get('/', getPosts);
router.post('/:id/like', auth, likePost);
router.post('/:id/comment', auth, addComment);

module.exports = router;