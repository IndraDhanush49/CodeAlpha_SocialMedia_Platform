const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, followUser, unfollowUser } = require('../controllers/userController');

router.get('/:id', getProfile);
router.post('/:id/follow', auth, followUser);
router.post('/:id/unfollow', auth, unfollowUser);

module.exports = router;