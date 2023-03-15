class config {
  static JWT_KEY = 'secret';

  static USER_ROLE = { ADMIN: 'admin', USER: 'user' };

  static SPEED_TEST_WAIT_TIME = 500;

  static POST_REQUEST_LIMIT = 1000;

  static POST_TEST_PERCENTAGE = 0.5;

  static GET_TEST_PERCENTAGE = 0.5;

  static statusMap = {
    undefined: 'circle outline grey icon',
    ok: 'circle green icon ',
    help: 'circle yellow icon',
    emergency: 'circle red icon',
  };
}

module.exports = config;
