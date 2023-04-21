const Blog = require('../model/blog');

class BlogController {
  static async getAllBlogs() {
    return Blog.getAllBlogs();
  }

  static async getBlogById(id) {
    return Blog.getBlogById(id);
  }

  static async addBlog(author, title, tag, content, image) {
    return Blog.addBlog(author, title, tag, content, image);
  }

  static async updateBlog(id, currentUser, title, tag, content, image) {
    return Blog.updateBlog(id, currentUser, title, tag, content, image);
  }

  static async deleteBlog(id, currentUser) {
    return Blog.deleteBlog(id, currentUser);
  }

  static async updateLikes(id, likes) {
    return Blog.updateLikes(id, likes);
  }
}

module.exports = BlogController;
