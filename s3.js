// const AWS = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');
const config = require('./config');

const s3 = new AWS.S3({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
  region: config.S3.region,
});

module.exports = s3;
