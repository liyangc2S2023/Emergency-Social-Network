const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const uuid = require('uuid');
const config = require('../config');

/**
 * @typedef Blog
//  */
const blogSchema = new mongoose.Schema({
  id: { type: String, default: uuid.v4 },
  author: { type: String, required: true },
  title: { type: String, required: true },
  tag: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  image: { type: String, default: config.DEFAULT_BLOG_IMAGE },
  likes: { type: Number, default: 0 },
});

/**
 * @typedef BlogTable
 */
const BlogTable = mongoose.model('Blog', blogSchema);

/**
 * @class Blog
 */
class Blog {
  /**
   * Get all blogs
   * @returns {Promise<Blog[]>}  All blogs
   */
  static async getAllBlogs() {
    return BlogTable.find({}).sort({ timestamp: -1 });
  }

  /**
   * Get a blog by id
   * @param {*} id Id of the blog
   * @returns {Promise<Blog>}  Blog
   */
  static async getBlogById(id) {
    return BlogTable.findOne({ id });
  }

  /**
   * Add a blog
   * @param {*} author Author of the blog
   * @param {*} title Title of the blog
   * @param {*} tag Tag of the blog
   * @param {*} content Content of the blog
   * @param {*} image Image url of the blog
   * @returns {Promise<Blog>}  New blog
   */
  static async addBlog(author, title, tag, content, image) {
    return BlogTable.create({
      author, title, tag, content, timestamp: Date.now(), image,
    });
  }

  /**
   * Update a blog by id. Only the author can update the blog
   * @param {*} id Id of the blog
   * @param {*} currentUser Current user
   * @param {*} title Title of the udpated blog
   * @param {*} tag Tag of the udpated blog
   * @param {*} content Content of the udpated blog
   * @param {*} image Image url of the udpated blog
   * @returns {Promise<Blog>}  Updated blog
   */
  static async updateBlog(id, currentUser, title, tag, content, image) {
    await Blog.validateBlogAuthor(id, currentUser);
    // { new: true } return the updated document
    return BlogTable.findOneAndUpdate(
      { id },
      {
        currentUser, title, tag, content, timestamp: Date.now(), image,
      },
      { new: true },
    );
  }

  /**
   * Delete a blog by blog id. Only the author can delete the blog
   * @param {*} id Id of the blog
   * @param {*} currentUser Current user
   * @returns {Promise<*>} An object containing the number of documents deleted
   */
  static async deleteBlog(id, currentUser) {
    await Blog.validateBlogAuthor(id, currentUser);
    return BlogTable.deleteOne({ id });
  }

  /**
   * Validate if the current user is the author of the blog
   * @param {*} blogId Id of the blog
   * @param {*} currentUser Current user
   */
  static async validateBlogAuthor(blogId, currentUser) {
    const blog = await BlogTable.findOne({ id: blogId });
    if (blog && blog.author !== currentUser) {
      throw new Error(`Unauthorized. Only the author can update or delete this blog. Blog author: ${blog.author}, current user: ${currentUser}`);
    }
  }

  /**
   * update the likes of a blog
   * @param {*} id Id of the blog
   * @param {*} likes Likes of the blog
   */
  static async updateLikes(id, likes) {
    return BlogTable.findOneAndUpdate(
      { id },
      {
        likes,
      },
      { new: true },
    );
  }
}

module.exports = Blog;
