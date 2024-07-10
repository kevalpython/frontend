document.addEventListener('DOMContentLoaded', (event) => {
    const dashboard = document.querySelector('#dashboard');
    event.preventDefault()
    dashboard.innerHTML = `
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-3 sidebar">
                    <ul class="sidebar-nav">
                        <li>
                            <a href="#">Home</a>
                        </li>
                        <li>
                            <a href="#">Message</a>
                        </li>
                        <li>
                            <a href="#" id="notification-link">Notification</a>
                        </li>
                        <li>
                            <a href="#" id="logout-link">Logout</a>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6 posts" id="posts">
                    <!-- Posts Section -->
                </div>
                
                <div class="col-md-6 friendrequests" id="friendrequests" style="display: none;">
                    <!-- Friend Requests Section -->
                </div>
                <div class="col-md-3 userprofile" id="userprofile">
                    <!-- User Profile Section -->
                </div>
            </div>
        </div>
    `;
  
    const token = localStorage.getItem('access');
    const user_id = localStorage.getItem('user_id');
  
    const fetchPosts = () => {
        return fetch('http://127.0.0.1:8000/postlist/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    window.location.href = 'index.html';
                }
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        });
    };
  
    const fetchUserProfile = () => {
        return fetch(`http://127.0.0.1:8000/userprofile/${user_id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    window.location.href = 'index.html';
                }
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        });
    };

    const fetchFriendRequests = () => {
        return fetch(`http://127.0.0.1:8000/friendrequestaccepted/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    window.location.href = 'index.html';
                }
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        });
    };
  
    const renderPosts = (data) => {
        const postsDiv = document.getElementById('posts');
        postsDiv.innerHTML = '';
  
        data.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
  
            const username = document.createElement('div');
            username.textContent = post.user_name;
            postDiv.appendChild(username);
  
            if (post.post_images_videos && post.post_images_videos.length > 0) {
                let currentIndex = 0;
                const mediaArray = post.post_images_videos;
  
                const mediaElement = document.createElement('img');
                mediaElement.src = mediaArray[currentIndex].file;
                mediaElement.alt = 'image';
                mediaElement.width = 200;
                mediaElement.height = 200;
  
                postDiv.appendChild(mediaElement);
  
                const updateMedia = () => {
                    mediaElement.src = mediaArray[currentIndex].file;
                    updateButtonsVisibility();
                };
  
                const updateButtonsVisibility = () => {
                    prevButton.style.display = currentIndex > 0 ? 'inline-block' : 'none';
                    nextButton.style.display = currentIndex < mediaArray.length - 1 ? 'inline-block' : 'none';
                };
  
                const prevButton = document.createElement('button');
                prevButton.textContent = 'Previous';
                prevButton.style.display = 'none';
                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + mediaArray.length) % mediaArray.length;
                    updateMedia();
                });
                postDiv.appendChild(prevButton);
  
                const nextButton = document.createElement('button');
                nextButton.textContent = 'Next';
                nextButton.style.display = mediaArray.length > 1 ? 'inline-block' : 'none';
                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % mediaArray.length;
                    updateMedia();
                });
                postDiv.appendChild(nextButton);
  
                updateButtonsVisibility();
            }
  
            const contentParagraph = document.createElement('p');
            contentParagraph.textContent = post.content;
            postDiv.appendChild(contentParagraph);
  
            const likeButton = document.createElement('button');
            likeButton.innerHTML = '<i class="fa fa-heart" style="font-size:20px;color:green"></i>';
            likeButton.className = 'like-button';
            if (post.has_like) {
                likeButton.innerHTML = '<i class="fa fa-heart" style="font-size:20px;color:red"></i>';
            }
            likeButton.addEventListener('click', (event) => {
                event.preventDefault();
                fetch(`http://127.0.0.1:8000/likepost/${post.id}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (post.has_like) {
                        likeButton.innerHTML = '<i class="fa fa-heart" style="font-size:20px;color:red"></i>';
                    } else {
                        likeButton.innerHTML = '<i class="fa fa-heart" style="font-size:20px;color:green"></i>';
                    }
                })
                .catch(error => {
                    console.error('Error liking post:', error);
                });
            });
            postDiv.appendChild(likeButton);
  
            const spaceDiv = document.createElement('div');
            spaceDiv.style.marginBottom = '10px';
            postDiv.appendChild(spaceDiv);
  
            const commentButton = document.createElement('button');
            commentButton.innerHTML = '<i class="fa fa-comments-o" style="font-size:20px"></i>';
            commentButton.className = 'comment-button';
            commentButton.addEventListener('click', () => {
                console.log('Comment button clicked for post:', post.id);
            });
            postDiv.appendChild(commentButton);
  
            const likesParagraph = document.createElement('p');
            likesParagraph.textContent = `Likes (${post.total_likes})`;
            postDiv.appendChild(likesParagraph);
  
            postsDiv.appendChild(postDiv);
        });
    };
  
    const renderUserProfile = (data) => {
        const userProfileDiv = document.getElementById('userprofile');
        userProfileDiv.innerHTML = '';
  
        const profileImage = document.createElement('img');
        profileImage.src = data.profile_img;
        profileImage.alt = 'Profile Image';
        profileImage.width = 100;
        profileImage.height = 100;
  
        const username = document.createElement('p');
        username.textContent = data.username;
  
        userProfileDiv.appendChild(profileImage);
        userProfileDiv.appendChild(username);
    };

    const renderFriendRequests = (data) => {
        const friendRequestsDiv = document.getElementById('friendrequests');
        friendRequestsDiv.innerHTML = '';
    
        data.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.className = 'request';
            console.log(request)
            const username = document.createElement('div');
            username.textContent = request.from_user;
            requestDiv.appendChild(username);
    
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.addEventListener('click', () => {
                // Handle accept friend request
                console.log('Accept friend request for user:', request.id);
            });
            requestDiv.appendChild(acceptButton);
    
            const declineButton = document.createElement('button');
            declineButton.textContent = 'Decline';
            declineButton.addEventListener('click', () => {
                // Handle decline friend request
                console.log('Decline friend request for user:', request.id);
            });
            requestDiv.appendChild(declineButton);
    
            friendRequestsDiv.appendChild(requestDiv);
        });
    };
  
    const loadDashboard = () => {
        Promise.all([fetchPosts(), fetchUserProfile()])
        .then(([postsData, userProfileData]) => {
            renderPosts(postsData);
            renderUserProfile(userProfileData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    };
  
    loadDashboard();

    document.getElementById('notification-link').addEventListener('click', (event) => {
        event.preventDefault();
        const postsDiv = document.getElementById('posts');
        const friendRequestsDiv = document.getElementById('friendrequests');
        postsDiv.style.display = 'none';
        friendRequestsDiv.style.display = 'block';

        fetchFriendRequests()
        .then(data => {
            renderFriendRequests(data);
        })
        .catch(error => {
            console.error('Error fetching friend requests:', error);
        });
    });

    document.getElementById('logout-link').addEventListener('click', (event) => {
        event.preventDefault();
        const refresh_token = localStorage.getItem('refresh');
        fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('username');
            localStorage.removeItem('user_id');
            window.location.replace('index.html');
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });
});
