const {generateQR,generate_payment_link,verify_payment_QR,force_expire,verify_payment_link,addCashRequest,verifyCashOtp,update_cash_payment} = require('./soaPaymentCases')
const main = {
generateQR:generateQR,
generate_payment_link:generate_payment_link,
verify_payment_QR:verify_payment_QR,
force_expire:force_expire,
verify_payment_link:verify_payment_link,
addCashRequest:addCashRequest,
verifyCashOtp:verifyCashOtp,
update_cash_payment:update_cash_payment
}



module.exports = main;