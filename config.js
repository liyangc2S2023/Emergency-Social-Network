class config {
  static JWT_KEY = 'secret';

  static USER_ROLE = { ADMIN: 'admin', USER: 'user' };

  static SPEED_TEST_WAIT_TIME = 500;

  static POST_REQUEST_LIMIT = 1000;

  static POST_TEST_PERCENTAGE = 0.9;

  static GET_TEST_PERCENTAGE = 0.1;
}

module.exports = config;
