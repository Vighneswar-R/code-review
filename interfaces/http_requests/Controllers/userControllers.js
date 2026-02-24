const userCases = require('../../../application/user')


//THIS CONTROLLER WILL HANDLE THE USER ACTIVITY RELATED REQESTS


const main = {

    log_in: async (req, res, next) => {

        try {

            const { username } = req.body;

            if (!username) throw new Error("Missing Credentials");

            const result = await userCases.login(req);

            return res.json(result)

        }

        catch (err) {

            console.log("ERR", err)
            next(err);
        }

    },
    login_otp_verify: async (req, res, next) => {

        try {


            const{sso} = req.query;

            const { username, password, otp, access_token, id_token,email } = req.body;

            if ((!username && (!sso || sso == 'false')) || (!otp && (!sso || sso == 'false')) || (sso == 'true' && (!id_token || !email))) throw new Error("Missing Credentials");

            const result = await userCases.verify_login_otp(req);

            return res.json(result)

        }

        catch (err) {

            console.log("ERR", err)
            next(err);
        }
    },

    hourly_punch_in: async (req, res, next) => {


        try {

            const id = req?.user?.id || 2;

            const { lat, long, active, type } = req?.body || {}

            const result = await userCases.punch_in(id, lat, long, active, type);

            return res.json(result)

        }

        catch (err) {

            console.log(err);

            next(err)

        }
    },

    add_data: async (req, res, next) => {
        try {

            const { model } = req.params;

            if (!model) throw new Error("No Model Found!");

            if (model == 'collectionFollowUp') {
                req.body.co_id = req?.user?.id;
            }

            const result = await userCases.add_data(model, req.body);

            return res.json(result);


        }

        catch (err) {

            console.log(err)

            next(err);
        }
    },

    edit_data_by_id: async (req, res, next) => {
        try {

            const { model, id } = req.params;

            if (!model || !id) throw new Error("Invalid Parameters!");

            const result = await userCases.edit_data_by_id(model, id, req.body);

            return res.json(result);


        }

        catch (err) {

            console.log(err)
            next(err);
        }
    },

    mark_attendance: async (req, res, next) => {

        try {

            const id = req.user?.id || 2

            if (!id) throw new Error("Invalid User Details!");

            const { lat, long } = req.query;

            const result = await userCases.mark_attendance(id, lat, long);

            return res.json(result)

        }

        catch (err) {

            console.log(err)

            next(err)
        }
    },


    user_sso_login: async (req, res, next) => {

        try {

            const { code } = req.body;

            if (!code) throw new Error("No Login Code Provided!");

            const result = userCases.SSO_log_in(code);

            return res.json(result)

        }

        catch (err) {

            next(err);

        }

    },

    get_punch_timeline: async (req, res, next) => {

        try {

            const { id } = req.params;

            if (!id) throw new Error("No Id Found!");

            const result = await userCases.get_punch_timeline(id);

            return res.json(result);

        }

        catch (err) {

            console.log(err);
            next(err);

        }
    },

    get_efficiency: async (req, res, next) => {
        try {

            const { id } = req.user;

            if (!id) throw new Error("No User Found!");

            const result = await userCases.get_efficiency_details(id);

            return res.json(result);

        }

        catch (err) {

            console.log(err);
            next(err);
        }
    },

    getAllSearchMaster: async (req, res, next) => {
        try {
            const result = await userCases.get_all_search_options();
            return res.json(result);
        }
        catch (err) {
            console.log("Error Fetching All Search Master", err);
            next(err);
        }
    },

    getSearchMaster: async (req, res, next) => {

        try {


            const { id } = req.user;

            if (!id) throw new Error("Invalid Request!");

            const result = await userCases.get_search_options(id);

            return res.json(result);

        }

        catch (err) {

            console.log("Error Fetching Search Master", err);

            next(err);
        }
    },

    createSearchMaster: async (req, res, next) => {
        try {
            // const {id} = req.user;
            // if(!id) throw new Error("Invalid Request!");

            const result = await userCases.create_search_options(req.body);

            return res.json(result);
        }
        catch (err) {
            console.log("Error Creating Search Master", err);
            next(err);
        }
    }
    ,

    updateSearchMaster: async (req, res, next) => {
        try {
            // const {id} = req.user;
            const { id: searchId } = req.params;
            if (
                // !id ||
                !searchId) throw new Error("Invalid Request!");

            const result = await userCases.update_search_options(searchId, req.body);

            return res.json(result);
        }
        catch (err) {
            console.log("Error Updating Search Master", err);
            next(err);
        }
    }
    ,
    deleteSearchMaster: async (req, res, next) => {
        try {
            // const {id} = req.user;
            const { id: searchId } = req.params;
            if (
                // !id ||
                !searchId) throw new Error("Invalid Request!");

            const result = await userCases.delete_search_options(searchId);

            return res.json(result);
        }
        catch (err) {
            console.log("Error Updating Search Master", err);
            next(err);
        }
    },

    search_by_filters: async (req, res, next) => {

        try {


            const { id } = req.user;

            if (!id) throw new Error("Invalid Request!");

            const result = await userCases.filter_based_search(req.body);

            return res.json(result);

        }

        catch (err) {

            console.log("Error in Filer Search", err);

            next(err);
        }
    },

       create_follow_up:async(req,res,next) =>{

        try{


          const {id} = req.user;
          
          if(!id) throw new Error("Invalid User!");

          const result = await userCases.add_follow_up(req);

          return res.json(result);

        }

        catch(err){

            console.log("Error in Filer Search",err);

            next(err);
        }
    },

    fetch_doc_from_s3:async(req,res,next)=>{

        try{

            const{file_path,path} = req.params;

            if(!file_path || !path) throw new Error("Invalid Parameters!");

            const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
            require('dotenv').config();


    const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});
              const key = !req.params.file_path ? req.params.key : `${req.params.file_path}/${req.params.path}`;

            // Define the parameters for calling S3.getObject
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: key
            };



            // Use the AWS SDK to fetch the object from S3
            const data = await s3Client.send(new GetObjectCommand(params));

            // Convert the object data to a buffer
            const objectData = await new Promise((resolve, reject) => {
                const chunks = [];
                data.Body.on('data', chunk => chunks.push(chunk));
                data.Body.on('end', () => resolve(Buffer.concat(chunks)));
                data.Body.on('error', reject);
            });


            // Return the object data and content type in the response
            res.set('Content-Type', data.ContentType);
         
            res.send(objectData);

        }

        catch(err){


            console.log("Error Retriving Document",err);

            next(err);

        }
    }
}


module.exports = main;