document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get('id');
  
  if (!profileId) {
    window.location.href = '/';
    return;
  }

  loadProfile(profileId);
  
  if (token) {
    document.getElementById('follow-btn').addEventListener('click', () => followUser(profileId));
    document.getElementById('unfollow-btn').addEventListener('click', () => unfollowUser(profileId));
  }
});

async function loadProfile(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    
    if (response.ok) {
      const { user, posts } = data;
      
      // Display profile info
      document.getElementById('profile-username').textContent = user.username;
      document.getElementById('profile-bio').textContent = user.bio;
      document.getElementById('follower-count').textContent = `${user.followers.length} followers`;
      document.getElementById('following-count').textContent = `${user.following.length} following`;
      
      if (user.profilePicture) {
        document.getElementById('profile-picture').src = `/${user.profilePicture}`;
      }
      
      // Display posts
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = '';
      
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        postElement.innerHTML = `
          <p>${post.content}</p>
          ${post.image ? `<img src="/${post.image}" alt="Post image">` : ''}
          <div>
            <span>${post.likes.length} likes</span> • 
            <span>${post.comments.length} comments</span>
          </div>
        `;
        
        postsContainer.appendChild(postElement);
      });
      
      // Show follow/unfollow buttons if logged in and not viewing own profile
      const currentUserId = getUserIdFromToken();
      if (currentUserId && currentUserId !== userId) {
        const isFollowing = user.followers.some(follower => follower._id === currentUserId);
        
        if (isFollowing) {
          document.getElementById('unfollow-btn').style.display = 'block';
        } else {
          document.getElementById('follow-btn').style.display = 'block';
        }
      }
    } else {
      alert(data.error || 'Failed to load profile');
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    alert('Failed to load profile');
  }
}

async function followUser(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      loadProfile(userId);
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to follow user');
    }
  } catch (error) {
    console.error('Follow user error:', error);
    alert('Failed to follow user');
  }
}

async function unfollowUser(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${userId}/unfollow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      loadProfile(userId);
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to unfollow user');
    }
  } catch (error) {
    console.error('Unfollow user error:', error);
    alert('Failed to unfollow user');
  }
}

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
}