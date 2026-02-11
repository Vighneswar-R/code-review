const express = require('express');

const router = express.Router();


const multer = require("multer");
const path = require("path");





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

// controll imports

const{uploadCaseData,getAllocationList,get_allocated_data_by_id,manualAllocate,ho_zcm_approval,get_allocation_dashboard,get_allocation_history} = require('./allocation')


const {get_co_list} = require('./user_management')


// routes set up **


router.post('/upload-case-data',upload.single("file"),uploadCaseData);

router.get('/allocation-get-list',getAllocationList);

// router.get('allocation-get-data/:type/:id',get_allocated_data_by_id);

router.get('/allocation-get-data/:type/:id',get_allocated_data_by_id);

router.post('/allocation-manual',manualAllocate);

router.post('/allocation-approve/:type/:id',ho_zcm_approval);

router.post('/allocation-get-data-dashboard',get_allocation_dashboard);

router.post('/get-co-list',get_co_list);

router.get('/get-allocation-history',get_allocation_history);


module.exports = router;