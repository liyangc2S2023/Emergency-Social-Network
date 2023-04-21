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

  // status: pending, accepted, rejected, canceled
  static exchangeStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
  };

  static S3 = {
    accessKeyId: 'AKIA2USN5UESPKU35PDH',
    secretAccessKey: '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',
    region: 'us-east-2',
    bucketName: 'fse-snowboard-image',
  };

  static DEFAULT_BLOG_IMAGE = 'https://fse-snowboard-image.s3.us-east-2.amazonaws.com/default.jpeg';

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
