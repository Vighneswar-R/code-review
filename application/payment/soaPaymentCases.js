


 const generateInvoiceNumberEaseBuzz = (invoice) => {
        const now = new Date();
    
        // Extract date and time components
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        // Timestamp in the format ddmmyyyyhhmmss
        const timestamp = `${day}${month}${year}${hours}${minutes}${seconds}`;
    
        // Generate 4 random alphanumeric characters
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
    
        // Combine with a prefix

        if(invoice == true) {
            return `order${timestamp}${randomString}`;
        }

        return `UTA${timestamp}${randomString}`;
    }

const get_month_sequence = () => {      // helper function
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() returns 0–11
  console.log(month);
  return month;
};


const get_year_string = () => {     // helper function
  const today = new Date();
  const year = today.getFullYear().toString();
  console.log(year);
  return year;
};


function getMonthNumber(monthName) {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  const index = months.findIndex(
    m => m.startsWith(monthName.toLowerCase())
  );

  return index !== -1 ? index + 1 : null; // returns null if invalid month
}

function safeJson(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return '[Circular]';
      cache.add(value);
    }
    if (typeof value === 'function') return '[Function]';
    return value;
  });
}


const SMS_API_KEY           =   process.env.SMS_API_KEY;
const SMS_API_TOKEN         =   process.env.SMS_API_TOKEN;
const SMS_SID               =   process.env.SMS_SID;
const SMS_FROM              =   process.env.SMS_FROM;
const SMS_DltEntityId       =   process.env.SMS_DltEntityId;
const SMS_SmsType           =   process.env.SMS_SmsType;

   const sendPaymentLink = (mobile_number, link, amount) => {

        console.log("EXECUTED SMS");


        return new Promise(function(res){

            // Create an Axios instance with custom interceptors for logging
            const axiosInstance = axios.create();

            // SMS Request interceptor
            // axiosInstance.interceptors.request.use(async (config) => {
            //     try{
            //         const data = {
            //             timestamp       : new Date(),
            //             endpoint        : config.url,
            //             method          : config.method,
                        
            //             dump            : config.data,
            //         }
            //         const APILog = await prisma.SMSAPIRequestLog.create({
            //             data: data
            //         })
            //         config.log = APILog;
            //         return await config;
            //     }catch(error){
            //         console.log('Error occured in logging outgoing request to SMS Payment Link: ', error);
            //         return Promise.reject(error);
            //     }
            // });

            // // SMS Response interceptor
            // axiosInstance.interceptors.response.use(async (response) => {
            //     try{
                
            //         const data = { 
            //             timestamp               :   new Date(),
            //             endpoint                :   response.config.url,
            //             method                  :   response.config.method,
                        
            //             dump            :   response.data,
            //             requestLogId    :   Number(response.config.log.id)
            //         }
            //         await prisma.SMSAPIResponseLog.create({ 
            //             data: data
            //         });

            //         return await response;
            //     }catch(error){
            //         console.log('Error occured in logging incoming response from SMS Payment Link: ', error);
            //         return Promise.reject(error);
            //     }
            // })

            let body      = `Dear Customer,\nPlease use the link below to process payment of amount Rs. ${amount} .\n${link} \nThank you,\nIndia Shelter Finance Corporation`

            // var dataString  = `From=${SMS_FROM}&To=${mobile_number}&Body=${encodeURIComponent(body).replace(/%2C/g, ',').replace(/%2F/g, '/').replace(/%3A/g, ':')}&DltEntityId=${SMS_DltEntityId}&DltTemplateId=1007169466871015729&SmsType=${SMS_SmsType}`;

            
            // var dataString  = `From=${SMS_FROM}&To=${mobile_number}&Body=${encodeURIComponent(body)}&DltEntityId=${SMS_DltEntityId}&DltTemplateId=1007169466871015729&SmsType=${SMS_SmsType}`;

            
                        var dataString  = `From=${SMS_FROM}&To=${mobile_number}&Body=${body}&DltEntityId=${SMS_DltEntityId}&DltTemplateId=1007169466871015729&SmsType=${SMS_SmsType}`;
            console.log("body: ",dataString)
            console.log("datastring: ",`https://${SMS_API_KEY}:${SMS_API_TOKEN}@api.exotel.com/v1/Accounts/${SMS_SID}/Sms/send?${dataString}`)
    
            // Trigger SMS
            axiosInstance
            .post(`https://${SMS_API_KEY}:${SMS_API_TOKEN}@api.exotel.com/v1/Accounts/${SMS_SID}/Sms/send?${dataString}`,{})
            .then((response) => {
                res(response)
            })
            .catch((error) => {
                console.log('***** ERROR in Payment Link SMS *****')
                console.log(error)
                console.log('***************************')
                throw error;
            });
            
        })
    }

// function hasHoursPassed(createdAt, hours = 8) {
//   const created = new Date(createdAt); // parse date
//   const now = new Date();

//   const diffMs = now.getTime() - created.getTime(); // milliseconds diff
//   const diffHours = diffMs / (1000 * 60 * 60); // convert to hours

