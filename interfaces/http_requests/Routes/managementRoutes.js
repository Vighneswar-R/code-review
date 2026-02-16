const express = require('express');

const router = express.Router();

const allocationControllers = require('../Controllers/allocationControllers')

const managementControllers = require('../Controllers/managementControllers');


const legalControllers = require('../Controllers/legalControllers')

const multer = require("multer");
const path = require("path");


const {verify_token} = require('../../../infrastructure/JWT/services')


// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in /uploads
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname)); // keep extension
  },
});

const upload = multer({ storage: storage });

router.post('/upload-case-data',upload.single("file"),allocationControllers.upload_case_data);

router.get('/allocation-get-list',allocationControllers.get_allocation_list);

router.post('/allocation-approve/:type/:id',allocationControllers.allocation_approval);

router.post('/add-allocation-rule',allocationControllers.add_rule);

router.get('/reassign-list',allocationControllers.get_reassign_list);

router.get('/get-soa-case/:id',allocationControllers.get_soa_case_details);

router.get('/allocation-get-history',allocationControllers.get_allocation_history);

router.get('/allocation-mapped-co',allocationControllers.get_mapped_co_list);

router.get('/get-soa-details/:id',allocationControllers.get_soa_details);

router.get('/get-soa-case-details',allocationControllers.get_soa_case_details);

router.post('/pending-allocation',allocationControllers.upload_pending_allocation);

router.post('/manual-allocate',allocationControllers.add_manual_allocate);

router.get('/allocation-get-data/:id',allocationControllers.get_allocation_data);

router.patch('/allocation-rule-update/:id',allocationControllers.edit_rule);

router.patch('/approve-reassignment-request',allocationControllers.approve_reassign_request);

router.post('/login',managementControllers.log_in);

router.post('/login-otp-verify',managementControllers.otp_verify);

router.post('/login-out',verify_token,managementControllers.log_out);   // middleware attached for logout


router.post('/reports',managementControllers.getReports)



// legal related routes **


router.post('/legal/add-master',legalControllers.add_master);      // add legal master options to be available

router.get('/legal/get-case-list',legalControllers.get_case_list);

router.get('/legal/dashboard',legalControllers.get_dashboard_data)      // add legal master options to be available

router.get('/dashboard-main',managementControllers.dashboard_data);  //1

router.get('/branch-report/:id',managementControllers.branchReport);  //2

router.get('/state-report/:id',managementControllers.stateReport);  //3






module.exports = router;