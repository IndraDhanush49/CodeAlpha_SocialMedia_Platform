const User = require('../models/User');
const Post = require('../models/Post');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const posts = await Post.find({ userId: user._id })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = req.user;
    
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
    
    await currentUser.save();
    await userToFollow.save();
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = req.user;
    
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ error: 'Not following this user' });
    }
    
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );
    
    await currentUser.save();
    await userToUnfollow.save();
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, followUser, unfollowUser };