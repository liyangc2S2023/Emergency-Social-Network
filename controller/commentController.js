const Comment = require('../model/comment');

class CommentController {
  /**
   * get all comments of a blog or a comment
   * @param {*} replyTo blog id or comment id
   * @returns {Promise<Comment[]>}  All comments of a blog
   */
  static async getCommentsByReplyTo(replyTo) {
    return Comment.getCommentsByReplyTo(replyTo);
  }

  /**
   * get a comment by id
   */
  static async getCommentById(id) {
    return Comment.getCommentById(id);
  }

  /**
   * add a comment to a blog or a comment
   */
  static async addComment(blogId, replyTo, author, content) {
    return Comment.addComment(blogId, replyTo, author, content);
  }

  /**
   * delete a comment
   * @param {*} id comment id
   */
  static async deleteComment(id) {
    return Comment.deleteComment(id);
  }

  /**
   * delete all comments of a blog
   */
  static async deleteCommentsByBlogId(blogId) {
    return Comment.deleteCommentsByBlogId(blogId);
  }
}

module.exports = CommentController;
