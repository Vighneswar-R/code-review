const express = require('express');


const userDomain = require('../../../domain/index');

const {verify_token} = require('../../../infrastructure/JWT/services')

const {otpLimiter,globalLimiter} = require("../../../interfaces/middlewares/rateLimiter");



const routers = () => {
  const router = express.Router();
  router.use('/management', verify_token,(req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  }
  ,require('./managementRoutes'));


  router.use('/generic', verify_token,globalLimiter,require('./crudRoutes'));


  
  router.use(
  "/user",verify_token,
  (req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  },
  userDomain.verify_mobile_user,
  require("./userRoutes")
);  //userDomain.verify_mobile_user,  verify_token
  router.use('/admin',verify_token,(req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  },require('./adminRoutes'))    //userDomain.verify_mobile_user,  verify_token
  return router;
};

module.exports = routers;