class config {
  static JWT_KEY = 'secret';

  static USER_ROLE = { COORDINATOR: 'coordinator', USER: 'user', ADMIN: 'admin' };

  static USER_STATUS = {
    UNDEFINED: 'undefined',
    OK: 'ok',
    HELP: 'help',
    EMERGENCY: 'emergency',
  };

  static SPEED_TEST_WAIT_TIME = 1000;

  static statusMap = {
    undefined: 'circle outline purple icon',
    ok: 'circle green icon ',
    help: 'circle yellow icon',
    emergency: 'circle red icon',
  };

  static EMERGENCY_TYPE = {
    REQUEST: 'request',
    RESPONSE: 'response',
  };

  static EMERGENCY_CITIZEN_STATUS = {
    OFFERING: 'offering',
    REQUESTING: 'requesting',
    NONE: 'none',
  };
}

module.exports = config;
