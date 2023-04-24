const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Blog = require('../../model/blog');

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

test('test get all blogs', async () => {
  expect((await Blog.getAllBlogs()).length).toBe(0);
});

test('test add a blog', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
});

test('test get all blogs sorted by time', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  await Blog.addBlog('author2', 'title2', 'tag2', 'content2');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(2);
  // result should be sorted by time
  expect(result[0].title).toBe('title2');
  expect(result[1].title).toBe('title1');
});

test('test get a blog by id', async () => {
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  const allBlogs = await Blog.getAllBlogs();
  const expectedBlogTitle = allBlogs[0].title;
  const result = await Blog.getBlogById(blog.id);
  expect(result.title).toBe(expectedBlogTitle);
});

test('test update a blog by the blog author', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
  // currentUser is the author of the blog
  const currentUser = 'author1';
  await Blog.updateBlog(blog.id, currentUser, 'title2', 'tag2', 'content2');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
  // the blog should be updated
  expect(result[0].title).toBe('title2');
});

test('test update a blog not by the blog author', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
  // currentUser is not the author of the blog
  const currentUser = 'author2';
  // updating the blog should throw error because currentUser is not author of the blog
  await expect(Blog.updateBlog(blog.id, currentUser, 'title2', 'tag2', 'content2')).rejects.toThrow('Unauthorized');
});

test('test delete a blog by the blog author', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
  // currentUser is the author of the blog
  const currentUser = 'author1';
  await Blog.deleteBlog(blog.id, currentUser);
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
});

test('test delete a blog not by the blog author', async () => {
  let result = await Blog.getAllBlogs();
  expect(result.length).toBe(0);
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  result = await Blog.getAllBlogs();
  expect(result.length).toBe(1);
  // currentUser is not the author of the blog
  const currentUser = 'author2';
  // deleting the blog should throw error because currentUser is not the author of the blog
  await expect(Blog.deleteBlog(blog.id, currentUser)).rejects.toThrow('Unauthorized');
});

/**
 * Test update a blog likes
 */
test('test update a blog likes', async () => {
  const blog = await Blog.addBlog('author1', 'title1', 'tag1', 'content1');
  const likes = 10;
  // updating the blog likes
  await Blog.updateLikes(blog.id, likes);
  const result = await Blog.getBlogById(blog.id);
  await expect(result.likes).toBe(likes);
});
