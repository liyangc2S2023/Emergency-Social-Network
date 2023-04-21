function postNewBlogClick() {
  clearEditPageInput();
  displayEditBlogPage();
  // change button text to "Post"
  $('#postBlogButton').text('Post');
}

function editBlogClick() {
  clearEditPageInput();
  displayEditBlogPage();
  // if edit a blog, record the blog id
  $('#editBlogId').val($('#blogId').val());
  // change button text to "Update"
  $('#postBlogButton').text('Update');
}

function uploadImageClick() {
  $('#imageUploadMessage').text('uploading ... Please wait!');
  const file = $('#blogImageInput').prop('files')[0];
  if (!file) {
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  axios.post('/api/v1/uploadImage', formData)
    .then((res) => {
      const imageUrl = decodeURIComponent(res.data.data.Location);
      $('#uploadedImage').find('img').attr('src', imageUrl);
      $('#blogImageURL').val(imageUrl);
      $('#imageUploadMessage').text('upload success!');
    })
    .catch((err) => {
      $('#imageUploadMessage').text('upload failed!');
      console.log(err);
    });
};

function postBlogClick() {
  // validate input
  if (!validateInput()) {
    return;
  }
  const blog = {
    title: $('#blogTitleInput').val(),
    tag: $('#blogTagDropdown').dropdown('get value'),
    content: $('#blogContentInput').val(),
    image: $('#blogImageURL').val(),
  };
  // if edit a blog, update the blog
  const blogId = $('#editBlogId').val();
  if (blogId) {
    axios.put(`/api/v1/blogs/${blogId}`, blog).then(() => {
      // go back to blogboard
      goBack();
    });
  } else {
    // post a new blog
    axios.post(`/api/v1/blogs`, blog).then(() => {
      // go back to blogboard
      goBack();
    });
  }
}

function validateInput() {
  const blogTitle = $('#blogTitleInput').val().trim();
  const blogContent = $('#blogContentInput').val().trim();
  // Validate required fields
  var isValid = true;
  if (!blogTitle) {
    $('#blogTitleError').show();
    isValid = false;
  } else {
    $('#blogTitleError').hide();
  }
  if (!blogContent) {
    $('#blogContentError').show();
    isValid = false;
  } else {
    $('#blogContentError').hide();
  }
  return isValid;
}

function clearEditPageInput() {
  $('#blogTitleInput').val('');
  $('#blogTagDropdown').dropdown('set selected', 'General');
  $('#blogContentInput').val('');
  $('#blogImageURL').val('');
  $('#blogImageInput').val('');
  $('#uploadedImage').find('img').attr('src', '');
  $('#imageUploadMessage').text('');
}

function deleteBlogClick() {
  const blogId = $('#blogId').val();
  axios.delete(`/api/v1/blogs/${blogId}`).then(() => {
  });
}

function viewDetailsClick(element) {
  // set blogId
  const blogId = $(element).data('blog-id');
  $('#blogId').val(blogId);
  // call api to get rendered blog details
  axios.get(`/api/v1/blogs/${blogId}`).then(() => {
    displayViewBlogPage();
  });
}

function addCommentClick() {
  showCommentForm();
  // set replyTo to blog id
  $('#replyTo').val($('#blogId').val());
}

function showCommentForm() {
  $('#blogCommentForm').show();
  // scroll to comment form
  const t = document.body.scrollHeight;
  window.scroll({ top: t, left: 0, behavior: 'smooth' });
}

function submitCommentClick() {
  // validate comment input
  const commentInput= $('#blogCommentInput').val().trim();
  if (!commentInput) {
    $('#blogCommentError').show();
    return;
  } else {
    $('#blogCommentError').hide();
  }
  // get comment data
  const comment = {
    blogId: $('#blogId').val(),
    replyTo: $('#replyTo').val(),
    content: $('#blogCommentInput').val(),
  };
  // post comment
  axios.post(`/api/v1/blogs/comments`, comment).then(() => {
    // clear comment input
    $('#blogCommentInput').val('');
    // hide comment form
    $('#blogCommentForm').hide();
  });
}

function replyCommentClick(element) {
  showCommentForm();
  // set replyTo & replyLocation
  const commentId = $(element).data('comment-id');
  $('#replyTo').val(commentId);
}

function likeClick() {
  const blogId = $('#blogId').val();
  const likeCount = parseInt($(`#blog-like-count-${blogId}`).text());
  const isLiked = $('#likeButton').data('liked') === 'true';
  if (isLiked) {
    // do unlike operations
    newLikes = likeCount - 1;
    $('#likeIcon').removeClass('red');
    $('#likeButton').data('liked', 'false');
  } else {
    // do like operations
    newLikes = likeCount + 1;
    $('#likeIcon').addClass('red');
    $('#likeButton').data('liked', 'true');
  }
  const likes = { likes: newLikes };
  axios.put(`/api/v1/blogs/${blogId}/likes`, likes)
    .then(() => { });
}

socket.on('postBlog', (newBlogElement, blog) => {
  $("#blogList #startline").after(newBlogElement);
  if (blog.author !== $('#currentUsername').val()) {
    $('#blogEditButton').hide();
    $('#blogDeleteButton').hide();
  }
});

socket.on('editBlog', (udpatedElement, blog) => {
  // replace the blog in blogboard
  $(`#blog-item-${blog.id}`).replaceWith(udpatedElement);
  if (blog.author !== $('#currentUsername').val()) {
    $('#blogEditButton').hide();
    $('#blogDeleteButton').hide();
  }
});

socket.on('viewBlog', (blogViewPage) => {
  $('#blogViewContainer').html(blogViewPage);
});

socket.on('postComment', (commentElement, blogId) => { 
  // if current blog id is the same as comment's blog id, update ui
  if ($('#blogId').val() === blogId) {
    $('#blogCommentForm').before(commentElement);
  }
});

socket.on('updateReplyTo', (replyTo) => {
  $('#replyTo').val(replyTo);
});

socket.on('postReply', (replyElement, blogId, commentId) => {
  if ($('#blogId').val() === blogId) {
    // const commentId = $('#replyTo').val();
    $(`#commentReplies-${commentId}`).append(replyElement);
  }
});

socket.on('deleteBlog', (blogId) => {
  // remove the blog from blogboard
  $(`#blog-item-${blogId}`).remove();
});

socket.on('updateBlogLikes', (blogId, newLikes) => {
  $(`#blog-like-count-${blogId}`).text(newLikes);
});

$(document).ready(function () {
  // Hide the blogCommentForm when the document is clicked, except when clicking on the addCommentButton or blogCommentForm
  $(document).on('click', function (e) {
    const $target = $(e.target);
    if (!$target.closest('#addCommentButton, #blogCommentForm, #replyCommentButton').length) {
      $('#blogCommentForm').hide();
    }
  });
});
