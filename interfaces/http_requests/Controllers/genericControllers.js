
const generalUseCases = require('../../../application/general/index')
const main = {

    getData:async(req,res,next) =>{

        try{

            const{table} = req.params;

            if(!table) throw new Error("No Table Found");


            const data = await generalUseCases.getMany(table,{RuleConditions:true});

            return res.json({
                message:"Success",
                rules:data
            })
        }

        catch(err){


            console.log("ERROR",err)

            next(err);

        }

    },

    addData:async(req,res,next)=>{

        try{

            const{body} = req;

            if(!body) throw new Error("No Content!");

            const {table} = req.params;

            if(!table) throw new Error("Invalid Model!");

          

            const data = generalUseCases.createSingle(table,{data:body});

            return res.json({
                message:"Success",
                result:data
            })

        }

        catch(err){

            next(err);

        }
    }
};


module.exports = main;