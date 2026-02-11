// THIS FILE CONTAINS THE ATTENDANCE AND USER SPECIFIC ACTIVITIES **


const userQueries = require('../../infrastructure/DB/userQueries');

const {haversine} = require('../../domain/index')


const add_data = async(model,data) =>{
    
    try{

      if(model == 'collectionFollowUp' && data?.follow_up_date_time){

        data.follow_up_date_time = new Date(data.follow_up_date_time);
      }

        const result = await userQueries.createSingle(model,data);

        return {message:"Success",result:result}

    }

    catch(err){

        throw err;
    }
};

const edit_data_by_id = async(model,id,data) =>{


        try{

        const result = await userQueries.updateTable(model,id,data);

        return {message:"Success",result:result}

    }

    catch(err){

        throw err;
    }

}

const get_punch_timeline = async(id) =>{

    try{

      let result = await userQueries.getPunchTimeline(id);


      if(result && result?.length){


        let coords = result
  .filter((ele) => ele?.geo_lat && ele?.geo_long) 
  .map((e) => ({
    geo_lat: parseFloat(e.geo_lat),
    geo_long: parseFloat(e.geo_long),
  }));

  console.log("COORDS",coords)

                //calculate distance based on existing lat long ** if punches are more than 1

let total = 0;

if(result?.length > 1){
for (let i = 0; i < coords.length - 1; i++) {
  total += haversine(
    coords[i].geo_lat,
    coords[i].geo_long,
    coords[i + 1].geo_lat,
    coords[i + 1].geo_long
  );
}
      }

     
result = {data:result,total_distance:total?`${total?.toFixed(2)} KM`:`0 KM`,count:result?.length}

    }

      return {message:"Success",result:result}

    }

    catch(err){

        throw err;
    }

}


const get_efficiency_details = async(id) =>{

  try{

    let result = await userQueries.findEfficiency(id);

    let obj = {collection:0,visit:0,distance:"",follow_ups:0};
    if(result){

      // calculate distance

      let logs = result?.user?.UserAttendanceLog?.[0]?.HourlyLog;

      console.log("LOGS",logs)

      let total = 0;

if(logs?.length > 1){
for (let i = 0; i < logs.length - 1; i++) {
  total += haversine(
    logs[i].geo_lat,
    logs[i].geo_long,
    logs[i + 1].geo_lat,
    logs[i + 1].geo_long
  );
}
      }


let follow_ups = result?.user?.CollectionFollowUp || [];

let payments = result?.paymentData || [];

obj.distance = total?`${total} KM`:'0 KM'
obj.follow_ups = follow_ups?.length || 0;

for(const item of payments){

  if(!item?.amount || !item?.amount?.length || !parseInt(item?.amount) == item?.amount) continue;

  let parsed = Number(item?.amount);

  obj.collection = obj.collection + parsed;
}

obj.visit = !follow_ups?.length
  ? 0
  : follow_ups.reduce((count, f) => {
      return count + (f?.current_follow_up === 'visit' ? 1 : 0);
    }, 0);

result = obj;
    }


    return {message:"Success",result:result || {}}

  }

  catch(err){

    throw err;
  }

}



module.exports = {add_data,edit_data_by_id,get_punch_timeline,get_efficiency_details}