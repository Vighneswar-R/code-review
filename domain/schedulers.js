const cronQueries = require('../infrastructure/DB/cronQueries');

const {check_status,checkStatusPaymentLink} = require('../application/payment/soaPaymentCases')



const reference_obj = {qr:check_status,pay_by_link:checkStatusPaymentLink}


const payment_cron = async() => {

    try{

    const date_range = process.env.PAYMENT_DATE_RANGE || 24;

    const pending_payments = await cronQueries.get_digital_payment_data(date_range);

    if(!pending_payments) throw new Error("No Date For Cron To Execute!");


    let execute_batch = [];


    for(const payment of pending_payments){

        const type = payment?.qr?'qr':'pay_by_link';

        execute_batch.push(reference_obj[type](payment?.invoice_number,payment.id));

    };

    if(!execute_batch?.length) throw new Error("No Date For Cron To Execute - 2");

    const result = await Promise.all(execute_batch);

    console.log("CRON RESULT",result)

    }
    
    catch(err){

        console.log("Error",err)

        throw err;

    }
}

// date comparison helper **

function getUpdateCategory(updatedAt,days) {
  const updated = new Date(updatedAt);
  const now = new Date();

  const diffMs = now - updated;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);


  if(days == 1){
      if (diffDays >= 1 && diffDays < 2){
        return true
      }

      else{
        return false;
      }
  }

  if (diffDays >= days) return true
  return false;
}


const message_schedule_cron = async() =>{

    try{

        // find skip numbers for the day;

         const skipFilePath = path.join(__dirname, 'skip_count.txt');

         let skip_count = 0;


         // get the skip value if exists

          if(fs.existsSync(skipFilePath)) {
          skip_count = parseInt(fs.readFileSync(skipFilePath, 'utf-8'), 10)
          }


        const take = process.env.SCHEDULE_TAKE || 50;


        const scheduled_available = await cronQueries.findActiveSchedules(skip_count,take);

        if(!scheduled_available?.length) throw new Error("No Data to Execute!");

        fs.writeFileSync(skipFilePath, scheduled_available?.length?.toString(), 'utf-8');


        let batched = [];

        for(const item of scheduled_available){

            const repeat = item?.repeat;

            const last_run = item?.updated_at;

            const message_type = item?.message || "";

            if(!message_type?.length) continue;


            let mapping = {
                PTP:async()=>{

                },

                Payment:async()=>{

                }
            }


            switch(repeat){

                case('Daily'):

                const to_process = getUpdateCategory(last_run,1);

                if(!to_process)  continue;

                await mapping[message_type];


                break;

                case('Weekly'):

                const to_process_weekly = getUpdateCategory(last_run,7);

                if(!to_process_weekly)  continue;

                await mapping[message_type];

                break;

                
                case('Monthly'):

                const to_process_monthly = getUpdateCategory(last_run,30);

                if(!to_process_monthly)  continue;

                await mapping[message_type];

                break;
            
            }
        }

        if(!batched?.length) throw new Error("No Batch To Execute!");


    }

    catch(err){

        console.log("Error Executing Cron - ", err)

    }
}


module.exports = {payment_cron,message_schedule_cron};


