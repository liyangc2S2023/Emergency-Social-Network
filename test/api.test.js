const axios = require('axios');
// const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const Message = require('../model/message');
const User = require('../model/user');
const Blog = require('../model/blog');
const Comment = require('../model/comment');
const config = require('../config');
const DB = require('../database');

const PORT = 3000;
const HOST = `http://localhost:${PORT}/api/v1`;

// Initiate Server
const APP = require('../backend');
const { USER_STATUS } = require('../config');

const { server, setupRestfulRoutes } = new APP();

// let server;
// let mongoServer;
let userToken;
let coordinatorToken;
let db;

beforeAll(async () => {
  setupRestfulRoutes();
  server.listen(PORT);
  // await mongoose.disconnect();
  db = new DB('test');
  await db.connect();
  // mongoServer = await MongoMemoryServer.create();
  // const mongoUri = mongoServer.getUri();
  // await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  // const { connection } = mongoose;
  // dbConnection = connection;
});

afterAll(async () => {
  await db.disconnect();
  await server.close();
});

const sampleUser = {
  username: 'test1',
  password: 'tttt',
  role: 'user',
};

const smapleCoordinator = {
  username: 'test2',
  password: 'tttt',
  role: config.USER_ROLE.COORDINATOR,
};

beforeEach(async () => {
  // await dbConnection.db.dropDatabase();
  await db.freshTables();

  // await db.connect(mongoUri, '');
  await User.addUser('test1', 'tttt');
  await User.addUser('test2', 'tttt', config.USER_ROLE.COORDINATOR);
  await User.addUser('test3', 'tttt');
  await User.addUser('test4', 'tttt');

  // loigin to a test user fist
  await axios.put(`${HOST}/login`, sampleUser).then((response) => {
    userToken = response.data.token;
  });

  await axios.put(`${HOST}/login`, smapleCoordinator).then((response) => {
    coordinatorToken = response.data.token;
  });
});

