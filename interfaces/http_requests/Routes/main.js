const express = require('express');


const userDomain = require('../../../domain/index');

const {verify_token} = require('../../../infrastructure/JWT/services')


const routers = () => {
  const router = express.Router();
  router.use('/management', verify_token,require('./managementRoutes'));
  router.use('/generic', require('./crudRoutes'));
  router.use('/user',verify_token, require('./userRoutes'))    //userDomain.verify_mobile_user,  verify_token
  router.use('/admin',require('./adminRoutes'))    //userDomain.verify_mobile_user,  verify_token
  return router;
};

module.exports = routers;