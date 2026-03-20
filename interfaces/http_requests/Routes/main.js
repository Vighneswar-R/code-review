const express = require('express');


const userDomain = require('../../../domain/index');

const {verify_token} = require('../../../infrastructure/JWT/services')


const routers = () => {
  const router = express.Router();
  router.use('/management', verify_token,require('./managementRoutes'));
  router.use('/generic', verify_token,require('./crudRoutes'));
  router.use('/user',userDomain.verify_mobile_user,verify_token, require('./userRoutes'))    //userDomain.verify_mobile_user,  verify_token
  router.use('/admin',verify_token,require('./adminRoutes'))    //userDomain.verify_mobile_user,  verify_token
  return router;
};

module.exports = routers;