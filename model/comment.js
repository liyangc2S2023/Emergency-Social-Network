const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const uuid = require('uuid');

/**
 * @typedef Comment
//  */
const commentSchema = new mongoose.Schema({
  id: { type: String, default: uuid.v4 },
  blogId: { type: String, required: true },
  replyTo: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
});

/**
 * @typedef CommentTable
 */
const CommentTable = mongoose.model('Comment', commentSchema);

/**
 * @class Comment
 */
class Comment {
  /**
   * Get all comments of a blog
   */
  static async getCommentsByBlogId(blogId) {
    return CommentTable.find({ blogId }).sort({ timestamp: 1 });
  }

  /**
   * Get all comments of a blog or a comment
   */
  static async getCommentsByReplyTo(replyTo) {
    return CommentTable.find({ replyTo }).sort({ timestamp: 1 });
  }

  /**
   * Get comment by id
   */
  static async getCommentById(id) {
    return CommentTable.findOne({ id });
  }

  /**
   * Add a comment to a blog
   */
  static async addComment(blogId, replyTo, author, content) {
    return CommentTable.create({
      blogId, replyTo, author, content,
    });
  }

  /**
   * Delete a comment
   */
  static async deleteComment(id) {
    return CommentTable.deleteOne({ id });
  }

  /**
   * Delete all comments of a blog
   */
  static async deleteCommentsByBlogId(blogId) {
    return CommentTable.deleteMany({ blogId });
  }
}

module.exports = Comment;
