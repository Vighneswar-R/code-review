const prisma = require('../../prisma/global');

const axios = require('axios');


const main = {
    createEntry:async(data) =>{

    return await prisma.paymentCollect.create({data:data})

},

getSoaMapping:async(loan) =>{


    console.log("LOAN",loan)

    return await prisma.soaCaseMapping.findFirst({
        where:{
            loan_number:loan
        },
        include:{
            SoaEmiMapping:true,
            SoaApplicantDetail:{
                where:{
                    is_primary:true
                }
            }
        }
    })
},


getPaymentDetails:async(loan_number,type) =>{

    return await prisma.paymentCollect.findFirst({
        where:{
            loan_number:loan_number,

        },
        orderBy:{
            id:'desc'
        }
    })

},

getExistingQR:async(loan_number) =>{
    return await prisma.paymentCollect.findFirst({
        where:{
            loan_number:loan_number,
        },
        orderBy:{
           id:'desc' 
        }
    })
},

updateEntry:async(id,data)=>{
    return await prisma.paymentCollect.update({where:{id:Number(id)},data:data})
},

updateLog: async (model, data) => {
  const { endpoint, method, dump, requestLogId } = data;

  console.log("DUBMP",endpoint)

  const allowedModels = ["PaymentRequestLog", "PaymentResponseLog"];
  if (!allowedModels.includes(model)) {
    throw new Error(`Invalid model name: ${model}`);
  }

  let columns = ["timestamp", "endpoint", "method", "dump"];
  let values = ["NOW()", "?", "?", "COMPRESS(CONVERT(? USING utf8mb4))"];
  let params = [endpoint, method, JSON.stringify(dump ?? {})];

  if (model === "PaymentResponseLog") {
    columns.push("request_log_id");
    values.push("?");
    params.push(Number(requestLogId));
  }

  const insertQuery = `
    INSERT INTO ${model} (${columns.join(", ")})
    VALUES (${values.join(", ")})
  `;

  console.log("ISSUE",params)

  await prisma.$executeRawUnsafe(insertQuery, ...params);

  const [row] = await prisma.$queryRawUnsafe(
    `SELECT id, timestamp, endpoint, method FROM ${model} ORDER BY id DESC LIMIT 1`
  );

  return row;
},

updateCashEntry:async(data) =>{

    return await prisma.paymentCollect.create({
        data:data
    })
},

findLatestEntry:async(loan)=>{
    
    return await prisma.paymentCollect.findFirst({
        where:{
            loan_number:loan
        },
        include:{
            SoaCaseMapping:{
                select:{
                    id:true,
                    SoaEmiMapping:true
                }
            }
        },
        orderBy:{
            id:"desc"
        }
    })
},
updatePaymentAndGetReciept:async(id,tableData,payload,status,mode)=>{

    const updated = await prisma.$transaction(async(tx)=>{

       // call salesforce collection API and get reciept number in return to store


       let sf_generate = false;

       let reciept = null;

       if(mode !== "Digital" || (mode == "Digital" && status == true )){

        sf_generate = true;
       const newInstance = axios.create();
       const sf_token = await newInstance.post(`${process.env.SF_TOKEN_API}`,{},{headers:{
        "Content-Type":"application/json"
       }});

       console.log("SF",sf_token)

       const access_token = sf_token?.data?.access_token;

       if(!access_token) throw new Error("Error Adding Cash Request - SF");

       const sf_collection = await newInstance.post(`${process.env.SF_COLLECTIONS_API}`,payload,{
        headers:{
            Authorization:`Bearer ${access_token}`
        }
       });


       // check if reciept number is generated;

       reciept = sf_collection?.data?.["Response"]?.[0]?.receiptNumber;

       console.log("RESPO",sf_collection?.data?.["Response"])

       if(!reciept) throw new Error("No Reciept Generated!");

    }

        const payment = await tx.paymentCollect.update({where:{id:Number(id)},data:sf_generate?{...tableData,receipt_number:reciept}:tableData});

      
        return payment;

    });

    return updated;

},
}


module.exports = main;