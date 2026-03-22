const express = require('express');

const router = express.Router();

const userControllers = require('../Controllers/userControllers');

const userSoaControllers = require('../Controllers/userSoaControllers')

const paymentControllers = require('../Controllers/paymentControllers')

const userDomain = require('../../../domain/index');


const allowed_values = process.env?.ALLOWED_MIME_TYPE || "";

const allowedMimeTypes = allowed_values?.split(',').map(type => type.trim());

const multer = require("multer");


const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};



const storage   = multer.memoryStorage(); // Store the file in memory
const upload    = multer({ storage: storage,fileFilter });


const {verify_ms_token} = require('../../../interfaces/middlewares/auth');

const {otpLimiter} = require("../../../interfaces/middlewares/rateLimiter");


// *** I collect app login for CO **//

//verify_ms_token

router.post('/login',userControllers.log_in);

router.post('/login-otp-verify',userControllers.login_otp_verify);

router.post('/hourly-punch',userControllers.hourly_punch_in);

router.post('/mark-attendance',userControllers.mark_attendance);


router.post('/soa/case-reassign',userSoaControllers.case_reassign);

router.get('/soa/get-case-list',userSoaControllers.dashboard_cases);

router.get('/soa/get-soa-case-data/:loan',userSoaControllers.get_soa_case);


router.get('/soa/get-nearby-loans',userSoaControllers.get_nearby_loans);

router.post('/create/:model',userControllers.add_data);

// router.post('/get/:model',userControllers.add_data);


router.patch('/edit/:model/:id',userControllers.edit_data_by_id);

router.patch('/soa/edit/SoaApplicantDetail/:id',userSoaControllers.updateSoaApplicant);


router.post('/soa/payment-qr/:loan_number/:type',paymentControllers.generateQrCode);

router.post('/soa/update-cash-receipt',paymentControllers.update_cash_payment_status);


router.post('/soa/payment-link/:loan_number/:type',paymentControllers.generatePaymentLink);

router.get('/soa/payment-verify/qr/:loan_number',paymentControllers.verifyQrPayment);

router.get('/soa/payment-verify/link/:loan_number',paymentControllers.verify_payment_link);


router.post('/soa/change-payment-mode',paymentControllers.changePaymentMode);

router.post('/sso-login',userControllers.user_sso_login);

router.get('/get-punch-timeline/:id',userControllers.get_punch_timeline);

router.get('/follow-up-details',userSoaControllers.get_follow_up_data);

router.get('/get-efficiency',userControllers.get_efficiency);

router.get('/get-legal-case-list',userSoaControllers.get_legal_case_list);

router.get('/get-legal-case-data/:id',userSoaControllers.get_legal_case_data);

router.post('/update-legal-case/:id',upload.array('file'),userSoaControllers.update_legal_case);

router.get('/get-follow-up-history/:loan_number',userSoaControllers.get_follow_up_history);

router.get('/get-transaction-history/:loan_number',userSoaControllers.get_transaction_history);

router.get('/get-team-members',userSoaControllers.get_team_member_list);

router.get('/search-loan',userSoaControllers.advance_search_loans);

router.post('/reassign-request',userSoaControllers.reassign_request);

router.get('/payments-done',userSoaControllers.get_payments_done);

router.post('/schedule-message',userSoaControllers.createScheduler);

router.get('/get-schedule-options',userSoaControllers.GetScheduleOptions);

router.post('/send-cash-otp',paymentControllers.send_cash_otp);


router.post('/verify-cash-otp',paymentControllers.verify_cash_otp);


router.get('/get-search-master',userControllers.getSearchMaster);

router.post('/filter-cases',userControllers.search_by_filters);



router.get('/get-all-search-master',userControllers.getAllSearchMaster);
router.post('/create-search-master',userControllers.createSearchMaster);
router.patch('/update-search-master/:id',userControllers.updateSearchMaster);
router.delete('/delete-search-master/:id',userControllers.deleteSearchMaster);
 
router.post('/create-follow-up',upload.array("file", 5),userControllers.create_follow_up);


router.get('/get-doc/:file_path/:path',userControllers.fetch_doc_from_s3);

router.get('/sf-cash-collection-list',userControllers.getSfCollectionList_cash);

router.get('/soa/get-dasboard-data', userSoaControllers.get_dashboard_data);


module.exports = router;
