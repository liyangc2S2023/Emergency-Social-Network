class config {
  static JWT_KEY = 'secret';

  static USER_ROLE = { COORDINATOR: 'coordinator', USER: 'user', ADMIN:'admin'};

  static SPEED_TEST_WAIT_TIME = 1000;

  static statusMap = {
    undefined: 'circle outline purple icon',
    ok: 'circle green icon ',
    help: 'circle yellow icon',
    emergency: 'circle red icon',
  };
}

module.exports = config;
