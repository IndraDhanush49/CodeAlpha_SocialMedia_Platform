document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const postsContainer = document.getElementById('posts-container');
  const submitPostBtn = document.getElementById('submit-post');
  const postImageInput = document.getElementById('post-image');
  const imagePreview = document.getElementById('image-preview');
  const removeImageBtn = document.getElementById('remove-image');

  if (token) {
    loadPosts();
  }

  if (submitPostBtn) {
    submitPostBtn.addEventListener('click', createPost);
  }

  // Image preview functionality
  if (postImageInput) {
    postImageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          imagePreview.src = event.target.result;
          imagePreview.style.display = 'block';
          removeImageBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function() {
      postImageInput.value = '';
      imagePreview.src = '';
      imagePreview.style.display = 'none';
      removeImageBtn.style.display = 'none';
    });
  }

  async function loadPosts() {
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();

      postsContainer.innerHTML = '';
      posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        const isLiked = post.likes.some(like => like._id === getUserIdFromToken());
        const likeButtonClass = isLiked ? 'like-btn liked' : 'like-btn';
        
        postElement.innerHTML = `
          <div class="post-header">
            <a href="/profile.html?id=${post.userId._id}">
              ${post.userId.profilePicture ? 
                `<img src="/${post.userId.profilePicture}" alt="Profile" class="post-user-image">` : 
                '<i class="fas fa-user-circle"></i>'}
            </a>
            <a href="/profile.html?id=${post.userId._id}" class="post-user">${post.userId.username}</a>
          </div>
          <div class="post-content">${post.content}</div>
          ${post.image ? `
            <div class="post-image-container">
              <img src="/${post.image}" alt="Post image" class="post-image">
            </div>` : ''}
          <div class="post-actions">
            <button class="${likeButtonClass}" data-post-id="${post._id}">
              <i class="fas fa-heart"></i> ${post.likes.length}
            </button>
            <button class="comment-btn" data-post-id="${post._id}">
              <i class="fas fa-comment"></i> Comment
            </button>
          </div>
          <div class="comments">
            <h4>Comments (${post.comments.length})</h4>
            ${post.comments.map(comment => `
              <div class="comment">
                <span class="comment-user">${comment.userId.username}:</span>
                <span class="comment-content">${comment.content}</span>
              </div>
            `).join('')}
            <div class="comment-input-container">
              <input type="text" class="comment-input" data-post-id="${post._id}" placeholder="Add a comment">
              <button class="comment-submit-btn" data-post-id="${post._id}">Post</button>
            </div>
          </div>
        `;
        
        postsContainer.appendChild(postElement);
      });

      // Add event listeners for like buttons
      document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', likePost);
      });

      // Add event listeners for comment buttons
      document.querySelectorAll('.comment-submit-btn').forEach(btn => {
        btn.addEventListener('click', addComment);
      });
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }

  async function createPost() {
    const content = document.getElementById('post-content').value;
    const imageInput = document.getElementById('post-image');
    const formData = new FormData();

    if (!content && !imageInput.files[0]) {
      alert('Please add content or an image to your post');
      return;
    }

    formData.append('content', content);
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        document.getElementById('post-content').value = '';
        imageInput.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        removeImageBtn.style.display = 'none';
        loadPosts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post');
    }
  }

  async function likePost(e) {
    const postId = e.currentTarget.getAttribute('data-post-id');
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadPosts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to like post');
      }
    } catch (error) {
      console.error('Like post error:', error);
      alert('Failed to like post');
    }
  }

  async function addComment(e) {
    const postId = e.currentTarget.getAttribute('data-post-id');
    const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
    const content = commentInput.value;

    if (!content) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        commentInput.value = '';
        loadPosts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Add comment error:', error);
      alert('Failed to add comment');
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
});