test('can post a supply', async () => {
  const supply = {
    name: 'test_supply',
    quantity: 10,
    category: 'test_category',
  };
  await axios.post(`${HOST}/supplies`, supply, {
    headers: { authorization: userToken },
  }).then((response) => {
    expect(response.status).toBe(200);
    // expect(response.data.name).toBe(supply.name);
    // expect(response.data.quantity).toBe(supply.quantity);
    // expect(response.data.category).toBe(supply.category);
    // expect(response.data.owner).toBe(supply.owner);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

// user integration test
test('Can post a new user', async () => {
  const UserData = {
    username: 'testA',
    password: '1234412m',
    role: 'user',
  };

  await axios.post(`${HOST}/users`, UserData, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });

  await axios.get(`${HOST}/users`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(5);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('Can get all users', async () => {
  await axios.get(`${HOST}/users`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(4);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get a user by id', async () => {
  await axios.get(`${HOST}/users/test1`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.username).toBe('test1');
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('test user login', async () => {
  await axios.put(`${HOST}/login`, { username: 'fail', password: 'fail' })
    .catch((err) => {
      expect(err.response.status).toBe(400);
    });
});

test('test user current', async () => {
  let newToken;
  await User.addUser('testusercurrent', '12345');
  // add a current user
  await axios.put(`${HOST}/login`, { username: 'testusercurrent', password: '12345' }).then((response) => {
    newToken = response.data.token;
  });

  await axios.get(`${HOST}/users/current`, { headers: { authorization: newToken } })
    .then((res) => {
      expect(res.data.data.username).toBe('testusercurrent');
    });
});

// post integration test
test('can post announcement', async () => {
  const announcement = {
    content: 'test',
    sender: 'test',
  };
  await axios.post(`${HOST}/announcements`, announcement, { headers: { authorization: coordinatorToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('user cannot post announcement', async () => {
  const announcement = {
    sender: 'test',
    content: 'test',
  };
  await axios.post(`${HOST}/announcements`, announcement, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can change the status of user', async () => {
  const statusChange = {
    username: sampleUser.username,
    status: USER_STATUS.OK,
  };
  await axios.post(`${HOST}/status`, statusChange, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get the role of user', async () => {
  await axios.get(`${HOST}/initialrole`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can change the role of user', async () => {
  const roleChange = {
    username: sampleUser.username,
    role: config.USER_ROLE.ELE,
  };
  await axios.post(`${HOST}/role`, roleChange, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can report power status of a user', async () => {
  const powerReport = {
    username: sampleUser.username,
    description: 'no power for 1 hr.',
    address: '1625 Plymouth St, Mountain View, CA 94043',
    powerStatus: config.FIX_ORDER_STATUS.NEEDFIX,
  };
  await axios.post(`${HOST}/powerreport`, powerReport, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can update fix order by electricians', async () => {
  const updateFixOrder = {
    sender: 'Sheldon Cooper',
    helper: 'Star Treck',
    powerStatus: config.FIX_ORDER_STATUS.FIXING,
  };
  await axios.post(`${HOST}/fixorder`, updateFixOrder, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get power issue list', async () => {
  await axios.get(`${HOST}/powerIssueList`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post a public message', async () => {
  const message = {
    sender: 'test',
    content: 'test',
    status: USER_STATUS.OK,
    receiver: 'all',
  };
  await axios.post(`${HOST}/messages`, message, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get message between two user', async () => {
  await axios.get(`${HOST}/messages/private/:${sampleUser.username}/:${smapleCoordinator.username}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get message by sender', async () => {
  await axios.get(`${HOST}/messages/:${sampleUser.username}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get all message', async () => {
  await axios.get(`${HOST}/messages`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can post private message', async () => {
  const message = {
    sender: 'test',
    content: 'test',
    status: USER_STATUS.OK,
    receiver: 'test2',
  };
  await axios.post(`${HOST}/messages/private/${message.sender}/${message.receiver}`, message, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

const queryFunction = async (query) => {
  await axios.get(`${HOST}/search`, {
    headers: { authorization: userToken },
    params: query,
  }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
};

test('can search content', async () => {
  const query = {
    context: 'username',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query announcement', async () => {
  const query = {
    context: 'announcement',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query public message', async () => {
  const query = {
    context: 'publicMessage',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

test('can query private message', async () => {
  const query = {
    context: 'privateMessage',
    criteria: 'test',
    sender: 'test',
    receiver: 'test',
    page: 0,
  };

  await queryFunction(query);
});

/**
 * test for get all blogs
 */
test('can get all blogs', async () => {
  await axios.get(`${HOST}/blogs`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.length).toBe(0);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for post blog
 */
test('can post blog', async () => {
  const blog = {
    author: 'author', title: 'title', tag: 'tag', content: 'content',
  };
  await axios.post(`${HOST}/blogs`, blog, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.title).toBe('title');
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for get blog by id
 */
test('can get blog by id', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  await axios.get(`${HOST}/blogs/${blog.id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.title).toBe(blog.title);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for update blog by author
 */
test('can update blog by author', async () => {
  // the author of the blog is the sampleUser
  const blog = await Blog.addBlog(sampleUser.username, 'title', 'tag', 'content');
  const newBlog = {
    title: 'title1', tag: 'tag1', content: 'content1',
  };
  // login by the sampleUser
  await axios.put(`${HOST}/blogs/${blog.id}`, newBlog, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.title).toBe(newBlog.title);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for update blog not by author
 */
test('cannot update blog not by author', async () => {
  // the author of the blog is not the sampleUser
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  const newBlog = {
    title: 'title1', tag: 'tag1', content: 'content1',
  };
  // login by the sampleUser
  await axios.put(`${HOST}/blogs/${blog.id}`, newBlog, { headers: { authorization: userToken } }).then(() => {
  }).catch((error) => {
    expect(error.response.status).toBe(400);
  });
});

/**
 * test for delete blog by author
 */
test('can delete blog by author', async () => {
  // the author of the blog is the sampleUser
  const blog = await Blog.addBlog(sampleUser.username, 'title', 'tag', 'content');
  // login by the sampleUser
  await axios.delete(`${HOST}/blogs/${blog.id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.acknowledged).toBe(true);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for delete blog not by author
 */
test('cannot delete blog not by author', async () => {
  // the author of the blog is not the sampleUser
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  // login by the sampleUser
  await axios.delete(`${HOST}/blogs/${blog.id}`, { headers: { authorization: userToken } }).then(() => {
  }).catch((error) => {
    expect(error.response.status).toBe(400);
  });
});

/**
 * test for update blog likes
 */
test('can update blog likes', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  const body = { likes: 10 };
  await axios.put(`${HOST}/blogs/${blog.id}/likes`, body, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.likes).toBe(10);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for get comments by replyTo
 */
test('can get comments by replyTo', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  await Comment.addComment(blog.id, blog.id, 'author', 'comment');
  await axios.get(`${HOST}/blogs/comments/${blog.id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.data.data.length).toBe(1);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for post comment to a blog
 */
test('can post comment to a blog', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  const comment = { blogId: blog.id, replyTo: blog.id, content: 'comment' };
  await axios.post(`${HOST}/blogs/comments`, comment, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.comment).toBe(comment.comment);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for post reply to a comment
 */
test('can post reply to a comment', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  const comment = await Comment.addComment(blog.id, blog.id, 'author', 'comment');
  const reply = { blogId: blog.id, replyTo: comment.id, content: 'content' };
  await axios.post(`${HOST}/blogs/comments`, reply, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.content).toBe(reply.content);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

/**
 * test for delete comment by comment id
 */
test('can delete comment by comment id', async () => {
  const blog = await Blog.addBlog('author', 'title', 'tag', 'content');
  const comment = await Comment.addComment(blog.id, blog.id, 'author', 'comment');
  await axios.delete(`${HOST}/blogs/comments/${comment.id}`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
    expect(response.data.data.acknowledged).toBe(true);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can add emergency contact', async () => {
  const params = {
    username: 'test1',
    usernameOther: 'test2',
  };
  axios.post(`${HOST}/emergencyContact`, params, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get emergency contact', async () => {
  axios.get(`${HOST}/emergencyContact`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can get all emergency groups', async () => {
  axios.get(`${HOST}/emergencyOpenGroupChat`, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('can create new emergency group', async () => {
  axios.post(`${HOST}/emergencyGroupChat`, { username: 'test2' }, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('test can update user profile information by Admin', async () => {
  // create a sample user
  const newUser = await User.addUser('DWAYNE JOHNSON', '1234');
  const updatedUserProfile = {
    username: 'NICOLAS CAGE', password: '5678', role: config.USER_ROLE.COORDINATOR, active: false,
  };
  // get updated user profile
  await axios.put(`${HOST}/users/${newUser.username}`, updatedUserProfile, { headers: { authorization: userToken } }).then((response) => {
    expect(response.status).toBe(200);
  }).catch((error) => {
    expect(error).toBeUndefined();
  });
});

test('test for updating the username that already existed ', async () => {
  // create sample users
  const newUser = await User.addUser('DWAYNE JOHNSON', '1234');
  const user = await User.addUser('LEONARDO', '1234');
  const updatedUserProfile = {
    username: 'LEONARDO', password: '5678', role: config.USER_ROLE.COORDINATOR, active: false,
  };
  // expect error when desired updated username is already existed
  await axios.put(`${HOST}/users/${newUser.username}`, updatedUserProfile, { headers: { authorization: userToken } }).then(() => {
  }).catch((error) => {
    expect(error.response.status).toBe(400);
  });
});


test("test can return error when updating an admin user to a non-admin role if there is only one admin", async () => {
  // create sample users
  const newUser = await User.addUser('aaa', '1234');
  var updatedOwnProfile = {
    newUsername: "ANGELINA",
    password: "5668",
    active: true,
    role: config.USER_ROLE.ADMIN,
  };
  const updatedUserInfo = await User.updateInfo('aaa', updatedOwnProfile.newUsername, updatedOwnProfile.password, updatedOwnProfile.active, updatedOwnProfile.role);
  // update admin user to non-admin role
  updatedOwnProfile.role = config.USER_ROLE.COORDINATOR;
  // expect error when trying to update admin user to non-admin role
  await axios.put(`${HOST}/users/${newUser.username}`, updatedOwnProfile, { headers: { authorization: userToken } 
    }).catch((error) => {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toBe(
        "There must be at least one admin"
      );
    });
});


test('test updating user info successfully with inactive status & log the user out', async () => {
    // create sample users
    const newUser = await User.addUser('JESSICA', '1234');
    const updatedOwnInfo = {
      newUsername: "JESSICAaaa",
      password: "5668",
      active: false,
      role: config.USER_ROLE.COORDINATOR,
    };
    const updatedUserInfo = await User.updateInfo('JESSICA', updatedOwnInfo.newUsername, updatedOwnInfo.password, updatedOwnInfo.active, updatedOwnInfo.role);
  // make request to update user info
  await axios.put(`${HOST}/users/${newUser.username}`, updatedUserInfo, { headers: { authorization: userToken } })
    .then((response) => {
      expect(response.status).toBe(200);
    })
    .catch((error) => {
      expect(error.response.status).toBe(400);
    });
});

test('test for setting user active and inactive', async () => {
  // create a sample user
  const user = await User.addUser('John Doe', '1234');

  // set user active
  await axios.put(`${HOST}/users/${user.username}/active`, {}, { headers: { authorization: userToken } }).then((response) => {
    expect(response.data.success).toBe(true);
  }).catch((error) => {
    // console.log(error);
  });
  // verify user is active
  const updatedUser = await User.getOne(user.username);
  expect(updatedUser.active).toBe(true);
  // set user inactive
  await axios.put(`${HOST}/users/${user.username}/inactive`, {}, { headers: { authorization: userToken } }).then((response) => {
    expect(response.data.success).toBe(true);
  }).catch((error) => {
    
  });
  // verify user is inactive
  const updatedUserAgain = await User.getOne(user.username);
  expect(updatedUserAgain.active).toBe(false);
});