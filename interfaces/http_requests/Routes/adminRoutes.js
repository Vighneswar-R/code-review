const express = require('express');

const router = express.Router();

// const adminControllers = require('./allocationControllers')
const masteradminControllers = require('../Controllers/masteradminControllers')


const multer = require("multer");
const path = require("path");


const allowed_values = process.env?.ALLOWED_MIME_TYPE || "";

const allowedMimeTypes = allowed_values?.split(',').map(type => type.trim());

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};


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

const upload = multer({ storage: storage,fileFilter });
router.post('/add-branch-master',  masteradminControllers.add_branch_master);
router.post('/update-branch-master/:id',  masteradminControllers.update_branch_master),
router.get('/get-zone-master', masteradminControllers.get_zone_master);
router.get('/get-region-master', masteradminControllers.get_region_master);
router.get('/get-branch-master', masteradminControllers.get_branch_master);
router.post('/add-version-master', masteradminControllers.add_version_master);
router.post('/update-version-master/:id', masteradminControllers.update_version_master);
router.get('/get-version-master', masteradminControllers.get_version_master);
router.post('/add-bank-master', masteradminControllers.add_bank_master);
router.get('/get-bank-master', masteradminControllers.get_bank_master);  
router.post('/update-bank-master/:id', masteradminControllers.update_bank_master);
router.post('/add-bank-branch-master', masteradminControllers.add_bank_branch_master);
router.get('/get-bank-branch-master', masteradminControllers.get_bank_branch_master);
router.post('/follow-up-type-master', masteradminControllers.add_followup_type_master);
router.get('/get-follow-up-type-master', masteradminControllers.get_followup_type_master);
router.post('/update-follow-up-type-master/:id', masteradminControllers.update_followup_type_master);
router.post('/add-exotel-master', masteradminControllers.add_exotel_master);
router.get('/get-exotel-master', masteradminControllers.get_exotel_master);
router.post('/update-exotel-master/:id', masteradminControllers.update_exotel_master);
router.post('/add-permission-master', masteradminControllers.add_permission_master);
router.get('/get-permission-master', masteradminControllers.get_permission_master);
router.post('/update-permission-master/:id', masteradminControllers.update_permission_master);
router.post('/update-bank-branch-master/:id', masteradminControllers.update_bank_branch_master);
router.post('/add-case-type-master', masteradminControllers.add_case_type_master);
router.get('/get-case-type-master', masteradminControllers.get_case_type_master);
router.post('/update-case-type-master/:id', masteradminControllers.update_case_type_master);
router.get('/get-requisites', masteradminControllers.get_requisites);
router.post('/create-user',masteradminControllers.create_user);
router.get('/get-roles-and-users-permissions', masteradminControllers.get_roles_and_users_permissions);

router.patch('/edit-user',masteradminControllers.update_user);


router.get('/get-user/:id',masteradminControllers.get_user_data)
router.post('/create-department',masteradminControllers.create_department)
router.get('/get-department',masteradminControllers.get_department)

router.get('/get-user-list',masteradminControllers.getUserList);

router.post('/upload-user',upload.single("file"),masteradminControllers.bulk_upload_user);


router.post('/create-role',masteradminControllers.createRoles);

router.get('/permission-list',masteradminControllers.getPermissionsList);

router.post('/edit-role/:id',masteradminControllers.edit_existing_role);

router.post('/update-status',masteradminControllers.udpateStatus);



router.get('/get-generic-key', masteradminControllers.get_generic_key);


router.get('/get-state-master', masteradminControllers.get_generic_key);

router.post('/bulkbranch-mapping-upload', upload.single("file"), masteradminControllers.branchMappingUpload);

module.exports = router;