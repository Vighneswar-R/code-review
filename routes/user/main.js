const express = require("express");

const router = express.Router();


const {admin_login,verify_admin_login_otp} = require('./login_route')
// routes 


router.post('/login-admin/:username',admin_login);
router.post('/login-admin-otp-verify/:username',verify_admin_login_otp)

module.exports = router