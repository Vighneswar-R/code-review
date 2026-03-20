const express = require('express');


const userDomain = require('../../../domain/index');

const {verify_token} = require('../../../infrastructure/JWT/services')

const {otpLimiter,globalLimiter} = require("../../../interfaces/middlewares/rateLimiter");



const routers = () => {
  const router = express.Router();
  router.use('/management', (req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  }
  ,verify_token,require('./managementRoutes'));


  router.use('/generic', globalLimiter ,verify_token,require('./crudRoutes'));


  
  router.use(
  "/user",
  (req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  },
  userDomain.verify_mobile_user,verify_token,
  require("./userRoutes")
);  //userDomain.verify_mobile_user,  verify_token
  router.use('/admin',(req, res, next) => {

    if (req.path === "/login") {
      return otpLimiter(req, res, next);
    }

    return globalLimiter(req, res, next);
  },verify_token,require('./adminRoutes'))    //userDomain.verify_mobile_user,  verify_token
  return router;
};

module.exports = routers;