// In this file there will be the business rules followed for BCP in case of mobile app for User/CO


const { soaApplicantDetail, soaAddressDetail } = require('../prisma/global');
const aliasObj = require('./alias')


const basic_structure_raw = {
    SoaApplicantDetail:[],
    SoaEmiMapping:[],
    SoaReferenceDetail:[],
    SoaBankingDetails:[],
    SoaAdditionalAddressMapping:[]
}

const soaCaseMapping_raw = {
  id: "",
  loan_number: "",
  loan_tenure: "",
  application_id: "",
  opportunity_id: "",
  co_id: "",
  bcm_id: "",
  assigned_user: "",
  loan_purpose: "",
  loan_principal_balance: "",
  principal_outstanding: "",
  balances_current: "",
  balances_overdue: "",
  bucket: "",
  dpd_opening: "",
  accounts_total: "",
  geo_tag_link: "",
  incentve: "",
  case_type: "",
  loan_branch_id: "",
  branch_id: "",
  approved_by: "",
  branch: "",
  legal_status: "",
  legal_stage: "",
  loan_approval_date: "",
  disbursal_status: "",
  rate_of_interest: "",
  sanctioned_amount: "",
  date_from: "",
  date_to: "",
  status: "",
  created_at: "",
  udpated_at: "",
  approved_at: ""
};


const applicant_structure_raw = {
  id: "",
  case_id: "",
  is_primary: false,
  first_name: "",
  middle_name: "",
  last_name: "",
  mobile_number: "",
  alternate_number: "",
  email: "",
  additional_email: "",
  is_guarantor: "",
  adhaar_number: ""
};


const address_structure_raw = {
  id: "",
  applicant_id: "",
  address_line1: "",
  address_line2: "",
  address_line3: "",
  landmark: "",
  city: "",
  state: "",
  state_code: "",
  pincode: "",
  geo_lat: "",
  geo_long: "",
  is_active: "",
  is_deleted: ""
};

const sending_structure = (data) =>{

    try{

     const{soaMapping,newMapping} = data;


     console.log("new Result",newMapping)
     
     const keys = Object.keys(soaMapping);


     let sanitized = {};

     for(const key of keys){
        
        const{alias,applicant_fields,address_fields,reference_fields,property_fields,emi_fields} = aliasObj;


        if(!alias[key] && !applicant_fields[key] && !address_fields[key] && !reference_fields[key] && !property_fields[key] && !emi_fields[key]){
            continue;
        }    // if the key is not mapped yet skip the key and move next ++

        const category = applicant_fields[key]?'SoaApplicantDetail':address_fields[key]?'SoaAddressDetail':reference_fields[key]?'SoaReferenceDetail':property_fields[key]?'SoaPropertyDetail':emi_fields[key]?'SoaEmiMapping':null


        switch(category){
            case('SoaApplicantDetail'):

            if(!sanitized.SoaApplicantDetail){
                sanitized.SoaApplicantDetail = [];
            }

            if(!soaMapping[key] || !soaMapping[key]?.length) continue;

            const first_key = key.split('_')?.[0];

            if(!first_key) continue;

            const sequence_number = first_key[first_key.length-1];

            const index = sequence_number - 1;

            const newKey = applicant_fields[key];


            if(!sanitized['SoaApplicantDetail'][index]) sanitized['SoaApplicantDetail'][index] = {...applicant_structure_raw,SoaAddressDetail:[address_structure_raw]}

            sanitized['SoaApplicantDetail'][index][newKey] = soaMapping[key];

            if(!sanitized['SoaApplicantDetail'][index]?.id?.length){
            
                if(!newMapping.SoaApplicantDetail?.length) continue;

                let id;

                newMapping.SoaApplicantDetail[index]?.sequence == sequence_number?id= newMapping.SoaApplicantDetail[index]?.id:null;

                for(const i of newMapping.SoaApplicantDetail){

                    console.log("I SEQ",i?.sequence_number,sequence_number)

                    if(i?.sequence_number == sequence_number){
                        sanitized.SoaApplicantDetail[index].id = i?.id;

                        id = newMapping.SoaApplicantDetail[index]?.id;

                        console.log("MATCH",sequence_number)
                    }
                }


                if(!id && sanitized.SoaApplicantDetail[index]?.mobile_number){

                    let soaApp = newMapping.SoaApplicantDetail;

                    for(const i of soaApp){

                        i?.mobile_number == sanitized.SoaApplicantDetail[index]?.mobile_number?sanitized.SoaApplicantDetail[index].id = i?.id:null;
                    }
                }



            }
            break;

            case('SoaAddressDetail'):

            if(!soaMapping[key] || !soaMapping[key]?.length) continue;

            const first_key_ad = key.split('_')?.[0];

            if(!first_key_ad) continue;

            const sequence_number_ad = first_key_ad[first_key_ad.length-1];

            const index_ad = sequence_number_ad - 1;

            const newKey_ad = address_fields[key];

                if(!sanitized.SoaApplicantDetail){
                sanitized.SoaApplicantDetail = [];
            }

            if(!sanitized.SoaApplicantDetail[index_ad]) sanitized.SoaApplicantDetail[index_ad] = {...applicant_structure_raw,SoaAddressDetail:[address_fields]}

            sanitized['SoaApplicantDetail'][index_ad]['SoaAddressDetail'][0][newKey_ad] = soaMapping[key];

            break;

            case('SoaReferenceDetail'):

            if(!sanitized['SoaReferenceDetail']) sanitized['SoaReferenceDetail'] = {};

            if(!soaMapping[key] || !soaMapping[key]?.length) continue;

                   if(!sanitized['SoaReferenceDetail']?.id){
                sanitized['SoaReferenceDetail'].id = newMapping?.SoaReferenceDetail?.[0]?.id || ""
            }

            sanitized.SoaReferenceDetail[reference_fields[key]] = soaMapping[key];

    

            break;

            case('SoaPropertyDetail'):

            if(!soaMapping[key] || !soaMapping[key]?.length) continue;
            
            if(!sanitized['SoaPropertyDetail']) sanitized['SoaPropertyDetail'] = {};

            sanitized.SoaPropertyDetail[property_fields[key]] = soaMapping[key];


            break;

            case('SoaEmiMapping'):

            if(!sanitized['SoaEmiMapping']) sanitized['SoaEmiMapping'] = {};


            if(!soaMapping[key] || !soaMapping[key]?.length) continue;

            sanitized.SoaEmiMapping[emi_fields[key]] = soaMapping[key];


            break;

            default:
            sanitized[alias[key]] = soaMapping[key];
        }


     }


     return sanitized;

    }


    catch(err){

        throw err;

    }
}

module.exports = {sending_structure}