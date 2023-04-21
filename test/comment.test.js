const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Blog = require('../model/blog');
const Comment = require('../model/comment');

let mongoServer;
let dbConnection;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const { connection } = mongoose;
  dbConnection = connection;
});

beforeEach(async () => {
  await dbConnection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('test get all comments of a blog or a comment', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
});

test('test add a comment to a blog or a comment', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
  // add a comment to the blog
  await Comment.addComment(blog.id, blog.id, 'username1', 'comment1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(1);
  expect((await Comment.getCommentsByReplyTo(blog.id))[0].content).toBe('comment1');
});

test('test get a comment by id', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
  // add a comment to the blog
  await Comment.addComment(blog.id, blog.id, 'username1', 'comment1');
  const comments = await Comment.getCommentsByReplyTo(blog.id);
  expect(comments.length).toBe(1);
  // get the comment by id
  const comment = await Comment.getCommentById(comments[0].id);
  expect(comment.content).toBe('comment1');
});

test('test delete a comment', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
  // add a comment to the blog
  await Comment.addComment(blog.id, blog.id, 'username1', 'comment1');
  const comments = await Comment.getCommentsByReplyTo(blog.id);
  expect(comments.length).toBe(1);
  // delete the comment
  await Comment.deleteComment(comments[0].id);
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
});

test('test get all comments of a blog', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
  // add two comments to the blog
  const comment = await Comment.addComment(blog.id, blog.id, 'username1', 'comment1');
  await Comment.addComment(blog.id, comment.id, 'username2', 'comment2');
  // get all comments of the blog
  expect((await Comment.getCommentsByBlogId(blog.id)).length).toBe(2);
});

test('test delete comments of a blog', async () => {
  // add a blog
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  expect((await Comment.getCommentsByReplyTo(blog.id)).length).toBe(0);
  // add two comments to the blog
  const comment = await Comment.addComment(blog.id, blog.id, 'username1', 'comment1');
  await Comment.addComment(blog.id, comment.id, 'username2', 'comment2');
  expect((await Comment.getCommentsByBlogId(blog.id)).length).toBe(2);
  // delete the comments of the blog
  await Comment.deleteCommentsByBlogId(blog.id);
  expect((await Comment.getCommentsByBlogId(blog.id)).length).toBe(0);
});