//   return diffHours >= hours;
// }

function hasHoursPassed(createdAt, hours = 8) {
  // MySQL timestamps are UTC — interpret them correctly

    console.log("CREATED",createdAt)

  const created = new Date(createdAt + "Z"); // force UTC
  const now = new Date();

  // Difference in milliseconds
  const diffMs = now.getTime() - created.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= hours;
}



const paymentQueries = require('../../infrastructure/DB/paymentQueries');

const userQueries = require('../../infrastructure/DB/userQueries')

const crypto = require('crypto');

const axios = require('axios');

const zlib = require('zlib');



const check_status = async(orderId,id,loan_number,mobile,amount) =>{

        try{

        const order_id = orderId
            const WIRE_API_KEY = process.env.WIRE_API_KEY;//"AKIAYG5WVKTVUTWPKVLD";
            const salt = process.env.EASEBUZZ_SALT//"B324E7950C"
            const key = process.env.EASEBUZZ_KEY//"7AB6A77B03"

            const hashSequence = `${key}|${order_id}|${salt}`;

            const hash = crypto.createHash('sha512').update(hashSequence).digest('hex');
            const authorization_string = hash;


            const axiosInstance = axios.create();


            axiosInstance.interceptors.request.use(async (config) => {
                try {
                   
                        timestamp = new Date(),
                        endpoint =  config.url,
                        method =  config.method,
                        dump = JSON.stringify(config.data || {})
                        
                    
    
                     const APILog = await paymentQueries.updateLog('PaymentRequestLog',{timestamp: new Date(),
                        endpoint: config.url,
                        method: config.method,
                        dump :JSON.stringify(config.data || {})})
                    config.log = APILog;
                    return config;
                } catch (error) {
                    console.log('Error occurred in logging outgoing request to Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });

            let log_id;
    
            axiosInstance.interceptors.response.use(async (response) => {
                try {
                    const data = {
                        timestamp: new Date(),
                        endpoint: response.config.url,
                        method: response.config.method,
                        dump: JSON.stringify(response.data),
                        requestLogId: Number(response.config.log.id)
                    };
                    // let log_created = await prisma.PaymentResponseLog.create({
                    //     data: data
                    // });

                     const log_created = await paymentQueries.updateLog('PaymentResponseLog',data)
                    log_id = log_created?.id
    
                    return response;
                } catch (error) {
                    console.log('Error occurred in logging incoming response from Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });


                const response = await axiosInstance.get(`${process.env.PROCESS_EASEBUZZ_QR}/${order_id}/?key=${process.env.EASEBUZZ_KEY}`, {
                headers: {
                    'Authorization':authorization_string,
                    'WIRE-API-KEY':WIRE_API_KEY
                }
            });


            console.log("Type:", typeof JSON.stringify(response.data));
console.log("Instance of Buffer:", Buffer.from(JSON.stringify(response.data)) instanceof Buffer);
console.log("Preview:", Buffer.from(JSON.stringify(response.data)));


            console.log("HEY RESPONSE",response.data.data);

                        console.log("HEY RESPONSE1",response.data.data?.transaction_order?.transactions)


            const payment_verified = response.data.data;



            console.log("TRANS ID",payment_verified?.transaction_order?.transactions?.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.id)



            const response_data = {
                        gateway_verify_transaction_id           :   payment_verified?.transaction_order?.transactions?.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.virtual_account?.id,
                        gateway_verify_billed_amount                      :   payment_verified?.transaction_order?.transactions.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.amount.toString(),
                        gateway_secure_hash:payment_verified?.transaction_order?.transactions?.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.unique_transaction_reference,
                        // gateway_verify_email:  payment_verified?.transaction_order?.customer_email,
                        gateway_verify_customer_phone              :  payment_verified?.transaction_order?.customer_phone,
                        gateway_verify_transaction_time            :   payment_verified?.transaction_order?.transactions.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.transaction_date,
                        gateway_verify_transaction_payment_status  :   payment_verified?.transaction_order?.transactions.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.status,
                        payment_date:payment_verified?.transaction_order?.transactions.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.transaction_date?new Date(payment_verified?.transaction_order?.transactions.filter((t)=>t.status == 'unsettled' || t.status == 'settled')?.[0]?.transaction_date):null,
                        status: payment_verified?.transaction_order?.status == 'completed'? 'completed' :null,
                        expired:true
                        // method: 'Online'
            }
            // update payment collect table**

            // const updated = await userQueries.updateTable('paymentCollect',id,response_data);

              let payload = {};
            if(payment_verified?.transaction_order?.status == 'completed'){
const dateOfCollection = new Date().toISOString().split("T")[0];
    payload  =   {
  "dateOfCollection": dateOfCollection,
  "loanNumber": loan_number,
  "employeecode": "ISFC0014",
  "instrument": "Electronic Payment",
  "deposit_channel": "Customer App",
  "clearanceStatus": "Handover Pending",
  "Source": "Customer App",
  "Status": "Active",
  "mobileNoReceipt": response_data?.gateway_verify_customer_phone,
  "bankname": "",
  "Mode": "Collections",
  "collector_type": "Self",
  "presentation_no": "1",
  "currentVersion": "2.5.30",
  "challan_no": "",
  "Chargedetails": [
    {
      "natureofCollection": "Emi/Advances/Part Payment",
      "amount": Number(response_data?.gateway_verify_billed_amount) || 0,
      "pancardImage": "",
      "uploadReceiptNum": "",
      "narration": ""
    },
  ]
};
            }

                        const updated = await paymentQueries.updatePaymentAndGetReciept(id,response_data,payload,payment_verified?.transaction_order?.status == 'completed'? true : false,"Digital");


            //update EMI mapping total_payment as well;

            console.log("UPDATED",updated)

                return {
                completed: payment_verified?.transaction_order?.status == 'completed'? true : false,//transactionData.TRANSACTIONSTATUS[0] == '200',
                data: updated,
                result:payment_verified,
                // airpay_response_json:airpay_response_json
            };

        }

        catch(err){

            console.log(err)

            return {
                error:true,
                data:null,
                result:null
            }


        }


    }


    const generateQR = async (loan_number,type,amount) => {


        // check for the latest QR generated status if expired**

        const case_data = await userQueries.getCaseData(loan_number);

        if(!case_data) throw new Error("Invalid Loan Number!")


        const existing_QR = await paymentQueries.getExistingQR(loan_number);

        if(existing_QR){
            
            console.log("EXIS")

           // additionally check the previous existing QR type as current request type

            const existing_type = existing_QR.payment_type

                // ** additionally check if pending due on account is 0 if yes no QR to be generated;

                console.log("Case",case_data)

            const pending_due = case_data.SoaEmiMapping?.[0]?.due_for_month;

            // if(pending_due == 0 || !pending_due || case_data.SoaEmiMapping.total_payment == pending_due) return {message:"Payment Upto Date",result:existing_QR};

            const is_expired = hasHoursPassed(existing_QR.created_at) || existing_QR.expired

            console.log("IS EXI",existing_QR);

                        console.log("IS EXI",hasHoursPassed(existing_QR.created_at));

            // ** check if last payment is completed if yes check if payment updated_date is more than 24 hours && if pending due is same as existing due  ** compare amount logic

            const LIMIT_HOURS = Number(process.env.LIMIT_HOURS || 24);

           let limit_passed; 
  const updatedTime = new Date(existing_QR.updated_at);
  const now = new Date();

  const diffHours = (now - updatedTime) / (1000 * 60 * 60);

  if (diffHours >= LIMIT_HOURS) {
    console.log("Limit is passed");

    limit_passed = true;
  } else {
    limit_passed = false;

    console.log("Within Limit Time");
  }

  console.log("DUE FOR THE MONTH",pending_due)

  if(!limit_passed && existing_QR.status == 'completed' && existing_QR.amount == pending_due){

    return{message:"Payment Successful - Under Process",result:existing_QR}
  }


    if(!is_expired && (existing_type == type)) return{message:"Success",result: existing_QR.qr_code, is_new:false}

}


        const selected_bcp = await userQueries.findExistingBCP("data");

        console.log("BCP S",selected_bcp)
        let amt;
        let buyerPhone;
        let buyerEmail;
        let buyerName;
        let emi_for_month;

        let soa_case;
        
        let case_id;

        switch(selected_bcp.type_id){
            case(0):
            soa_case = await paymentQueries.getSoaMapping(loan_number);

            console.log("EXEC 0")
            amt =  Number(amount)//Number(soa_case?.SoaEmiMapping?.[0]?.due_for_month)

            console.log("DUE",soa_case?.SoaEmiMapping?.[0]?.due_for_month)

            buyerPhone =  soa_case?.SoaApplicantDetail?.[0]?.mobile_number;

            buyerEmail = soa_case?.SoaApplicantDetail?.[0]?.email || "test@test.com";

            buyerName = soa_case?.SoaApplicantDetail?.[0]?.first_name || "applicant";

            emi_for_month = soa_case?.SoaEmiMapping?.[0]?.emi_for_month || 0

            case_id = soa_case.id;

            break;

            case(1):
            console.log("EXEC 1")

            soa_case = await userQueries.getOldSoaCaseData(loan_number);

            amt = Number(amount)//Number(soa_case.due_for_month)

            buyerPhone =  soa_case.PRIMARY_PHONE_APP;

            buyerEmail = soa_case.EMAIL_ID || "test@test.com";

            buyerName = soa_case.CUST_NAME || "applicant";

            emi_for_month = soa_case.emi_for_month;


            // try fetch the case id if available for better tracking **

            try{

             const case_2 = await paymentQueries.getSoaMapping(loan_number);
             
             case_id = case_2.id || null;

            }

            catch(err){

                console.log("Error Fetching Case From SoaCaseMapping **",err)

            }
        }


        if(!soa_case) throw new Error("No Case Data Found!");


        // check if partial or full payment;

        if(type == 'partial') amt = Number(amount)

        //generate QR CODE   ** new 0
        const unique_request_number = generateInvoiceNumberEaseBuzz();  //working here **00
        
        const udf1 = unique_request_number??""; // Default to an empty string if not provided  //unique_request_number??
        const udf2 = loan_number || ""; //lead_id?.toString() || ""
        const udf3 = ""; 
        const udf4 = ""; 
        const udf5 = ""; 
        
        const salt = process.env.EASEBUZZ_SALT//"B324E7950C";
        const key =  process.env.EASEBUZZ_KEY //"7AB6A77B03";
        
        const hashSequence = `${key}|${unique_request_number}|${amt}|${amt}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${salt}`;

        console.log("HAS SEQ",hashSequence)
        const hash = crypto.createHash('sha512').update(hashSequence).digest('hex');
        const authorization_string = hash;


        console.log("REQ NUMBER",unique_request_number)

//         const today = new Date();
// const year = today.getFullYear();
// const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
// const day = String(today.getDate()).padStart(2, '0');

// const expiryDate = `${year}-${month}-${day} 23:59:59`;


const today = new Date();
today.setHours(23, 59, 59, 0);

const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const hours = String(today.getHours()).padStart(2, '0');
const minutes = String(today.getMinutes()).padStart(2, '0');
const seconds = String(today.getSeconds()).padStart(2, '0');

const expiryDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


        
        const request_body = {
            key: key,
            unique_request_number: unique_request_number,
            amount: Number(amt),
            per_transaction_amount: Number(amt),
            customer_name: buyerName,
            customer_phone:buyerPhone || "7208660193",
            notify_customer_on_create: false,
            // notification_cycle_type: "daily",
            allowed_collection_modes: ["bank_account", "upi"],
            expiry_date:expiryDate,  // Ensure this format is acceptable by the API
            udf1: udf1,
            udf2: udf2,
            udf3: udf3,
            udf4: udf4,
            udf5: udf5,
            customer_email: buyerEmail || ""
        };
        
        console.log("REQ BODY", request_body);


        let response;
        
        try {
            const axiosInstance = axios.create();

        //     axiosInstance.interceptors.request.use(async (config) => {
        //         try {
                   
        //                 timestamp = new Date(),
        //                 endpoint =  config.url,
        //                 method =  config.method,
        //                 dump = JSON.stringify(config.data || {})
                        
                    
    
        //              const APILog = await paymentQueries.updateLog('PaymentRequestLog',{timestamp: new Date(),
        //                 endpoint: config.url,
        //                 method: config.method,
        //                 dump :JSON.stringify(config.data || {})})
        //             config.log = APILog;
        //             return config;
        //         } catch (error) {
        //             console.log('Error occurred in logging outgoing request to Airpay Verification API: ', error);
        //             return Promise.reject(error);
        //         }
        //     });

        //     let log_id;
    
        //     axiosInstance.interceptors.response.use(async (response) => {
        //         try {
        //             const data = {
        //                 timestamp: new Date(),
        //                 endpoint: response.config.url,
        //                 method: response.config.method,
        //                 dump: JSON.stringify(response.data),
        //                 requestLogId: Number(response.config.log.id)
        //             };
        //             // let log_created = await prisma.PaymentResponseLog.create({
        //             //     data: data
        //             // });

        //              const log_created = await paymentQueries.updateLog('PaymentResponseLog',data)
        //             log_id = log_created?.id
    
        //             return response;
        //         } catch (error) {
        //             console.log('Error occurred in logging incoming response from Airpay Verification API: ', error);
        //             return Promise.reject(error);
        //         }
        //     });

          response = await axiosInstance.post(
               process.env.EASEBUZZ_QR_URL,
                request_body, // Send request_body directly as the payload
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorization_string,  // If you need 'Bearer', add 'Bearer ' before the hash
                        'WIRE-API-KEY':  process.env.WIRE_API_KEY//"AKIAYG5WVKTVUTWPKVLD"  // Ensure this key is correct
                    }
                }
            );
            console.log("easebuzzrequest",request_body); // Log response from the API

                        console.log("Authorization",authorization_string); // Log response from the API

        } catch (error) {
            console.error("Error while sending request:", error,error.response?.data || error.message);
            
            throw new Error("Could Not Generate QR Code! Please Try Again")
        }

    
           // const encryptedData = response.data.data

            const encryptedData   = response?.data?.data?.transaction_order?.virtual_account?.upi_qrcode_url


            console.log("QR CODE",encryptedData)


            console.log("RESP ORDER",response.data.data)

const now = new Date();

// Add 8 hours ** for expiry
const eightHoursLater = new Date(now.getTime() + 8 * 60 * 60 * 1000);

            const created_entry = await paymentQueries.createEntry({     // create invoice fresh
                    invoice_number: response.data.data.transaction_order.id,
                    loan_number:loan_number,
                    amount:String(amt),
                    qr_code : encryptedData,
                    mobile_number   : buyerPhone,
                    gateway_name:'Easebuzz',
                    emi_for_month:emi_for_month,
                    payment_mode:'Digital',
                    payment_type:type,
                    month:get_month_sequence(),
                    year:get_year_string(),
                    case_id:Number(case_id),
                    qr_expiry_time:eightHoursLater,
                    merchant_request_number:unique_request_number || ""
    //                  SoaCaseMapping: {
    //   connect: { id: Number(case_id) },
    // },
                })


          return{message:"Success",result: encryptedData,is_new:true}

       

    }


    const generate_payment_link = async (loan_number,type,amount,mobile) => {      // WORKING HERE (***()())

        try{

              // check for the latest QR generated status if expired**


                      const case_data = await userQueries.getCaseData(loan_number);

        if(!case_data) throw new Error("Invalid Loan Number!")

        const existing_link = await paymentQueries.getExistingQR(loan_number);

        if(existing_link){

           // additionally check the previous existing QR type as current request type

            const existing_type = existing_link.payment_type;

            const pending_due = case_data.SoaEmiMapping?.[0]?.due_for_month;



            const is_expired = hasHoursPassed(existing_link.created_at) || existing_link.expired

                      const LIMIT_HOURS = Number(process.env.LIMIT_HOURS || 24);

           let limit_passed; 
  const updatedTime = new Date(existing_link.updated_at);
  const now = new Date();

  const diffHours = (now - updatedTime) / (1000 * 60 * 60);

  if (diffHours >= LIMIT_HOURS) {
    console.log("Limit is passed");

    limit_passed = true;
  } else {
    limit_passed = false;

    console.log("Within Limit Time");
  }

  if(!limit_passed && existing_link.status == 'completed' && existing_link.amount == pending_due){

    return{message:"Payment Successful - Under Process",result:existing_link}
  }

            if(!is_expired && (existing_type == type)) return{message:"Success",result: existing_link.payment_link, is_new:false}

        }
            const selected_bcp = await userQueries.findExistingBCP("data");

        console.log("BCP S",selected_bcp)
        let amt;
        let buyerPhone;
        let buyerEmail;
        let buyerName;
        let emi_for_month;

        let soa_case;
        
        let case_id;

        switch(selected_bcp.type_id){
            case(0):
            soa_case = await paymentQueries.getSoaMapping(loan_number);

            console.log("EXEC 0")
            amt = amount;//soa_case.SoaEmiMapping?.[0]?.due_for_month;

            buyerPhone =  soa_case?.SoaApplicantDetail?.[0]?.mobile_number || "7208660193"

            buyerEmail = soa_case?.SoaApplicantDetail?.[0]?.email || "test@test.com";

            buyerName = mobile//soa_case?.SoaApplicantDetail?.[0]?.first_name || "applicant";

            emi_for_month = soa_case?.SoaEmiMapping?.[0]?.emi_for_month;

            case_id = soa_case.id;

            break;

            case(1):
            console.log("EXEC 1")

            soa_case = await userQueries.getOldSoaCaseData(loan_number);

            amt =  amount;//Number(soa_case.due_for_month);

            buyerPhone =  mobile//soa_case.PRIMARY_PHONE_APP;

            buyerEmail = soa_case.EMAIL_ID || "test@test.com";

            buyerName = soa_case.CUST_NAME || "applicant";

            emi_for_month = soa_case.emi_for_month;


            // try fetch the case id if available for better tracking **

            try{

             const case_2 = await paymentQueries.getSoaMapping(loan_number);
             
             case_id = case_2.id || null;

            }

            catch(err){

                console.log("Error Fetching Case From SoaCaseMapping **",err)

            }
        }


        console.log("CASE",soa_case)

        if(!soa_case) throw new Error("No Case Data Found!");

        const uniqueNumber =  generateInvoiceNumberEaseBuzz(true);

        if(type == 'partial') amt = amount;


        const hashSequence= `${process.env.EASEBUZZ_KEY_INVOICE}|${uniqueNumber}|${buyerName}|${buyerEmail || 'test@test.com'}|${buyerPhone}|${amt}|${uniqueNumber}|${loan_number}|udf3|udf4|udf5|demo|${process.env.EASEBUZZ_SALT_INVOICE}`


        console.log("SEQ",hashSequence)


        const today = new Date();
const formattedDate = today.getDate().toString().padStart(2, '0') + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getFullYear();



        const hash = crypto.createHash('sha512').update(hashSequence).digest('hex');

        console.log("HASH",hashSequence)

        console.log("NUMBER",uniqueNumber)



        //primary_applicant[0].first_name
        let body = {
  "merchant_txn": uniqueNumber,
  "key": process.env.EASEBUZZ_KEY_INVOICE,
  "email": buyerEmail || 'test@test.com',
  "name": buyerName || 'applicant',
  "amount": Number(amt),
  "phone": buyerPhone,
  "udf1": uniqueNumber??"",
  "udf2": loan_number|| "",
  "udf3": "udf3",
  "udf4": "udf4",
  "udf5": "udf5",
  "message": "demo",
  "expiry_date":formattedDate,
  "operation": [
    {
      "type": "sms",
      "template": "Default sms template"
    },
    {
      "type": "email",
      "template": "Default email template"
    },
    {
      "type": "whatsapp",
      "template": "Default whatsapp template"
    }
  ],
  "hash":hash
        }


        console.log("BODY SENT",JSON.stringify(body))

    


        const axiosInstance = axios.create();


        // intersept & log 


        axiosInstance.interceptors.request.use(async (config) => {
                try {
                   
                        timestamp = new Date(),
                        endpoint =  config.url,
                        method =  config.method,
                        dump = JSON.stringify(config.data || {})
                        
                    
    
                     const APILog = await paymentQueries.updateLog('PaymentRequestLog',{timestamp: new Date(),
                        endpoint: config.url,
                        method: config.method,
                        dump :JSON.stringify(config.data || {})})
                    config.log = APILog;
                    return config;
                } catch (error) {
                    console.log('Error occurred in logging outgoing request to Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });

            let log_id;
    
            axiosInstance.interceptors.response.use(async (response) => {
                try {
                    const data = {
                        timestamp: new Date(),
                        endpoint: response.config.url,
                        method: response.config.method,
                        dump: JSON.stringify(response.data),
                        requestLogId: Number(response.config.log.id)
                    };
                    // let log_created = await prisma.PaymentResponseLog.create({
                    //     data: data
                    // });

                     const log_created = await paymentQueries.updateLog('PaymentResponseLog',data)
                    log_id = log_created?.id
    
                    return response;
                } catch (error) {
                    console.log('Error occurred in logging incoming response from Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });

        const response = await axiosInstance.post(process.env.EASEBUZZ_INVOICE_URL,body);

        console.log("RESP",JSON.stringify(response?.data?.["error"]))
        
        // // Send link via sms
        // let sms_response = await this.sendPaymentLink(mobile_number, response?.data?.data.payment_url, amount);  // commented for later

        const sms_resp = await sendPaymentLink(mobile,response?.data?.data.payment_url,body?.amount)




         const created_entry = await paymentQueries.createEntry({     // create invoice fresh
                    invoice_number: response.data.data.merchant_txn,
                    payment_link:response.data.data.payment_url,
                    loan_number:loan_number,
                    amount:String(amt),
                    mobile_number   : buyerPhone,
                    gateway_name:'Easebuzz',
                    emi_for_month:emi_for_month,
                    payment_mode:'Digital',
                    payment_type:type,
                    month:get_month_sequence(),
                    year:get_year_string(),
                    case_id:Number(case_id),
                    merchant_request_number:uniqueNumber || ""
    //                  SoaCaseMapping: {
    //   connect: { id: Number(case_id) },
    // },
                })


//         console.log(" I AM OBJ",object)

//         console.log("ID",object.id)

return {Message:"Success",result:created_entry}

    } catch (error) {

        console.log(error)
        throw error;
    }

    }




    const verify_payment_QR = async(loan_number) =>{

        try{

        const target_month = get_month_sequence();     // check for current month data according to todays date

        const emi_data = await paymentQueries.getSoaMapping(loan_number);

        if(!emi_data) throw new Error("No Emi Data Found!");

        const original_amount = emi_data.SoaEmiMapping.original_due;

        const due_for_the_month = emi_data.SoaEmiMapping.due_for_the_month;

        // check original amount and payments done ** if matching due_for_the_month

        const paymentDetails = await paymentQueries.getPaymentDetails(loan_number);

        if(!paymentDetails)  throw new Error("No Payment Details Found!");

        // if(paymentDetails.status == 'completed') throw new Error("Payment Already Verified");

        const transaction_details = await check_status(paymentDetails?.invoice_number,paymentDetails?.id,loan_number,paymentDetails?.mobile_number,paymentDetails?.amount);


        return {message:"Success",result:transaction_details}


        }

        catch(err){

            throw err

        }

    }


    const force_expire = async(loan_number,mode)=>{

        try{

        const soa_case = await userQueries.getCaseData(loan_number);

        if(!soa_case) throw new Error("Error Updating Case, No data Found!");


        let batch_requests = [];

        console.log("EMI",soa_case.SoaEmiMapping)

        if(!soa_case.SoaEmiMapping?.[0]?.id) throw new Error("Error Updating, No Emi Data Found!")

        batch_requests.push(userQueries.updateTable('soaEmiMapping',soa_case.SoaEmiMapping?.[0]?.id,{selected_payment_method:mode}))
            
        const existing_payment = await paymentQueries.getExistingQR(loan_number);

        console.log("EXISTING PAY",existing_payment)

        if(!existing_payment.expired){

            batch_requests.push(paymentQueries.updateEntry(existing_payment.id,{expired:true}))
        }


        const final_update = await Promise.allSettled(batch_requests);

        return {message:"Successfully Updated"}


        }

        catch(err){

            throw err;

        }
    }


    const checkStatusPaymentLink = async(orderId,id,loan,mobile)=>{

        try {

            const order_id = orderId;
            const WIRE_API_KEY = process.env.WIRE_API_KEY;//"AKIAYG5WVKTVUTWPKVLD";
            const salt = process.env.EASEBUZZ_SALT_INVOICE
            const key = process.env.EASEBUZZ_KEY_INVOICE

            const hashSequence = `${key}|${order_id}|${salt}`;

            const hash = crypto.createHash('sha512').update(hashSequence).digest('hex');
            const authorization_string = hash;
           
            const axiosInstance = axios.create();


            axiosInstance.interceptors.request.use(async (config) => {
                try {
                   
                        timestamp = new Date(),
                        endpoint =  config.url,
                        method =  config.method,
                        dump = JSON.stringify(config.data || {})
                        
                    
    
                     const APILog = await paymentQueries.updateLog('PaymentRequestLog',{timestamp: new Date(),
                        endpoint: config.url?.split('&')?.[0],
                        method: config.method,
                        dump :JSON.stringify(config.data || {})})
                    config.log = APILog;
                    return config;
                } catch (error) {
                    console.log('Error occurred in logging outgoing request to Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });

            let log_id;
    
            axiosInstance.interceptors.response.use(async (response) => {
                try {
                    const data = {
                        timestamp: new Date(),
                        endpoint: response.config.url?.split('&')?.[0],
                        method: response.config.method,
                        dump: JSON.stringify(response.data),
                        requestLogId: Number(response.config.log.id)
                    };
                    
                    // let log_created = await prisma.PaymentResponseLog.create({
                    //     data: data
                    // });

                     const log_created = await paymentQueries.updateLog('PaymentResponseLog',data)
                    log_id = log_created?.id
    
                    return response;
                } catch (error) {
                    console.log('Error occurred in logging incoming response from Airpay Verification API: ', error);
                    return Promise.reject(error);
                }
            });
           
    
            const response = await axiosInstance.get(`${process.env.EASEBUZZ_PAYMENT_VERIFY_PAYBYLINK}?hash=${authorization_string}&key=${process.env.EASEBUZZ_KEY_INVOICE}&merchant_txn=${order_id}`);



            const payment_verified = response?.data?.data;


    
            //start here**
            // const responseXML = response.data;
            // const result = await parseString(responseXML);
            // const transactionData = result.RESPONSE.TRANSACTION[0];

            console.log("PAYMENT-VERIFIED-ISSUE",payment_verified?.transaction_order?.transactions?.[0]?.status)
    
            const response_data = {
                // airpay_verify_transaction_status          :   (payment_verified?.transaction_id && payment_verified?.transaction_id !== 'NA') && payment_verified?.payment_made !== 0?'200':'400',
                        gateway_verify_transaction_id           :   payment_verified?.transaction_id?payment_verified?.transaction_id == "NA"?orderId:payment_verified?.transaction_id:orderId,
                        gateway_verify_billed_amount                      :   payment_verified?.amount.toString(),
                        gateway_secure_hash              :   payment_verified?.pay_hash_url,
                        // airpay_verify_customer_email              :   payment_verified?.email,
                        gateway_verify_customer_phone              :   payment_verified?.phone,
                        gateway_verify_transaction_time            :   payment_verified?.quick_pay_transaction_date,
                        gateway_verify_transaction_payment_status  :   payment_verified?.transaction_id && payment_verified?.payment_made !== 0? 'Completed' : 'Failed',
                        payment_date:new Date(payment_verified?.quick_pay_transaction_date),
                        status: payment_verified?.transaction_id && payment_verified?.payment_made !== 0? 'Completed' : 'Failed',
                        // method: 'Online'
            }
    

    let payload = {};
            if(response_data?.status == 'completed'){
const dateOfCollection = new Date().toISOString().split("T")[0];
    payload  =   {
  "dateOfCollection": dateOfCollection,
  "loanNumber": loan,
  "employeecode": "Customer App",
  "instrument": "Electronic Payment",
  "deposit_channel": "Customer App",
  "clearanceStatus": "Handover Pending",
  "Source": "ICollect",
  "Status": "Active",
  "mobileNoReceipt": response_data?.gateway_verify_customer_phone,
  "bankname": "",
  "Mode": "Collections",
  "collector_type": "Self",
  "presentation_no": "1",
  "currentVersion": "2.5.30",
  "challan_no": "",
  "Chargedetails": [
    {
      "natureofCollection": "Emi/Advances/Part Payment",
      "amount": Number(response_data?.gateway_verify_billed_amount) || 0,
      "pancardImage": "",
      "uploadReceiptNum": "",
      "narration": ""
    },
  ]
};
            }

            // const updated = await userQueries.updateTable('paymentCollect',id,response_data);

            
    
      const updated = await paymentQueries.updatePaymentAndGetReciept(id,response_data,payload,payment_verified?.transaction_order?.status == 'completed'? true : false,"Digital");

            if (payment_verified?.transaction_order?.status == 'completed' && object[index].mobile_number) {
                await sendPaymentConfirmation(object[index].mobile_number, object[index].lead_id, String(payment_verified?.transactions?.[0]));
            }

    
            return {
                completed:payment_verified?.transaction_id && payment_verified?.payment_made !== 0? true : false,//transactionData.TRANSACTIONSTATUS[0] == '200',
                data: updated,
                result:payment_verified,
                // airpay_response_json:airpay_response_json
            };
        } catch (error) {
            console.log('Error processing transaction:', error);
            throw error;
        }

    }

    const verify_payment_link = async(loan_number)=>{

        try{   

        const emi_data = await paymentQueries.getSoaMapping(loan_number);

        if(!emi_data) throw new Error("No Emi Data Found!");

        const original_amount = emi_data.SoaEmiMapping.original_due;

        const due_for_the_month = emi_data.SoaEmiMapping.due_for_the_month;

        // check original amount and payments done ** if matching due_for_the_month

        const paymentDetails = await paymentQueries.getPaymentDetails(loan_number);

        const type = paymentDetails.qr_code?"qr":paymentDetails?.payment_link?"pay_by_link":null;

        if(!type || type !== "pay_by_link") throw new Error("No Payment Data Found!");

        if(!paymentDetails)  throw new Error("No Payment Details Found!")


        const transaction_details = await checkStatusPaymentLink(paymentDetails?.invoice_number,paymentDetails?.id,loan_number);


        return {message:"Success",result:transaction_details}

        }

        catch(err){

            throw err;

        }

    }


   const addCashRequest = async(loan_number,amount,mobile) =>{


        try{

        const find_loan = await userQueries.getCaseByLoan(loan_number);

        if(!find_loan) throw new Error("Invalid Loan Request!");

        // add data and send otp

        // send otp logic ** temp bypass now

        let otp = "12345"

        const add_cash_data = await paymentQueries.updateCashEntry({
            cash_otp:otp,
            loan_number:loan_number,
            case_id:find_loan.id,
            amount:amount,
            cash_mobile_number:mobile,
            payment_mode:"cash"
        });

        return {message:"Success",result:add_cash_data}

        }

        catch(err){

            throw err;
        }
    }




    const verifyCashOtp = async(id,loan_number,otp)=>{

        try{

        const find_latest_entry = await paymentQueries.findLatestEntry(loan_number);

        if(!find_latest_entry || find_latest_entry?.id !== id) throw new Error("Invalid Request, No record found!");

        if(find_latest_entry?.cash_otp !== otp){
            return {message:"Failed",source:"Invalid OTP"}
        };


        let emi_data = find_latest_entry?.SoaCaseMapping?.SoaEmiMapping?.[0];



        // construct payload for sf collections api


        const dateOfCollection = new Date().toISOString().split("T")[0];

        let payload = {
  "dateOfCollection": dateOfCollection,
  "loanNumber": loan_number,
  "employeecode": "ISFC0004",
  "instrument": "Cash",
  "deposit_channel": "Customer App",
  "clearanceStatus": "Handover Pending",
  "Source": "Customer App",
  "Status": "Active",
  "mobileNoReceipt": "9212897018",
  "bankname": "",
  "Mode": "Collections",
  "collector_type": "Collection Agent",
  "presentation_no": "1",
  "currentVersion": "2.5.30",
  "challan_no": "1768824373261",
  "Chargedetails": [
    {
      "natureofCollection": "Emi/Advances/Part Payment",
      "amount": Number(find_latest_entry?.amount) || 0,
      "pancardImage": "",
      "uploadReceiptNum": "",
      "narration": ""
    }
  ]
}
//         let payload =   {
//   "dateOfCollection": dateOfCollection,
//   "loanNumber": find_latest_entry.loan_number,
//   "employeecode": "ISFC0014",
//   "instrument": "Cash",
//   "deposit_channel": "Customer App",
//   "clearanceStatus": "Handover Pending",
//   "Source": "Customer App",
//   "Status": "Active",
//   "mobileNoReceipt": find_latest_entry.mobile_number,
//   "bankname": "",
//   "Mode": "Collections",
//   "collector_type": "Collection Agent",
//   "presentation_no": "1",
//   "currentVersion": "2.5.30",
//   "challan_no": "1768824373261",
//   "Chargedetails": [
//     {
//       "natureofCollection": "Emi/Advances/Part Payment",
//       "amount": Number(find_latest_entry.amount) || 0,
//       "pancardImage": "",
//       "uploadReceiptNum": "",
//       "narration": ""
//     }
//   ]
// };


        const update_entry = await paymentQueries.updatePaymentAndGetReciept(id,{cash_otp_verified:true,cash_otp_verified_at:new Date()},payload);


        return {message:"Success",result:update_entry}

        }

        catch(err){


            throw err;

        }
    }


    const update_cash_payment = async(number) =>{

    try{

        const findAndUpdatePayment = await userQueries.findAndUpdatePayment(number);


        return findAndUpdatePayment;

    }

    catch(err){

        console.log("Error in Updating Payment",err);

        throw err;

    }
}





    module.exports = {generateQR,generate_payment_link,verify_payment_QR,force_expire,verify_payment_link,check_status,checkStatusPaymentLink,addCashRequest,verifyCashOtp,update_cash_payment}