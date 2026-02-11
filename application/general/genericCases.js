
const genericQueries = require('../../infrastructure/DB/genericQueries')

const getGenericData = async(model,include) =>{    // to get data from any table  ** validations will be updated in domain


    try{

        if(!model) throw new Error("No Query Found!");

        const existing_data = await genericQueries.findManyInclude(model,include);

        return existing_data;

    }

    catch(err){

        throw err;
    }

}


const addGenericData = async(model,query) =>{      // to create a new row on any table ** validations will be updated in domain

    try{

        if(!model || !query) throw new Error("Invalid Parameters!");


        const created = await genericQueries.create(model,query);

        return created;

    }

    catch(err){

        throw err;

    }
}


module.exports = {getGenericData,addGenericData}