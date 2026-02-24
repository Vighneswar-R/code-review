const paymentCases = require('../../../application/payment/index');


const main = {
    generateQrCode:async(req,res,next) =>{

        try{

         const{loan_number,type} = req.params;
         
         if(!loan_number || !type) throw new Error("No Loan Number Found!");

         let amount = req.body?.amount;

        if(!amount) throw new Error("Please Specify Payment Amount!");
         


         const result = await paymentCases.generateQR(loan_number,type,amount);

         return res.json(result)



        }


        catch(err){

            console.log("Error Generating QR",err);

            next(err);
        }
    },

    generatePaymentLink:async(req,res,next) =>{


        try{
            const{loan_number,type} = req.params;
         
         if(!loan_number || !type) throw new Error("No Loan Number Found!");

         let amount = req.body?.amount;

         let mobile = req.body?.mobile_number;

        if(!amount || !mobile) throw new Error("Please Specify Amount/mobile!");
         

         const result = await paymentCases.generate_payment_link(loan_number,type,amount,mobile);

         return res.json(result)
        }

        catch(err){

            next(err);

        }
    },


    verifyQrPayment:async(req,res,next) =>{

        try{

          const{loan_number} = req.params;

          if(!loan_number) throw new Error("No Loan Data Found!");

          const result = await paymentCases.verify_payment_QR(loan_number,req.query);

          return res.json(result);

        }

        catch(err){

            console.log(err)
            next(err);

        }
    },

    changePaymentMode:async(req,res,next) =>{

        try{

           const{loan_number,mode} = req.body;
           
           if(!loan_number || ! mode) throw new Error("Missing Parameters!");

           const result = await paymentCases.force_expire(loan_number,mode);

           return res.json(result)

        }

        catch(err){
next(err);
        }
    },

    verify_payment_link:async(req,res,next) =>{

        try{

        const {loan_number} = req.params;

        if(!loan_number) throw new Error("No Loan Number Provided!");

        const result = await paymentCases.verify_payment_link(loan_number,req.query);

        return res.json(result)

        }

        catch(err){

            console.log(err)

            next(err);

        }
    },

    send_cash_otp:async(req,res,next) =>{

        try{

           const {id} = req.user;
           
           if(!id) throw new Error("Unauthorized Request!");

           const{loan_number,amount,mobile} = req.body;

           if(!loan_number || !amount || !mobile ) throw new Error("Missing Parameters for request!");

           const result = await paymentCases.addCashRequest(loan_number,amount,mobile);

           return res.json(result)

        }

        catch(err){

            console.log(err);

            next(err);
        }
    },

        verify_cash_otp:async(req,res,next) =>{

        try{

           const{loan_number,otp,id} = req.body;

                      const {type} = req.query;


           if(!loan_number || !otp || !id ) throw new Error("Missing Parameters for request!");

           const result = await paymentCases.verifyCashOtp(id,loan_number,otp,type);

           return res.json(result)

        }

        catch(err){

            console.log(err);

            next(err);
        }
    },


    update_cash_payment_status:async(req,res,next)=>{

        try{


            let receipt_number = req.body.receipt_number;

            if(!receipt_number) throw new Error("No Receipt Found!");


            const result = await paymentCases.update_cash_payment(receipt_number);

            return res.json(result);


        }

        catch(err){
            
            console.log("Error Updating Payment status for cash!",err)
        }
    }
}


module.exports = main;