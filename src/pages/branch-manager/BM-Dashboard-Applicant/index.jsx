import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditIcon from '../../../assets/icons/edit';
import { AuthContext } from '../../../context/AuthContextProvider';
import { Box, Tabs, Tab } from '@mui/material';
import ProgressBadge from '../../../components/ProgressBadge';
import DynamicDrawer from '../../../components/SwipeableDrawer/DynamicDrawer';
import SwipeableDrawerComponent from '../../../components/SwipeableDrawer/LeadDrawer';
import LoaderDynamicText from '../../../components/Loader/LoaderDynamicText';
import Loader from '../../../components/Loader'
import {
  editFieldsById,
  getDashboardLeadById,
  editPropertyById,
  pushToSalesforce,
  serviceQueryPushToSalesforce,
  resetLeadQualifier,
  addRemarkLogs,
  getRemarkLogs,
  lead_by_pass,
  verifyMobileOtp,
  getMobileOtp,
  createApplicationForm
} from '../../../global';
import { CheckBox, DropDown, ToastMessage } from '../../../components';
import moment from 'moment';
import {
  PrimaryDropdownOptions,
  CoApplicantDropdownOptions,
} from '../../loan-officer/DashboardDropdowns';
import { LeadContext } from '../../../context/LeadContextProvider';
import EditLeadEnabled from '../../../assets/icons/EditFormEnabled';
import loading from '../../../assets/icons/loading.svg';
import axios from 'axios';
import { YesButton, Nobutton } from '../../../components/VerifyButtons';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import Modal from '../../../components/Open Modal/Modal';

import MarkStatus from '../../../components/MarkStatusForm/MarkStatus';
import SecureImage from '../../../components/SecureImage';
import ApplicantSection from '../../../components/MarkStatusForm/ApplicantSection';
import { useCookies } from 'react-cookie';
import AdminTable from '../../../components/UserTable/AdminTable';
import { otherDocumentOptions } from '../../loan-officer/lead-creation/utils';
import FormModal from '../../../components/FormModal';

export default function BMDashboardApplicant() {
  const { token, loData } = useContext(AuthContext);
  const { activeIndex, isActive, setIsActive,values } = useContext(LeadContext);
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [primaryApplicant, setPrimaryApplicant] = useState({});
  const [coApplicants, setCoApplicants] = useState([]);
  const [coApplicantOptions, setCoApplicantOptions] = useState([]); // co-applicant dropdown options
  const [coApplicantSelectedOption, setCoApplicantSelectedOption] = useState('');
  const [activeCoApplicant, setActiveCoApplicant] = useState({});

  const [primarySelectedStep, setPrimarySelectedStep] = useState(PrimaryDropdownOptions[0].value);
  const [coApplicantSelectedStep, setCoApplicantSelectedStep] = useState(
    CoApplicantDropdownOptions[0].value,
  );
  const [lntCharges, setLntCharges] = useState(null);

  // generate application form

  const[applicationForm,setApplicationForm] = useState(false);

  const[openApplication,setOpenApplication] = useState(false);

  const [open, setOpen] = useState(false);

  const [remarkData, setRemarkData] = useState({ id: '', page: '' });

  const [documents, setDocuments] = useState([]);

  const[pending,setPending] = useState({primary:{},coApplicants:{}})



  const [statusUpdate, setStatusUpdate] = useState({
    verify: null,
    value: '',
    id: '',
    page: '',
    isDocs: false,
    close: null,
    setDocVerify: null,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async (remarks) => {
    try {
      console.log('Saved remarks:', remarkData);
      const remarkLog = await addRemarkLogs(
        remarkData.page === 'upload' ? 'applicant' : remarkData.page,
        {
          applicantId: remarkData?.applicantId,
          table: remarkData.page,
          leadId: remarkData?.leadId,
          bm_remarks: remarks,
          field: remarkData?.field || remarkData.page,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return remarkLog;
    } catch (error) {
      console.error('Error saving remarks:', error);
    }
  };


  const handleBankingProgress = (current,applicant) => {
    

    if(current == 100) return 100;

    const bankingData = applicant?.banking_details?.filter((bank)=>!bank?.extra_params);

    if(bankingData?.[0]?.bm_status == true) return 100;

    // else cases check for penny drop done or not

    let verified_status;

    if(bankingData && bankingData?.length) {

      verified_status =  bankingData.filter((bank)=> {
       if(bank?.penny_drop_response || bank?.account_aggregator_file_paths) {
        return bank
       }
      })
    }

    else {
      return 0;
    }


    if(verified_status?.length !== 0) {
      return 100;
    }

    return 0;


  }



  const sortOtherDocs = (docArr) => {

    let sortedObj = {};

    let sortedArr = [];

    for(let i=0; i<docArr?.length; i++) {

      if(sortedObj[docArr[i].document_type_specific] == undefined) {
        sortedObj[docArr[i].document_type_specific] = [];
      }
      sortedObj[docArr[i].document_type_specific] = [...sortedObj[docArr[i].document_type_specific],docArr[i]]

    }

    let newKeys = Object.keys(sortedObj);

    if(newKeys?.length) {

      newKeys.forEach((element)=> {

        let obj = {};

        obj.document_type_specific = element;

        obj.data = sortedObj?.[element];

        sortedArr= [...sortedArr,obj];

      })
    }

    console.log("SORTED ARR",sortedArr)

    return sortedArr;

  }

  const latestDocumentIndex = (meta, type) => {
    //check if the type of selected doc

    if (['Passport', 'Driving License', 'Voter ID'].includes(type)) {
      return meta?.[meta?.length - 2]; // send the latest front document
    } else {
      return meta?.[meta?.length - 1];
    }
  };
  useEffect(() => {
    // track active index of applicant

    if (activeTab === 1) {
      let activeApplicant = leadData?.applicants?.filter((applicant, index) => {
        if (activeCoApplicant?.applicant_details.id === applicant?.applicant_details.id) {
          setIsActive(index);
        }
      });

      console.log('I am the active applicant', activeApplicant);
    } else {
      let activeApplicant = leadData?.applicants?.filter((applicant, index) => {
        if (primaryApplicant?.applicant_details.id === applicant?.applicant_details.id) {
          setIsActive(index);

        }
      });

      console.log('I am the active applicant', activeApplicant);
    }
  }, [activeCoApplicant, activeTab]);

  useEffect(() => {
    // track verification progress overall

    const applicant = leadData?.applicants?.[isActive];

    console.log(activeTab, 'I am the activeOne');

    //      applicant?.banking_details?.bm_status,

    const bmStatuses = [
      applicant?.applicant_details?.bm_status,
      applicant?.address_detail?.bm_status,
      applicant?.personal_details?.bm_status,
      applicant?.work_income_detail?.bm_status,
    ];

    console.log('lead data track', applicant);

    console.log('BM Statuses:', bmStatuses); // Log the status values being checked

    const allStatusesTrue = bmStatuses.every((status) => status === true);

    console.log('all status', allStatusesTrue);
  }, [leadData, isActive, activeTab]);

  useEffect(() => {
    console.log('I am the debug', leadData);
  }, [leadData]);

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }


  //Track the pending action fields ** 18/12


  useEffect(()=> {

    const applicants = leadData?.applicants;

    let primary_pending = {};

    let coApplicant_pending = {};

    // loop in primary and check for fields which is null;

    if(applicants) {

      for(const applicant of applicants) {

      const is_primary = applicant?.applicant_details?.is_primary;

      let obj = {}
      
      Object?.keys(applicant)?.forEach((key)=> {

        if(key == 'banking_details') {

  
          if(applicant?.banking_details?.length && applicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.length&& applicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status == null) {
            obj[key] = true;
          }
        }
  
        else if(key == 'applicant_details') {
          if(applicant?.[key]?.bm_status == null) {
            obj[key] = true;
          }
  
          if(applicant?.[key]?.upload_bm_status == null) {
            obj['upload_documents'] = true;
          }
        }
  
        else {
          if(applicant?.[key]?.bm_status == null) {
            obj[key] = true;
          }
        }
      })

      if(is_primary) {

        if(leadData?.property_details?.bm_status == null) {
          obj['property_details'] = true;
        }
        
        primary_pending = obj;
      }

      else {
        coApplicant_pending = {...coApplicant_pending,[applicant?.personal_details?.first_name]:obj}
      }
    }
    }

    let final_obj = {primary:primary_pending,coApplicants:coApplicant_pending}
    

    setPending(final_obj)


  },[leadData])


  useEffect(()=> {

    console.log("PENDING FIELDS",pending)
  },[pending])

  const data = {
    primaryApplicant: [
      {
        tableName: 'Personal Details',
        messages: ['Name not matched', 'Phone number is incorrect'],
      },
      {
        tableName: 'Work & Income Details',
        messages: ['The person is self-employed'],
      },
      {
        tableName: 'Property Details',
        messages: ['You have uploaded wrong property details'],
      },
    ],
    coApplicant: [
      {
        tableName: 'Personal Details',
        messages: ['Date of birth is missing', 'Email address is invalid'],
      },
      {
        tableName: 'Work & Income Details',
        messages: ['Income exceeds the limit'],
      },
      {
        tableName: 'Property Details',
        messages: ['Property documents are incomplete'],
      },
    ],
  };
  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };
  const getDocuments = async () => {
    // Get the current applicant ID for fetching available documents to verify
    const applicant_id = leadData?.applicants?.[activeTab]?.applicant_details.id;

    try {
      // Fetch documents for the given applicant_id
      const response = await axios.get(
        `http://localhost:8005/api/dashboard/documents/${applicant_id}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      // Extract the actual documents from the response data
      const documents = response.data;

      console.log('I am the document data', documents);

      // Use reduce to remove duplicates and create an object with unique document_type
      const uniqueDocuments = documents.data.reduce((acc, current) => {
        const docType = current.document_type;

        // If the document_type doesn't already exist in acc, add it as a key
        if (!acc[docType]) {
          acc[docType] = current;
        }

        return acc;
      }, {});

      console.log('Unique documents:', uniqueDocuments);

      // Set the unique documents in the state
      setDocuments(uniqueDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await getDashboardLeadById(id, {
          headers: {
            Authorization: token,
          },
        });

        console.log('Hey I am the lead data', data);

        // evaluate the lead to check if any applicant type is null

        let data_copy = structuredClone(data)

        let requests = [];


        data_copy?.applicants?.forEach((app,index)=> {
          if(!app?.applicant_details?.applicant_type || app?.applicant_details?.applicant_type == null) {
            requests.push(editFieldsById(app?.applicant_details?.id,'applicant',{applicant_type:app?.applicant_details?.is_primary == true?'Primary Applicant':'Co Applicant'},{
              headers: {
                Authorization: token,
              },
            }))

            // update the data copy and set the primary state for the flow

            app.applicant_details.applicant_type = app?.applicant_details?.is_primary == true?'Primary Applicant':'Co Applicant'
          }
        }) 

        if(requests.length > 0) {
          let fulfilled = await Promise.allSettled(requests);
        }
        setLeadData(data_copy);


        console.log("DATA COPY HERE",data_copy)

        // Find Primary Applicant
        const _primaryApplicant = data?.applicants?.find(
          (applicant) => applicant?.applicant_details?.is_primary,
        );
        setPrimaryApplicant(_primaryApplicant);

        // Get All CoApplicants
        setCoApplicants(
          data?.applicants?.filter(
            (applicant) =>
              applicant?.applicant_details?.id !== _primaryApplicant?.applicant_details?.id,
          ),
        );

        // Get completed lnt charges
        setLntCharges(data?.lt_charges?.find((charge) => charge?.status === 'Completed'));
      } catch (err) {
        console.error(err?.response?.status);
        navigate('/');
      }finally {
        setLoading(false);
      }
    })();
  }, []);



  // if already all approved lead or salesforce push failed leads


  // useEffect(()=> {

    
  //   // if(leadData) {
  //     const id = leadData?.lead?.id;

  //     let is_approved = true;

  //     let applicants = leadData?.applicants;

  //   if(leadData?.applicants) {
  //     for(const applicant of applicants) {

  //       if(!applicant?.applicant_details?.isApproved || applicant?.applicant_details?.isApproved == false) {
  //         is_approved = false;
  //       }
  //     }
  //   }



  //     if(is_approved == true && leadData?.lead?.bm_submit == true) {
  //       navigate(`/lead/retry-salesforce/${id}`)
  //     }
  //   // }




  // },[leadData])

  useEffect(() => {
    //*** IMP LATEST CHANGE */

    const _primaryApplicant = leadData?.applicants?.find(
      (applicant) => applicant?.applicant_details?.is_primary,
    );
    setPrimaryApplicant(_primaryApplicant);


    console.log(" I am the one primary>>>>>>>>+++++++++",_primaryApplicant)


    // Get All CoApplicants
    setCoApplicants(                             // ** BUG HERE
      leadData?.applicants?.filter(
        (applicant) =>
          applicant?.applicant_details?.id !== _primaryApplicant?.applicant_details?.id,
      ),
    );
  }, [leadData]);

  useEffect(() => {
    // Co Applicants Dropdown options
    if (!coApplicants) return;
    const options = [];
    coApplicants.map((applicant) => {
      options.push({
        label: `${applicant?.applicant_details?.first_name} ${applicant?.applicant_details?.middle_name} ${applicant?.applicant_details?.last_name}`,
        value: String(applicant?.applicant_details?.id),
      });
    });
    setCoApplicantOptions(options);

    

    if(!coApplicantSelectedOption) {
      setCoApplicantSelectedOption(options[0]?.value);
    }

  }, [coApplicants]);



  useEffect(()=>{
console.log("SELECTED",coApplicantSelectedOption)
  },[coApplicantSelectedOption])

  useEffect(() => {
    // Active CoApplicant - whose data will be shown
    if (!coApplicants) return;
    setActiveCoApplicant(
      coApplicants.find(
        (applicant) => applicant?.applicant_details?.id == coApplicantSelectedOption,
      ),
    );

    console.log(' I am, the option value', coApplicantSelectedOption); // area to play
  }, [coApplicants, coApplicantSelectedOption]);

  const primaryListRef = useRef(null);
  const primarySelectedStepRef = useRef(null);
  const coApplicantListRef = useRef(null);
  const coApplicantSelectedStepRef = useRef(null);

  useEffect(() => {
    // Scroll to the selected step in primary applicant
    if (primaryListRef.current) {
      const container = primaryListRef.current;
      const selectedItem = primarySelectedStepRef.current;

      const offset = selectedItem?.offsetTop - container?.offsetTop;

      container.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }
  }, [primarySelectedStep, activeTab]);

  useEffect(() => {
    // Scroll to the selected step in co-applicants

    if (coApplicantListRef.current) {
      const container = coApplicantListRef.current;
      const selectedItem = coApplicantSelectedStepRef.current;

      const offset = selectedItem?.offsetTop - container?.offsetTop;

      container.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }
  }, [coApplicantSelectedStep, activeTab]);

  const bankingDetailsArr = (applicant) => {
    let arr = [];


    // let banking = applicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0
    
    let banking_data = applicant?.banking_details?.filter((bank)=>!bank?.extra_params);


    if(!banking_data) return arr;


    let banking;

    if(banking_data?.length>0){

      for(const bank of banking_data) {
        

        if(bank?.penny_drop_response?.result?.active === 'yes' || bank?.account_aggregator_file_paths){
          banking = bank;
        }
      }
    }

    else{
      return arr;
    }

    arr = [
      ...arr,

      {
        subtitle: `ACCOUNT ${1}`,
        label: 'Bank name',
        value: banking?.bank_name,
        id:banking?.id,
        bm_status:banking?.bm_status
      },
      {
        label: 'Account number',
        value: banking?.account_number,
      },
      {
        label: banking?.account_aggregator_file_paths ? 'Account Aggregator' : 'Penny drop',
        value:
        banking?.penny_drop_response?.result?.active === 'yes' || banking?.account_aggregator_file_paths
            ? 'Success'
            : 'Failed',
            documentValue:[banking?.account_aggregator_file_paths?.acc_agg_pdf_response || banking?.bank_statement_image?.[0]?.document_fetch_url],
            doc_stage:'banking_docs'
      },

      {
        label: 'IFSC Code',
        value: banking?.ifsc_code,
      },
      {
        label: 'Branch',
        value: banking?.branch_name,
      },
      {
        label: 'Account type',
        value: banking?.account_type,
      },
    ]


    // applicant?.banking_details
    //   ?.filter((b) => !b?.extra_params?.is_deleted)
    //   ?.map(
    //     (b, i) =>
    //       (arr = [
    //         ...arr,

    //         {
    //           subtitle: `ACCOUNT ${i + 1}`,
    //           label: 'Bank name',
    //           value: b?.bank_name,
    //         },
    //         {
    //           label: 'Account number',
    //           value: b?.account_number,
    //         },
    //         {
    //           label: b?.account_aggregator_file_paths ? 'Account Aggregator' : 'Penny drop',
    //           value:
    //             b?.penny_drop_response?.result?.active === 'yes' || b?.account_aggregator_file_paths
    //               ? 'Success'
    //               : 'Failed',
    //               documentValue:[b?.account_aggregator_file_paths?.acc_agg_pdf_response || b?.bank_statement_image?.[0]?.document_fetch_url],
    //               doc_stage:'banking_docs'
    //         },

    //         {
    //           label: 'IFSC Code',
    //           value: b?.ifsc_code,
    //         },
    //         {
    //           label: 'Branch',
    //           value: b?.branch_name,
    //         },
    //         {
    //           label: 'Account type',
    //           value: b?.account_type,
    //         },
    //       ]),
    //   );
    return arr;
  };

  const handleUpdateStatus = (handleVerify, value, id, page) => {};

  const updateRemarks = async (text, value, id, page) => {
    console.log(' hey I am trigerred >>>>', leadData);


    // update remarks for the specific section to db

    if (value === true) {

      if(page === 'upload') {
        const updated = await editFieldsById(
          leadData?.applicants?.[isActive]?.applicant_details.id,
          "applicant",
          {
            upload_bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
  
        let updatedLead = {...leadData}
  
        updatedLead.applicants[isActive][field] = updated;
  
        console.log("I am the updated>>>>>>>*********",updated)
  
        setLeadData(updatedLead)
      }

      else if(remarkData.page == 'property') {

       

        const data = editPropertyById(remarkData?.id, {bm_remarks: text }, {
          headers: {
              Authorization: token,
          },
      });

      console.log("I am the response",data)
      }

  
      else if(page == 'banking') {




        const primary_applicant = leadData?.applicants?.[isActive]?.[field]?.[0];

        const banking_id = primary_applicant?.id;

        const updated = await editFieldsById(
          banking_id,
          page,
          {
            bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );

      }

      

      else {


        const updated = await editFieldsById(
          id,
          page,
          {
            bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );


        let field = remarkData.field;
  
        let updatedLead = {...leadData}
  
        console.log("I am, the isue",updatedLead.applicants[isActive][field])





        updatedLead.applicants[isActive][field] = updated;
  
        console.log("I am the updated",updated)
  
        setLeadData(updatedLead)
      }
      
    } else {

      if(remarkData.isDocs) {  // ** new bug fix here



        // console.log('I am the document data',leadData?.applicants?.[isActive]?.applicant_details.document_meta)

        // console.log("I am the selected id",remarkData.docId)

        let docData = leadData?.applicants?.[isActive]?.applicant_details.document_meta;

        // let doc_keys = Object.keys(leadData?.applicants?.[isActive]?.applicant_details.document_meta);

        // doc_keys.forEach((key)=> {
        //   docData?.[key].forEach((data)=> {
        //     if(data.id === remarkData.docId) {
        //       data.bm_status = false;
        //       data.bm_remarks = text;
        //     }
        //   })
        // })


        // other docs specific


        if(remarkData?.stage == 'other_docs') { 


          let lead_copy = structuredClone(leadData)
          
          let applicant_id = leadData?.applicants?.[isActive]?.applicant_details?.id

          let existing_meta = structuredClone(leadData?.applicants?.[isActive]?.applicant_details?.document_meta);

          let index_target;
          
          existing_meta?.other_docs?.forEach((obj,i)=> {

            if(remarkData?.multiple == true) {

              remarkData?.target?.forEach((element)=> {

                if(obj?.id == element?.id) {
                  obj.bm_remarks = text
                  obj.bm_status = value;
                }
              })

            }

            else {
            if(obj?.id == id) {
              index_target = i;
            }
          }

          })

          if(!remarkData?.multiple || remarkData?.multiple == false) {

          existing_meta.other_docs[index_target].bm_remarks = text;
          existing_meta.other_docs[index_target].bm_status = value;
          }

          editFieldsById(applicant_id,'applicant',{document_meta:existing_meta},{
            headers: {
              Authorization: token,
            },
          },)

          lead_copy.applicants[isActive].applicant_details.document_meta = existing_meta;

          setLeadData(lead_copy);

          return;
          
        }


//BANKING SPECIFIC

if(remarkData?.stage == 'banking_docs') {

let valid_banking = leadData?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]

let id = valid_banking?.id;


editFieldsById(id,'banking',{bm_status:false},{
  headers: {
    Authorization: token,
  },
},)

valid_banking.bm_status = false;

      let index;
      leadData?.applicants?.[isActive]?.banking_details?.forEach((bank,i)=> {

        if(!bank?.extra_params) {
          index = i;
          return;
        }
      })

      let updated = {...leadData};


      updated.applicants[isActive].banking_details[index] = valid_banking;

      setLeadData(updated)


      return;
          
}


        let newValues = docData[remarkData?.stage]?.map((data)=> {
          data.bm_status = false;
          data.bm_remarks = text;

          return data;
        })


        docData[remarkData?.stage] = newValues;

        console.log("updated doc_meta",docData)

        const updated = await editFieldsById(
          leadData?.applicants?.[isActive]?.applicant_details.id,
          "applicant",
          {
            document_meta: docData,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );


        //reset section status to null as document rejected ** 06/12 discussion


        if(remarkData?.page == 'upload') {
          await editFieldsById(remarkData?.id,'applicant',
            {
            upload_bm_status: null,
            },
          {
            headers: {
              Authorization: token,
            },
          },)
        }

        else {

          await editFieldsById(remarkData?.id,remarkData?.page,
            {
            bm_status: null,
            },
          {
            headers: {
              Authorization: token,
            },
          },)
        }



        let updatedLead = {...leadData}

  
        updatedLead.applicants[isActive].applicant_details.document_meta = docData;

        if(remarkData?.page == 'upload') {
          updatedLead.applicants[isActive].applicant_details.upload_bm_status = null;
        }  
        else {
          updatedLead.applicants[isActive][remarkData?.field].bm_status = null;
        }
        console.log("I am the updated one",updatedLead)
  
        setLeadData(updatedLead)

      }


      else if(remarkData.page === 'upload') {
        const updated = await editFieldsById(
          leadData?.applicants?.[isActive]?.applicant_details.id,
          "applicant",
          {
            upload_bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );


        let updatedLead = {...leadData}

        let field = remarkData?.field;

  
        updatedLead.applicants[isActive][field].upload_bm_remarks = text;
        updatedLead.applicants[isActive][field].upload_bm_status = false;


  
        console.log("I am the updated>>>>>>>*********",updatedLead)


  
        setLeadData(updatedLead)

      }

      else if(remarkData.page == 'banking') {

        //working here
        let primary_applicant = leadData?.applicants?.[isActive]?.banking_details;

        let banking_id = primary_applicant?.filter((bank)=>!bank?.extra_params)?.[0]?.id    // initially will take the first available data

        
        if (typeof primary_applicant === 'object' && primary_applicant !== null) {    // if primary key is updated will consider that details as active one
  
          // Get keys from the primary_applicant object
          let keys = Object.keys(primary_applicant);
        
          // Iterate through the keys to find the primary applicant
          keys.forEach((key) => {
            // Check if the current applicant is primary
            if (primary_applicant[key]?.is_primary === true) {
              // Reassign primary_applicant to the found primary applicant
              primary_applicant = primary_applicant[key];
              banking_id = primary_applicant?.id; // Get banking_id from the primary applicant
            }
          });
        }
        
        const updated = await editFieldsById(
          banking_id,
          "banking",
          {
            bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );



        let updatedLead = JSON.parse(JSON.stringify(leadData));


        let field = remarkData?.field;

       
  
        updatedLead.applicants[isActive].banking_details.filter((bank)=>!bank.extra_params)[0].bm_remarks = text;
        updatedLead.applicants[isActive].banking_details.filter((bank)=>!bank.extra_params)[0].bm_status = false;


        console.log("I am the updated one",updatedLead)



        setLeadData(updatedLead);

        
        
      }

      else if(remarkData.page == 'property') {


        // const property_detail = leadData?.property_details?.id;

        // const property_id = property_detail?.id

        const data = editPropertyById(remarkData.id, {bm_remarks: text }, {
          headers: {
              Authorization: token,
          },
      });


      let updatedLead = {...leadData}


      
      updatedLead.property_details.bm_remarks = text;
      updatedLead.property_details.bm_status = false;


      console.log("I am the updated one",updatedLead)

      console.log("I am the response",data)
      }

      

      else {

        const updated = await editFieldsById(
          remarkData.id,
          remarkData.page,
          {
            bm_remarks: text,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );


        let updatedLead = {...leadData}

        let field = remarkData?.field;

  
        updatedLead.applicants[isActive][field].bm_remarks = text;
        updatedLead.applicants[isActive][field].bm_status = false;

  
        console.log("I am the updated one",updatedLead)


  
        setLeadData(updatedLead)
      }


      // if (updatedLead?.applicants?.[isActive]?.[page]) {
      //   updatedLead.applicants[isActive][page] = updated;

      //   setLeadData(updatedLead)
      // }

      // updatedLead?.applicants?.[isActive]?.[page] = updated;

    
      
    }
  };

  const onHandleReturn = () => {
    navigate('/branch-manager');
  };


  const openApplicationForm = () =>{
    setOpenApplication(true);
  }



  const generateForm = async() =>{

    try{

      const res_form = await createApplicationForm(leadData?.applicants?.[isActive]?.applicant_details?.id,{
          headers: {
            Authorization: token,
          },
        });

        let lead_copy = structuredClone(leadData);
      
        if(res_form?.meta){
        lead_copy.applicants[isActive].applicant_details.document_meta = res_form?.meta;
        };

        console.log("RES FORM",res_form)

        setLeadData(lead_copy)
      
      }

    catch(err){

    }
  }


  const verifyApplicationOtp = async (otp,id) =>{

    try{
      

    const res =  await verifyMobileOtp(id, otp, {
          headers: {
            Authorization: token,
          },
        },"form-otp");

        if(res?.data?.message == "Valid OTP"){
          

        let lead_copy = structuredClone(leadData);

        lead_copy.applicants[isActive].applicant_details.application_form_otp = otp;
        lead_copy.applicants[isActive].applicant_details.application_form_otp_verified = true;

        setLeadData(lead_copy)

        return({
          message:"Valid OTP"
        })


        }

      }


      catch(err){

         console.log("Error Verifying OTP")

        
        return({
          message:"Invalid OTP"
        })
      }

  }


  const sendApplicationOtp = async(id)=>{


    try{

      const res =  await getMobileOtp(id, {
              headers: {
                Authorization: token,
              },
            },"form-otp");

            if(res?.data?.message == 'OTP sent successfully'){
              // write logic here 

              return;
            }
            
            // write error here
    }

    catch(err){

      console.log("ERROR SENDING OTP",err)

      // write error toast here
    }


  }

  return (
    <>
        {!loading ? ( 
           <div className='relative overflow-hidden h-screen'>
      <RemarksModal
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        updateRemarks={updateRemarks}
        handleUpdateStatus={handleUpdateStatus}
        statusUpdate={statusUpdate}
        lead={leadData}
      />


      
      {openApplication&& <FormModal data = {
        [{label:"Applicant Type",value:leadData?.applicants?.[isActive]?.applicant_details?.applicant_type},
        {label:"Name",value:leadData?.applicants?.[isActive]?.applicant_details?.first_name},
        {label:"Mobile Number",value:leadData?.applicants?.[isActive]?.applicant_details?.mobile_number}]
        
      } otp = {leadData?.applicants?.[isActive]?.applicant_details?.application_form_otp} 
        verified = {leadData?.applicants?.[isActive]?.applicant_details?.application_form_otp_verified}
        sendApplicationOtp = {sendApplicationOtp}
        verifyApplicationOtp = {verifyApplicationOtp}
        setOpenApplication = {setOpenApplication}
        generateForm = {generateForm}
        url = {leadData?.applicants?.[isActive]?.applicant_details?.document_meta?.application_form?.[0]?.document_fetch_url || ""}
        lead = {leadData}
        isActive = {isActive}
      />}
      
      <Titlebar
        title={`${primaryApplicant?.applicant_details?.first_name} ${
          primaryApplicant?.applicant_details?.middle_name !== null
            ? primaryApplicant?.applicant_details?.middle_name
            : ''
        } ${primaryApplicant?.applicant_details?.last_name}`}
        id={id}
        primaryApplicant={primaryApplicant}
        coApplicants={coApplicants}
        lead={leadData}
        onHandleReturn={onHandleReturn}
        pending = {pending}
        setApplicationForm = {setApplicationForm}
      />

      <Box sx={{ width: '100%', background: '#FEFEFE' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            textColor='inherit'
            variant='fullWidth'
            aria-label='full width tabs example'
            value={activeTab}
            onChange={handleChangeTab}
          >
            <Tab
              className='w-1/2 tabLabels2 bg-neutral-white'
              label='Primary Applicant'
              {...a11yProps(0)}
            />

            <Tab
              className='w-1/2 tabLabels2'
              label='Co-Applicants'
              {...a11yProps(1)}
              disabled={!(coApplicants && coApplicants?.length)}
            />
          </Tabs>
        </Box>
      </Box>
      <CustomTabPanel className='h-full' value={activeTab} index={0}>
        <div className='py-3 px-4 bg-neutral-white'>
          <DropDown
            label='STEPS'
            name='applicant_options'
            options={PrimaryDropdownOptions}
            placeholder='Choose STEPS'
            onChange={(selection) => setPrimarySelectedStep(selection)}
            defaultSelected={primarySelectedStep}
            labelClassName={'text-xs font-medium text-dark-grey'}
          />

             {/* <button
 className={`border text-sm px-4 py-1 rounded-md 
    ${!applicationForm 
      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
      : 'border-black text-black'}`}
      //  disabled = {!applicationForm}

      onClick={openApplicationForm}
>                 
                
                  Generate Application Form
                </button> */}
        </div>
        <div ref={primaryListRef} className='px-4 h-full overflow-auto'>
          <div className='flex justify-between pb-6'>
            <div>
              <span className='not-italic font-medium text-[10px] text-light-grey'>CREATED: </span>
              <span className='not-italic font-medium text-[10px] text-dark-grey'>
                {moment(primaryApplicant?.applicant_details?.created_at).format('DD/MM/YYYY')}
              </span>
            </div>

            <div>
              <span className='not-italic font-normal text-[12px] text-light-grey'>Status: </span>
              <span className='text-right text-sm not-italic font-medium text-primary-red'>
                {`${leadData?.lead?.status}`}
              </span>
            </div>

            <div>
              <span className='not-italic font-normal text-[12px] text-light-grey'>
                Completed:{' '}
              </span>
              <span className='text-right text-sm not-italic font-medium text-primary-red'>
                {`${leadData?.lead?.extra_params?.progress ?? 0}%`}
              </span>
            </div>
          </div>
          <FormDetails
            title='APPLICANT DETAILS'
            progress={primaryApplicant?.applicant_details?.extra_params?.progress}
            ref={primarySelectedStep == 'applicant_details' ? primarySelectedStepRef : null}
            data={[
              {
                label: 'Loan type',
                value: leadData?.lead?.loan_type,
              },
              {
                label: 'Required loan amount',
                value: leadData?.lead?.applied_amount,
              },
              {
                label: 'First name',
                value: primaryApplicant?.applicant_details?.first_name,
              },
              {
                label: 'Middle name',
                value: primaryApplicant?.applicant_details?.middle_name,
              },
              {
                label: 'Last name',
                value: primaryApplicant?.applicant_details?.last_name,
              },
              {
                label: 'Date of birth',
                value: primaryApplicant?.applicant_details?.date_of_birth,
              },
              {
                label: 'Purpose of loan',
                value: leadData?.lead?.purpose_of_loan,
              },
              {
                label: 'Property type',
                value: leadData?.lead?.property_type,
              },
              {
                label: 'Mobile number',
                value: primaryApplicant?.applicant_details?.mobile_number,
              },
              {
                label: 'Is Property Owner',
                value: primaryApplicant?.applicant_details?.is_property_owner,
              },
            ]}
            page='applicant'
            id={primaryApplicant?.applicant_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='applicant_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}
          />
          <Separator />

          <FormDetails
            title='PERSONAL DETAILS'
            ref={primarySelectedStep == 'personal_details' ? primarySelectedStepRef : null}
            progress={primaryApplicant?.personal_details?.extra_params?.progress}
            data={[
              {
                label: 'ID Type',
                value: primaryApplicant?.personal_details?.id_type,
              },
              {
                label: 'ID number',
                value: primaryApplicant?.personal_details?.id_number,
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'id_proof_photos',
              },
              {
                label: 'Address proof',
                value: primaryApplicant?.personal_details?.selected_address_proof,
                // documentValue:documents[primaryApplicant?.personal_details?.selected_address_proof]
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(
                  (photo) => photo?.active,
                ),

                doc_stage: 'address_proof_photos',
              },
              {
                label: 'Address proof number',
                value: primaryApplicant?.personal_details?.address_proof_number,
              },
              {
                label: 'Name',
                value: primaryApplicant?.personal_details?.first_name,
              },
              {
                label: 'Gender',
                value: primaryApplicant?.personal_details?.gender,
              },
              {
                label: 'Date of birth',
                value: primaryApplicant?.personal_details?.date_of_birth,
              },
              {
                label: 'Mobile number',
                value: primaryApplicant?.personal_details?.mobile_number,
              },
              {
                label: 'Father�s name',
                value: primaryApplicant?.personal_details?.father_name,
              },
              {
                label: 'Mother�s name',
                value: primaryApplicant?.personal_details?.mother_name,
              },
              {
                label: 'Marital status',
                value: primaryApplicant?.personal_details?.marital_status,
              },
              primaryApplicant?.personal_details?.marital_status === 'Married'
                ? {
                    label: 'Spouse name',
                    value: primaryApplicant?.personal_details?.spouse_name,
                  }
                : null,
              {
                label: 'Religion',
                value: primaryApplicant?.personal_details?.religion,
              },

                {
                label: 'Caste',
                value: primaryApplicant?.personal_details?.caste,
              },
              {
                label: 'Differently Abled Status',
                value: primaryApplicant?.personal_details?.differently_abled_status,
              },
              {
                label: 'Type of Impairment',
                value: primaryApplicant?.personal_details?.type_of_impairment,
              },
              {
                label: 'Percentage of Impairment',
                value: primaryApplicant?.personal_details?.percentage_of_impairment,
              },
              {
                label: 'UDID Number',
                value: primaryApplicant?.personal_details?.udid_number,
              },
              {
                label: 'Preferred Language',
                value: primaryApplicant?.personal_details?.preferred_language,
              },
              {
                label: 'Qualification',
                value: primaryApplicant?.personal_details?.qualification,
              },
              {
                label: 'Email',
                value: primaryApplicant?.personal_details?.email,
              },
              {
                label: 'City of Birth',
                value: primaryApplicant?.personal_details?.city_of_birth,
              },
              {
                label: 'CKYC Number',
                value: primaryApplicant?.personal_details?.ckyc_number,
              },
            ]}
            page='personal'
            id={primaryApplicant?.personal_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='personal_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            ref={primarySelectedStep == 'address_details' ? primarySelectedStepRef : null}
            title='ADDRESS DETAILS'
            progress={primaryApplicant?.address_detail?.extra_params?.progress}
            data={[
              {
                label: 'Type of residence',
                value: primaryApplicant?.address_detail?.current_type_of_residence,
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(
                  (photo) => photo?.active,
                ),

                doc_stage: 'address_proof_photos',
              },
              {
                label: 'Flat no/Building name',
                value: primaryApplicant?.address_detail?.current_flat_no_building_name,
                subtitle: 'CURRENT ADDRESS',
              },
              {
                label: 'Street/Area/Locality',
                value: primaryApplicant?.address_detail?.current_street_area_locality,
              },
              {
                label: 'Town',
                value: primaryApplicant?.address_detail?.current_town,
              },
              {
                label: 'Landmark',
                value: primaryApplicant?.address_detail?.current_landmark,
              },
              {
                label: 'Pincode',
                value: primaryApplicant?.address_detail?.current_pincode,
              },
              {
                label: 'City',
                value: primaryApplicant?.address_detail?.current_city,
              },
              {
                label: 'State',
                value: primaryApplicant?.address_detail?.current_state,
              },
              {
                label: 'No. of years residing',
                value: primaryApplicant?.address_detail?.current_no_of_year_residing,
              },
              {
                label: '',
                value: '',
                subtitle: 'ADDITIONAL ADDRESS',
                children: (
                  <div className='flex gap-2'>
                    <CheckBox
                      name=''
                      checked={
                        primaryApplicant?.address_detail?.extra_params
                          ?.additional_address_same_as_current
                      }
                      disabled={true}
                    />
                    <p className='text-xs not-italic font-medium text-primary-black'>
                      Additional address is same as Current address
                    </p>
                  </div>
                ),
              },

              {
                label: 'Type of address',
                value: primaryApplicant?.address_detail?.additional_type_of_residence,
              },
              {
                label: 'Flat no/Building name',
                value: primaryApplicant?.address_detail?.additional_flat_no_building_name,
              },
              {
                label: 'Street/Area/Locality',
                value: primaryApplicant?.address_detail?.additional_street_area_locality,
              },
              {
                label: 'Town',
                value: primaryApplicant?.address_detail?.additional_town,
              },
              {
                label: 'Landmark',
                value: primaryApplicant?.address_detail?.additional_landmark,
              },
              {
                label: 'Pincode',
                value: primaryApplicant?.address_detail?.additional_pincode,
              },
              {
                label: 'City',
                value: primaryApplicant?.address_detail?.additional_city,
              },
              {
                label: 'State',
                value: primaryApplicant?.address_detail?.additional_state,
              },
              {
                label: 'No. of years residing',
                value: primaryApplicant?.address_detail?.additional_no_of_year_residing,
              },
              {
                label: 'Address for tax purpose',
                value: primaryApplicant?.address_detail?.address_for_tax_purpose,
              },
            ]}
            page='address'
            id={primaryApplicant?.address_detail?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='address_detail'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            title='WORK & INCOME DETAILS'
            ref={primarySelectedStep == 'work_income_details' ? primarySelectedStepRef : null}
            progress={primaryApplicant?.work_income_detail?.extra_params?.progress}
            data={[
              {
                label: 'Profession',
                value: primaryApplicant?.work_income_detail?.profession,
              },
              {
                label: 'PAN number',
                value: primaryApplicant?.work_income_detail?.pan_number,
              },
              ,
              {
                label: 'Company name',
                value: primaryApplicant?.work_income_detail?.company_name,
              },
              {
                label: 'No. of employees',
                value: primaryApplicant?.work_income_detail?.no_of_employees,
              },
              {
                label: 'Udyam number',
                value: primaryApplicant?.work_income_detail?.udyam_number,
              },
              {
                label: 'Salary per month',
                value: primaryApplicant?.work_income_detail?.salary_per_month,
              },

               {
                label: 'Monthly Income',
                value: primaryApplicant?.work_income_detail?.monthly_income == 0?'':primaryApplicant?.work_income_detail?.monthly_income,
              },
              {
                label: 'Income proof',
                value: primaryApplicant?.work_income_detail?.income_proof,
                // documentValue:documents[primaryApplicant?.work_income_detail?.income_proof]
                documentValue:
                  primaryApplicant?.work_income_detail?.income_proof == 'Form 60'
                    ? leadData?.applicants?.[
                        isActive
                      ]?.applicant_details?.document_meta?.form_60_photos?.filter(
                        (photo) => photo?.active,
                      )
                    : leadData?.applicants?.[
                        isActive
                      ]?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                        (photo) => photo?.active,
                      ),
                doc_stage:
                  primaryApplicant?.work_income_detail?.income_proof == 'Form 60'
                    ? 'form_60_photos'
                    : 'salary_slip_photos',
              },
              {
                label: 'PF UAN',
                value: primaryApplicant?.work_income_detail?.pf_uan,
              },
              {
                label: 'No. of current loan(s)',
                value: primaryApplicant?.work_income_detail?.no_current_loan,
              },
              {
                label: 'Ongoing EMI(s)',
                value: primaryApplicant?.work_income_detail?.ongoing_emi,
              },
              {
                label: 'Working since',
                value: primaryApplicant?.work_income_detail?.working_since,
              },
              {
                label: 'Mode of salary',
                value: primaryApplicant?.work_income_detail?.mode_of_salary,
              },
              {
                label: 'Plot no/Building name',
                value: primaryApplicant?.work_income_detail?.flat_no_building_name,
              },

              {
                label: 'Street/Area/Locality',
                value: primaryApplicant?.work_income_detail?.street_area_locality,
              },
              {
                label: 'Town',
                value: primaryApplicant?.work_income_detail?.town,
              },
              {
                label: 'Landmark',
                value: primaryApplicant?.work_income_detail?.landmark,
              },
              {
                label: 'Pincode',
                value: primaryApplicant?.work_income_detail?.pincode,
              },
              {
                label: 'City',
                value: primaryApplicant?.work_income_detail?.city,
              },
              {
                label: 'State',
                value: primaryApplicant?.work_income_detail?.state,
              },
              {
                label: 'Total family members',
                value: primaryApplicant?.work_income_detail?.total_family_number,
              },
              {
                label: 'Total household income',
                value: primaryApplicant?.work_income_detail?.total_household_income,
              },
              {
                label: 'No. of dependents',
                value: primaryApplicant?.work_income_detail?.no_of_dependents,
              },
              {
                label: 'Business name',
                value: primaryApplicant?.work_income_detail?.business_name,
              },
              {
                label: 'Industries',
                value: primaryApplicant?.work_income_detail?.industries,
              },
              {
                label: 'GST Number',
                value: primaryApplicant?.work_income_detail?.gst_number,
              },

              {
                label: 'Pension amount',
                value: primaryApplicant?.work_income_detail?.pention_amount,
              },
              {
                label: 'Comfortable EMI',
                value: primaryApplicant?.work_income_detail?.comfortable_emi,
              },
            ]}
            page='work-income'
            id={primaryApplicant?.work_income_detail?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='work_income_detail'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            title='QUALIFIER'
            ref={primarySelectedStep == 'qualifier' ? primarySelectedStepRef : null}
            data={[]}
            message={
              primaryApplicant?.applicant_details?.extra_params?.qualifier
                ? 'Qualifier completed'
                : 'Qualifier incomplete'
            }
            page='qualifier'
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            title='L&T CHARGES'
            ref={primarySelectedStep == 'lt_charges' ? primarySelectedStepRef : null}
            progress={null}
            data={[
              {
                label: 'Payment method',
                value: lntCharges?.airpay_verify_chmod ?? lntCharges?.method ?? '-',
              },
            ]}
            message={!lntCharges ? 'L&T charges is pending' : null}
            page='L&T Charges'
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            title='PROPERTY DETAILS'
            ref={primarySelectedStep == 'property_details' ? primarySelectedStepRef : null}
            progress={leadData?.property_details?.extra_params?.progress}
            data={[
              {
                label: 'Property identification',
                value: leadData?.property_details?.property_identification_is,
              },
              {
                label: 'Property estimated value',
                value: leadData?.property_details?.property_value_estimate,
              },
              {
                label: 'Owner name',
                value: leadData?.property_details?.current_owner_name,
              },
              {
                label: 'Plot/House/Flat no',
                value: leadData?.property_details?.plot_house_flat,
              },
              {
                label: 'Project/Society/Colony name',
                value: leadData?.property_details?.project_society_colony,
              },
              {
                label: 'Pincode',
                value: leadData?.property_details?.pincode,
              },
              {
                label: 'City',
                value: leadData?.property_details?.city,
              },
              {
                label: 'State',
                value: leadData?.property_details?.state,
              },
            ]}
            page='property'
            id={leadData?.property_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='property_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            title='BANKING DETAILS'
            ref={primarySelectedStep == 'banking_details' ? primarySelectedStepRef : null}
            //progress={primaryApplicant?.applicant_details?.extra_params?.banking_progress}

            progress = {handleBankingProgress(primaryApplicant?.applicant_details?.extra_params?.banking_progress,primaryApplicant)}
            data={bankingDetailsArr(primaryApplicant)}
            page='banking'
            id={primaryApplicant?.banking_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='banking_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            ref={primarySelectedStep == 'reference_details' ? primarySelectedStepRef : null}
            title='REFERENCE DETAILS'
            progress={leadData?.reference_details?.extra_params?.progress}
            data={[
              {
                subtitle: 'REFERENCE DETAIL 1',
                label: 'Reference type',
                value: leadData?.reference_details?.reference_1_type,
              },
              {
                label: 'Full name',
                value: leadData?.reference_details?.reference_1_full_name,
              },
              {
                label: 'Mobile number',
                value: leadData?.reference_details?.reference_1_phone_number,
              },
              {
                label: 'Address',
                value: leadData?.reference_details?.reference_1_address,
              },
              {
                label: 'Pincode',
                value: leadData?.reference_details?.reference_1_pincode,
              },
              {
                label: 'City',
                value: leadData?.reference_details?.reference_1_city,
              },
              {
                label: 'State',
                value: leadData?.reference_details?.reference_1_state,
              },
              {
                label: 'Email',
                value: leadData?.reference_details?.reference_1_email,
              },
              {
                subtitle: 'REFERENCE DETAIL 2',
                label: 'Reference type',
                value: leadData?.reference_details?.reference_2_type,
              },
              {
                label: 'Full name',
                value: leadData?.reference_details?.reference_2_full_name,
              },
              {
                label: 'Mobile number',
                value: leadData?.reference_details?.reference_2_phone_number,
              },
              {
                label: 'Address',
                value: leadData?.reference_details?.reference_2_address,
              },
              {
                label: 'Pincode',
                value: leadData?.reference_details?.reference_2_pincode,
              },
              {
                label: 'City',
                value: leadData?.reference_details?.reference_2_city,
              },
              {
                label: 'State',
                value: leadData?.reference_details?.reference_2_state,
              },
              {
                label: 'Email',
                value: leadData?.reference_details?.reference_2_email,
              },
            ]}
            page='reference-details'
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            ref={primarySelectedStep == 'upload_documents' ? primarySelectedStepRef : null}
            title='UPLOAD DOCUMENTS'
            progress={primaryApplicant?.applicant_details?.extra_params?.upload_progress}
            data={[
              {
                label: 'Face liveness',
                value: primaryApplicant?.applicant_details?.faceliveness_response
                  ? 'Uploaded'
                  : '-',
                documentValue: primaryApplicant?.applicant_details?.faceliveness_response,
                doc_stage: 'face_liveness',
              },
              {
                label: 'Customer photo',
                value: primaryApplicant?.applicant_details?.document_meta?.customer_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue:
                  primaryApplicant?.applicant_details?.document_meta?.customer_photos?.filter(
                    (photo) => photo?.active,
                  ),
                doc_stage: 'customer_photos',
              },
              {
                label: 'ID Type',
                value: primaryApplicant?.personal_details?.id_type,
                // documentValue:documents[primaryApplicant?.personal_details?.id_type]
              },
              {
                label: 'ID proof',
                value: primaryApplicant?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'id_proof_photos',
              },
              {
                label: 'Address type',
                value: primaryApplicant?.personal_details?.selected_address_proof,
              },
              {
                label: 'Address proof',
                value:
                  primaryApplicant?.applicant_details?.document_meta?.address_proof_photos?.filter(
                    (cp) => cp?.active,
                  ).length
                    ? 'Uploaded'
                    : '-',

                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(
                  (photo) => photo?.active,
                ),

                doc_stage: 'address_proof_photos',
              },
              {
                label: 'Property papers',
                value:
                  primaryApplicant?.applicant_details?.document_meta?.property_paper_photos?.filter(
                    (cp) => cp?.active,
                  ).length
                    ? 'Uploaded'
                    : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.property_paper_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'property_paper_photos',
              },
              {
                label: 'Salary slip',
                value:
                  primaryApplicant?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                    (cp) => cp?.active,
                  ).length
                    ? 'Uploaded'
                    : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'salary_slip_photos',
              },
              {
                label: 'Form 60',
                value: primaryApplicant?.applicant_details?.document_meta?.form_60_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.form_60_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'form_60_photos',
              },
              // {
              //   label: 'Property image',
              //   value: primaryApplicant?.applicant_details?.document_meta?.property_photos?.filter(
              //     (cp) => cp?.active,
              //   ).length
              //     ? 'Uploaded'
              //     : '-',
              //   documentValue:
              //     leadData?.applicants?.[activeTab]?.applicant_details?.document_meta
              //       ?.property_photos?.filter((photo)=>photo?.active),
              //       doc_stage :"property_photos"

              // },
              {
                label: 'Upload selfie',
                value: primaryApplicant?.applicant_details?.document_meta?.lo_selfie?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.lo_selfie?.filter((photo) => photo?.active),
                doc_stage: 'lo_selfie',
              },

               {
                label: 'Relation with Main Applicant',
                value: primaryApplicant?.personal_details?.relation_with_main_applicant
              },
              {
                label: 'Application Form',
                value: primaryApplicant?.applicant_details?.document_meta?.application_form?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
          documentValue:
  (() => {
    const photos =
      leadData?.applicants?.[isActive]
        ?.applicant_details?.document_meta?.application_form
        ?.filter((photo) => photo?.active) ?? [];
 
    return photos.length ? [photos.at(-1)] : null;
  })(),
                doc_stage: 'application_form',
              },

              {
                subtitle: 'Other Documents',
                label: 'Other documents',
                value: primaryApplicant?.applicant_details?.document_meta?.other_docs?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                  documentValue:sortOtherDocs(leadData?.applicants?.[
                     isActive]?.applicant_details?.document_meta?.other_docs?.filter((photo) => photo?.active)),
                // documentValue: leadData?.applicants?.[
                //   isActive
                // ]?.applicant_details?.document_meta?.other_docs?.filter((photo) => photo?.active),
                doc_stage: 'other_docs',
              },
            ]}
            page='upload'
            lead={leadData}
            setLeadData={setLeadData}
            field='applicant_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}
          />
          <Separator />

          {/* <FormDetails
            ref={primarySelectedStep == 'preview' ? primarySelectedStepRef : null}
            title='PREVIEW'
            data={[]}
            message={'Will fill this once Banking details is done'}
          />
          <Separator /> */}

          <FormDetails
            ref={primarySelectedStep == 'eligibility' ? primarySelectedStepRef : null}
            title='ELIGIBILITY'
            message={
              primaryApplicant?.applicant_details?.extra_params?.eligibility
                ? 'Eligibility completed'
                : 'Eligibility incomplete'
            }
            page='eligibility'
          />

          <div className='h-[500px] w-full'></div>
        </div>
      </CustomTabPanel>
      <CustomTabPanel className='h-full' value={activeTab} index={1}>
        <div className='py-3 px-4 bg-neutral-white'>
          <div className='flex flex-col'>
            <DropDown
              label='CO-APPLICANTS'
              name='coApplicants'
              options={coApplicantOptions}
              placeholder='Choose CO-APPLICANTS'
              onChange={(selection) => setCoApplicantSelectedOption(selection)}
              defaultSelected={coApplicantSelectedOption}
              labelClassName={'text-xs font-medium text-dark-grey'}
            />
            <DropDown
              label='STEPS'
              name='coApplicant_steps'
              options={CoApplicantDropdownOptions}
              placeholder='Choose STEPS'
              onChange={(selection) => setCoApplicantSelectedStep(selection)}
              defaultSelected={coApplicantSelectedStep}
              labelClassName={'text-xs font-medium text-dark-grey'}
            />
          </div>
        </div>

        <div ref={coApplicantListRef} className='h-full px-4 overflow-auto'>
          <div className='flex justify-between pb-6'>
            <div>
              <span className='not-italic font-medium text-[10px] text-light-grey'>CREATED: </span>
              <span className='not-italic font-medium text-[10px] text-dark-grey'>
                {moment(activeCoApplicant?.applicant_details?.created_at).format('DD/MM/YYYY')}
              </span>
            </div>

            <div>
              <span className='not-italic font-normal text-[12px] text-light-grey'>
                Completed:{' '}
              </span>
              <span className='text-right text-sm not-italic font-medium text-primary-red'>
                {`${leadData?.lead?.extra_params?.progress ?? 0}%`}
              </span>
            </div>
          </div>
          <FormDetails
            ref={coApplicantSelectedStep == 'applicant_details' ? coApplicantSelectedStepRef : null}
            title='APPLICANT DETAILS'
            progress={primaryApplicant?.applicant_details?.extra_params?.progress}
            data={[
              {
                label: 'Loan type',
                value: leadData?.lead?.loan_type,
              },
              {
                label: 'Required loan amount',
                value: leadData?.lead?.applied_amount,
              },
              {
                label: 'First name',
                value: activeCoApplicant?.applicant_details?.first_name,
              },
              {
                label: 'Middle name',
                value: activeCoApplicant?.applicant_details?.middle_name,
              },
              {
                label: 'Last name',
                value: activeCoApplicant?.applicant_details?.last_name,
              },
              {
                label: 'Date of birth',
                value: activeCoApplicant?.applicant_details?.date_of_birth,
              },
              {
                label: 'Purpose of loan',
                value: leadData?.lead?.purpose_of_loan,
              },
              {
                label: 'Property type',
                value: leadData?.lead?.property_type,
              },
              {
                label: 'Mobile number',
                value: activeCoApplicant?.applicant_details?.mobile_number,
              },
               {
                label: 'Is Property Owner',
                value: activeCoApplicant?.applicant_details?.is_property_owner,
              },
            ]}
            page='applicant'
            id={activeCoApplicant?.applicant_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='applicant_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            ref={coApplicantSelectedStep == 'personal_details' ? coApplicantSelectedStepRef : null}
            title='PERSONAL DETAILS'
            progress={primaryApplicant?.personal_details?.extra_params?.progress}
            data={[
              {
                label: 'ID Type',
                value: activeCoApplicant?.personal_details?.id_type,
                // documentValue:leadData?.applicants?.[isActive]?.applicant_details?.document_meta?.id_proof_photos?.[0]
              },
              {
                label: 'ID number',
                value: activeCoApplicant?.personal_details?.id_number,
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'id_proof_photos',
              },
              {
                label: 'Address proof',
                value: activeCoApplicant?.personal_details?.selected_address_proof,
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'address_proof_photos',
              },
              {
                label: 'Address proof number',
                value: activeCoApplicant?.personal_details?.address_proof_number,
              },
              {
                label: 'Name',
                value: activeCoApplicant?.personal_details?.first_name,
              },
              {
                label: 'Gender',
                value: activeCoApplicant?.personal_details?.gender,
              },
              {
                label: 'Date of birth',
                value: activeCoApplicant?.personal_details?.date_of_birth,
              },
              {
                label: 'Mobile number',
                value: activeCoApplicant?.personal_details?.mobile_number,
              },
              {
                label: 'Father�s name',
                value: activeCoApplicant?.personal_details?.father_name,
              },
              {
                label: 'Mother�s name',
                value: activeCoApplicant?.personal_details?.mother_name,
              },

              {
                label: 'Marital status',
                value: activeCoApplicant?.personal_details?.marital_status,
              },

              activeCoApplicant?.personal_details?.marital_status === 'Married' && {
                label: 'Spouse name',
                value: activeCoApplicant?.personal_details?.spouse_name,
              },

              {
                label: 'Religion',
                value: activeCoApplicant?.personal_details?.religion,
              },
              {
                label: 'Differently Abled Status',
                value: activeCoApplicant?.personal_details?.differently_abled_status,
              },
              {
                label: 'Type of Impairment',
                value: activeCoApplicant?.personal_details?.type_of_impairment,
              },
              {
                label: 'Percentage of Impairment',
                value: activeCoApplicant?.personal_details?.percentage_of_impairment,
              },
              {
                label: 'UDID Number',
                value: activeCoApplicant?.personal_details?.udid_number,
              },
              {
                label: 'Preferred Language',
                value: activeCoApplicant?.personal_details?.preferred_language,
              },
              {
                label: 'Qualification',
                value: activeCoApplicant?.personal_details?.qualification,
              },
              {
                label: 'Email',
                value: activeCoApplicant?.personal_details?.email,
              },
              {
                label: 'City of Birth',
                value: activeCoApplicant?.personal_details?.city_of_birth,
              },
              {
                label: 'CKYC Number',
                value: activeCoApplicant?.personal_details?.ckyc_number,
              },
            ]}
            page='personal'
            id={activeCoApplicant?.personal_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='personal_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            ref={coApplicantSelectedStep == 'address_details' ? coApplicantSelectedStepRef : null}
            title='ADDRESS DETAILS'
            progress={activeCoApplicant?.address_detail?.extra_params?.progress}
            data={[
              {
                label: 'Type of residence',
                value: activeCoApplicant?.address_detail?.current_type_of_residence,
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(    // here
                  (photo) => photo?.active,
                ),
                doc_stage: 'address_proof_photos',
              },
              {
                label: 'Flat no/Building name',
                value: activeCoApplicant?.address_detail?.current_flat_no_building_name,
                subtitle: 'CURRENT ADDRESS',
              },
              {
                label: 'Street/Area/Locality',
                value: activeCoApplicant?.address_detail?.current_street_area_locality,
              },
              {
                label: 'Town',
                value: activeCoApplicant?.address_detail?.current_town,
              },
              {
                label: 'Landmark',
                value: activeCoApplicant?.address_detail?.current_landmark,
              },
              {
                label: 'Pincode',
                value: activeCoApplicant?.address_detail?.current_pincode,
              },
              {
                label: 'City',
                value: activeCoApplicant?.address_detail?.current_city,
              },
              {
                label: 'State',
                value: activeCoApplicant?.address_detail?.current_state,
              },
              {
                label: 'No. of years residing',
                value: activeCoApplicant?.address_detail?.current_no_of_year_residing,
              },
              {
                label: '',
                value: '',
                subtitle: 'ADDITIONAL ADDRESS',
                children: (
                  <div className='flex gap-2'>
                    <CheckBox
                      name=''
                      checked={
                        primaryApplicant?.address_detail?.extra_params
                          ?.additional_address_same_as_current
                      }
                      disabled={true}
                    />
                    <p className='text-xs not-italic font-medium text-primary-black'>
                      Additional address is same as Current address
                    </p>
                  </div>
                ),
              },
              {
                label: 'Type of address',
                value: activeCoApplicant?.address_detail?.additional_type_of_residence,
              },
              {
                label: 'Flat no/Building name',
                value: activeCoApplicant?.address_detail?.additional_flat_no_building_name,
              },
              {
                label: 'Street/Area/Locality',
                value: activeCoApplicant?.address_detail?.additional_street_area_locality,
              },
              {
                label: 'Town',
                value: activeCoApplicant?.address_detail?.additional_town,
              },
              {
                label: 'Landmark',
                value: activeCoApplicant?.address_detail?.additional_landmark,
              },
              {
                label: 'Pincode',
                value: activeCoApplicant?.address_detail?.additional_pincode,
              },
              {
                label: 'City',
                value: activeCoApplicant?.address_detail?.additional_city,
              },
              {
                label: 'State',
                value: activeCoApplicant?.address_detail?.additional_state,
              },
              {
                label: 'No. of years residing',
                value: activeCoApplicant?.address_detail?.additional_no_of_year_residing,
              },
            ]}
            page='address'
            id={activeCoApplicant?.address_detail?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='address_detail'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />
          <Separator />

          <FormDetails
            ref={
              coApplicantSelectedStep == 'work_income_details' ? coApplicantSelectedStepRef : null
            }
            title='WORK & INCOME DETAILS'
            progress={activeCoApplicant?.work_income_detail?.extra_params?.progress}
            data={[
              {
                label: 'Profession',
                value: activeCoApplicant?.work_income_detail?.profession,
              },
              {
                label: 'PAN number',
                value: activeCoApplicant?.work_income_detail?.pan_number,
              },
              {
                label: 'Company name',
                value: activeCoApplicant?.work_income_detail?.company_name,
              },
              {
                label: 'No. of employees',
                value: activeCoApplicant?.work_income_detail?.no_of_employees,
              },
              {
                label: 'Udyam number',
                value: activeCoApplicant?.work_income_detail?.udyam_number,
              },
              {
                label: 'Salary per month',
                value: activeCoApplicant?.work_income_detail?.salary_per_month,
              },
               {
                label: 'Monthly Income',
                value: activeCoApplicant?.work_income_detail?.monthly_income == 0?'':activeCoApplicant?.work_income_detail?.monthly_income,
              },
              {
                label: 'Income proof',
                value: activeCoApplicant?.work_income_detail?.income_proof,
                // documentValue:documents[primaryApplicant?.work_income_detail?.income_proof]
                documentValue:
                  activeCoApplicant?.work_income_detail?.income_proof == 'Form 60'
                    ? leadData?.applicants?.[
                        isActive
                      ]?.applicant_details?.document_meta?.form_60_photos?.filter(
                        (photo) => photo?.active,
                      )
                    : leadData?.applicants?.[
                        isActive
                      ]?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                        (photo) => photo?.active,
                      ),
                doc_stage:
                  activeCoApplicant?.work_income_detail?.income_proof == 'Form 60'
                    ? 'form_60_photos'
                    : 'salary_slip_photos',
              },
              {
                label: 'PF UAN',
                value: activeCoApplicant?.work_income_detail?.pf_uan,
              },
              {
                label: 'No. of current loan(s)',
                value: activeCoApplicant?.work_income_detail?.no_current_loan,
              },
              {
                label: 'Ongoing EMI(s)',
                value: activeCoApplicant?.work_income_detail?.ongoing_emi,
              },
              {
                label: 'Working since',
                value: activeCoApplicant?.work_income_detail?.working_since,
              },
              {
                label: 'Mode of salary',
                value: activeCoApplicant?.work_income_detail?.mode_of_salary,
              },
              {
                label: 'Plot no/Building name',
                value: activeCoApplicant?.work_income_detail?.flat_no_building_name,
              },

              {
                label: 'Street/Area/Locality',
                value: activeCoApplicant?.work_income_detail?.street_area_locality,
              },
              {
                label: 'Town',
                value: activeCoApplicant?.work_income_detail?.town,
              },
              {
                label: 'Landmark',
                value: activeCoApplicant?.work_income_detail?.landmark,
              },
              {
                label: 'Pincode',
                value: activeCoApplicant?.work_income_detail?.pincode,
              },
              {
                label: 'City',
                value: activeCoApplicant?.work_income_detail?.city,
              },
              {
                label: 'State',
                value: activeCoApplicant?.work_income_detail?.state,
              },
              {
                label: 'Total family members',
                value: activeCoApplicant?.work_income_detail?.total_family_number,
              },
              {
                label: 'Total household income',
                value: activeCoApplicant?.work_income_detail?.total_household_income,
              },
              {
                label: 'No. of dependents',
                value: activeCoApplicant?.work_income_detail?.no_of_dependents,
              },
            ]}
            page='work-income'
            id={activeCoApplicant?.work_income_detail?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='work_income_detail'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />

          <Separator />

          <FormDetails
            ref={coApplicantSelectedStep == 'qualifier' ? coApplicantSelectedStepRef : null}
            title='QUALIFIER'
            data={[]}
            message={
              activeCoApplicant?.applicant_details?.extra_params?.qualifier
                ? 'Qualifier completed'
                : 'Qualifier incomplete'
            }
            page='qualifier'
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            ref={coApplicantSelectedStep == 'banking_details' ? coApplicantSelectedStepRef : null}
            title='BANKING DETAILS'
            // progress={activeCoApplicant?.applicant_details?.extra_params?.banking_progress}
            progress = {handleBankingProgress(activeCoApplicant?.applicant_details?.extra_params?.banking_progress,activeCoApplicant)}
            data={bankingDetailsArr(activeCoApplicant)}
            page='banking'
            id={activeCoApplicant?.banking_details?.id}
            lead={leadData}
            setLeadData={setLeadData}
            field='banking_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {false}

          />
          <Separator />

          <FormDetails
            ref={coApplicantSelectedStep == 'upload_documents' ? coApplicantSelectedStepRef : null}
            title='UPLOAD DOCUMENTS'
            progress={activeCoApplicant?.applicant_details?.extra_params?.upload_progress}
            data={[
              {
                label: 'Face liveness',
                value: activeCoApplicant?.applicant_details?.faceliveness_response
                  ? 'Uploaded'
                  : '-',
                documentValue: activeCoApplicant?.applicant_details?.faceliveness_response,
                doc_stage: 'face_liveness',
              },

              {
                label: 'Customer photo',
                value: activeCoApplicant?.applicant_details?.document_meta?.customer_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue:
                  activeCoApplicant?.applicant_details?.document_meta?.customer_photos?.filter(
                    (photo) => photo?.active,
                  ),

                doc_stage: 'customer_photos',
              },
              {
                label: 'ID Type',
                value: activeCoApplicant?.personal_details?.id_type,
              },
              {
                label: 'ID proof',
                value: activeCoApplicant?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.id_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'id_proof_photos',
              },
              {
                label: 'Address type',
                value: activeCoApplicant?.personal_details?.selected_address_proof,
              },
              {
                label: 'Address proof',
                value:
                  activeCoApplicant?.applicant_details?.document_meta?.address_proof_photos?.filter(
                    (cp) => cp?.active,
                  ).length
                    ? 'Uploaded'
                    : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.address_proof_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'address_proof_photos',
              },
              // {
              //   label: 'Property papers',
              //   value:
              //     activeCoApplicant?.applicant_details?.document_meta?.property_paper_photos?.filter(
              //       (cp) => cp?.active,
              //     ).length
              //       ? 'Uploaded'
              //       : '-',
              //   documentValue: leadData?.applicants?.[
              //     isActive
              //   ]?.applicant_details?.document_meta?.property_paper_photos?.filter(
              //     (photo) => photo?.active,
              //   ),
              //   doc_stage: 'property_paper_photos',
              // },
              {
                label: 'Salary slip',
                value:
                  activeCoApplicant?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                    (cp) => cp?.active,
                  ).length
                    ? 'Uploaded'
                    : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.salary_slip_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'salary_slip_photos',
              },
              {
                label: 'Form 60',
                value: activeCoApplicant?.applicant_details?.document_meta?.form_60_photos?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.form_60_photos?.filter(
                  (photo) => photo?.active,
                ),
                doc_stage: 'form_60_photos',
              },
              // {
              //   label: 'Property image',
              //   value: activeCoApplicant?.applicant_details?.document_meta?.property_photos?.filter(
              //     (cp) => cp?.active,
              //   ).length
              //     ? 'Uploaded'
              //     : '-',
              //     documentValue:leadData?.applicants?.[isActive]?.applicant_details?.document_meta?.property_photos?.filter((photo)=>photo?.active),
              //     doc_stage :"property_photos"

              // },
              {
                label: 'Upload selfie',
                value: activeCoApplicant?.applicant_details?.document_meta?.lo_selfie?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                documentValue: leadData?.applicants?.[
                  isActive
                ]?.applicant_details?.document_meta?.lo_selfie?.filter((photo) => photo?.active),
                doc_stage: 'lo_selfie',
              },


                    {
                label: 'Relation with Main Applicant',
                value: activeCoApplicant?.personal_details?.relation_with_main_applicant
              },

                 {
                label: 'Application Form',
                value: activeCoApplicant?.applicant_details?.document_meta?.application_form?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
           documentValue:
  (() => {
    const photos =
      leadData?.applicants?.[isActive]
        ?.applicant_details?.document_meta?.application_form
        ?.filter((photo) => photo?.active) ?? [];
 
    return photos.length ? [photos.at(-1)] : null;
  })(),
                doc_stage: 'application_form',
              },
              {
                subtitle: 'Other Documents',
                label: 'Other documents',
                value: activeCoApplicant?.applicant_details?.document_meta?.other_docs?.filter(
                  (cp) => cp?.active,
                ).length
                  ? 'Uploaded'
                  : '-',
                  documentValue:sortOtherDocs(leadData?.applicants?.[
                    isActive]?.applicant_details?.document_meta?.other_docs?.filter((photo) => photo?.active)),
               // documentValue: leadData?.applicants?.[
               //   isActive
               // ]?.applicant_details?.document_meta?.other_docs?.filter((photo) => photo?.active),
               doc_stage: 'other_docs',
              },
            ]}
            page='upload'
            lead={leadData}
            setLeadData={setLeadData}
            field='applicant_details'
            open={open}
            setOpen={(value) => setOpen(value)}
            setRemarkData={setRemarkData}
            updateRemarks={updateRemarks}
            remarkData={remarkData}
            documents={documents}
            setDocuments={setDocuments}
            setStatusUpdate={setStatusUpdate}
            add_progress = {true}

          />

          <div className='h-[500px] w-full'></div>
        </div>
      </CustomTabPanel>
    </div>
  ) : (   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="ml-3 text-white font-medium">Loading...</p>
    </div>)}
     
    </>

  );
}

const Titlebar = ({ title, id, primaryApplicant, coApplicants, lead, onHandleReturn,pending,setApplicationForm }) => {
  const { setValues, setActiveIndex, setSalesforceID,values } = useContext(LeadContext);
  const { setPhoneNumberList, toastMessage, loData, setToastMessage, token } =
    useContext(AuthContext);

  const [totalProgress, setTotalProgress] = useState(0);
  const [allVerified, setAllVerified] = useState(false);
  const [leadData, setLeadData] = useState(null);
  const [sfdcPush, setSfdcPush] = useState({
    status: null,
    loader: false,
  });
 const [editIcon, setEditIcon] = useState(false);
  const [loading, setLoading] = useState(false);
  const[currentImg,setCurrentImg] = useState('');

  const [openExistingPopup, setOpenExistingPopup] = useState( false );

  const navigate = useNavigate();
  const [userBackNavigation, setUserBackNavigation] = useState('/dashboard');

  const[openAllForm,setOpenAllForm] = useState(false);
  const getLeadData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardLeadById(id, {
        headers: {
          Authorization: token,
        },
      });

      setLeadData(data);
      setTotalProgress(data?.lead?.extra_params?.progress);
    } catch (error) {
      console.error("Error fetching lead data:", error);
      // optionally show a toast or set an error state here
    } finally {
      setLoading(false); // always stop loader
    }
  };

  useEffect(() => {
    getLeadData();
    // if (loData?.user?.role === 'Branch Manager'){
    //   setUserBackNavigation('/branch-manager')
    // }

    console.log('I am the lead looking for', lead);
  }, [lead]);

  const handleOpenForm = async (id) => {
    const data = await getDashboardLeadById(id, {
      headers: {
        Authorization: token,
      },
    });

    setPhoneNumberList((prev) => {
      return {
        ...prev,
        applicant_0: data?.applicants?.[0]?.applicant_details?.mobile_number ?? '',
        applicant_1: data?.applicants?.[1]?.applicant_details?.mobile_number ?? '',
        applicant_2: data?.applicants?.[2]?.applicant_details?.mobile_number ?? '',
        applicant_3: data?.applicants?.[3]?.applicant_details?.mobile_number ?? '',
        applicant_4: data?.applicants?.[4]?.applicant_details?.mobile_number ?? '',
        reference_1: data?.reference_details?.reference_1_phone_number ?? '',
        reference_2: data?.reference_details?.reference_2_phone_number ?? '',
      };
    });

    const newApplicants = data.applicants.map((applicant) => {
      let accounts = [];
      if (applicant?.banking_details?.length) {
        accounts = applicant?.banking_details?.filter(
          (account) => !account?.extra_params?.is_deleted,
        );
      }

      return { ...applicant, banking_details: accounts };
    });

    setValues({ ...data, applicants: newApplicants });

    let primaryIndex = newApplicants
      .map((applicant, index) => (applicant.applicant_details.is_primary ? index : -1))
      .filter((index) => index !== -1);

    setActiveIndex(primaryIndex[0] ?? 0);

    navigate('/lead/applicant-details');
  };

  const sfdcPUSH = async () => {
    setSfdcPush({ ...sfdcPush, loader: true });

    try {
      //vijay uniyal changes on 5 Jun 2024 for service query submit process
      if (leadData.lead.applicant_type === 'C') {
        const serviceQueryResponse = await serviceQueryPushToSalesforce(leadData.lead.id, {
          headers: {
            Authorization: token,
          },
        });

           if (serviceQueryResponse?.salesforce_response?.service_query_sfdc_submit_pwa?.Message == 'Applicant addition not allowed post sanction. Please unlock CAM and do the needful.' && serviceQueryResponse?.salesforce_response?.service_query_sfdc_submit_pwa?.Status == 'Error') {      
                  await editFieldsById(     // bm submit request to push the case to BM
                    values?.lead?.id,
                    'lead',
                    {
                      bm_submit: false,
                      bm_submit_at: new Date(),
                      sfdc_count: 1,
                      sfdc_status: 'SFDC called but not fully Completed',
                      service_query_sfdc_submit_pwa: null
        
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
        
                  setFieldValue(
                    `lead.bm_submit`,
                    true,
                  );
                  setSalesForceSuccessIcon(false);
                  setSalesForceLoader(false);
                  return;
                }

        if (serviceQueryResponse.lead.sfdc_status === 'Complete') {
          setSalesforceID(leadData.lead.salesforce_application_id);
          setToastMessage('Data has been successfully pushed to the Salesforce');
          setSfdcPush({
            ...serviceQueryResponse,
            loader: false,
            status: serviceQueryResponse.lead.sfdc_status,
          });
        } else {
          setToastMessage('The data push to Salesforce has failed');
          setSfdcPush({ ...serviceQueryResponse, loader: false, status: 'Error' });
        }
      } else {
        const sfdc_res = await pushToSalesforce(leadData.lead.id, {
          headers: {
            Authorization: token,
          },
        });

        if (sfdc_res.lead.sfdc_status === 'Complete') {
          setSalesforceID(sfdc_res.salesforce_response.sfdc_submit_pwa.Application_Id);
          setToastMessage('Data has been successfully pushed to the Salesforce');
          setSfdcPush({ ...sfdcPush, loader: false, status: sfdc_res.lead.sfdc_status });
        } else {
          setToastMessage('The data push to Salesforce has failed');
          setSfdcPush({ ...sfdcPush, loader: false, status: 'Error' });
        }
      }
    } catch (err) {
      console.log(err);
         let message = err?.response?.data?.error || err?.response?.data?.message
        if (message == 'No Token 1 found'){
          setErrorMsg('Employee ID & Branch Name Is Mismatched. Please contact Itrust Admin')
        }else{
      setToastMessage('The data push to Salesforce has failed');
        }
      
      setSfdcPush({ ...sfdcPush, loader: false, status: 'Error' });
    }
  };

  useEffect(() => {
    console.log('here is the error data', leadData);
    leadData && setSfdcPush({ ...sfdcPush, status: leadData?.lead.sfdc_status });
  }, [leadData]);
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  console.log('leadData', leadData?.lead?.applicant_type);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isModalOpen3, setIsModalOpen3] = useState(false);

  // const data = {
  //   primaryApplicant: [
  //     {
  //       tableName: 'Personal Details',
  //       messages: ['Name not matched', 'Phone number is incorrect'],
  //     },
  //     {
  //       tableName: 'Work & Income Details',
  //       messages: ['The person is self-employed'],
  //     },
  //     {
  //       tableName: 'Property Details',
  //       messages: ['You have uploaded wrong property details'],
  //     },
  //   ],
  //   coApplicant: [
  //     {
  //       tableName: 'Personal Details',
  //       messages: ['Date of birth is missing', 'Email address is invalid'],
  //     },
  //     {
  //       tableName: 'Work & Income Details',
  //       messages: ['Income exceeds the limit'],
  //     },
  //     {
  //       tableName: 'Property Details',
  //       messages: ['Property documents are incomplete'],
  //     },
  //   ],
  // };

  const data = {
    primaryApplicant: primaryApplicant,
    coApplicants: coApplicants,
    general_remarks: leadData?.lead?.bm_remarks,
  };

  const checkAllVerified = () => {


    // ** IN case of lead by pass to directly submit to salesforce the verified will be true so it can be submitted to SF dirdctly


    console.log("I AM LEAD ,",leadData?.lead)

    if(lead_by_pass == true) {
      setAllVerified(true);
      return;
    }



    const fields = [
      'applicant_details',
      'personal_details',
      'address_detail',
      'work_income_detail',
      'property_details',
      'banking_details',
      'upload_documents',
    ];

    let verified = true;

    lead?.applicants?.forEach((applicant) => {
      fields?.forEach((field) => {
        console.log('TARGET', applicant?.[field]);

        if (field == 'property_details') {
          if (lead?.property_details?.bm_status === null) {
            verified = false;
          }
        }

        if (field == 'upload_documents') {
          if (applicant?.applicant_details?.upload_bm_status === null) {
            verified = false;
          }
        } else {
          if (applicant?.[field]?.bm_status === null) {
            verified = false;
            console.log('I am the verified', applicant?.[field]?.bm_status);
          }
        }
      });
    });

    setAllVerified(verified);

    if(verified == true){
      setApplicationForm(true)
    }

    console.log('I am verifiedData', verified);

    console.log('I am the targeted data', leadData);
  };

  useEffect(() => {
    checkAllVerified();

    console.log('I am the final;', lead);
  }, [lead]);


  const[forms,setForms] = useState([]);

  useEffect(()=>{

    const applicants = lead?.applicants || [];

    let copy_arr = [];

    for(const app of applicants) {

      const meta = app?.applicant_details?.document_meta?.application_form?.filter((form)=>form?.active)?.[0]?.document_fetch_url;

      copy_arr.push({document_fetch_url:meta})
      
    } 

    setForms(copy_arr);

  },[lead])

   if (loading) {
    // Show loader until API calls finish
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-white font-medium">Loading...</p>
      </div>)
    }

  return (
    <>
      <>

{openAllForm &&<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white border border-black w-[90vw] h-[80vh] rounded-lg p-6 relative shadow-xl">
        <button
          className="absolute top-3 right-4 text-black text-lg"
          onClick={()=>setOpenAllForm(false)}
        >
          ?
        </button>

        
             <div className="relative w-full z-10 mt-10">
      {/* Your target div */}

      {/* Floating "Open" button */}
  <button
  className="absolute top-2 right-2 bg-white border border-gray-300 rounded px-2 py-1 flex items-center gap-1 text-sm shadow hover:scale-105 hover:shadow-md transition text-gray-400 hover:text-gray-800"
 onClick={(e)=>{
        e?.stopPropagation();

        console.log("CURRENT IMG",currentImg)
        window.open(currentImg);
      }}
>
  
  Maximize
  <span className="text-lg">?</span>
</button>
    </div>

                <div className='mt-20'>

         <SecureImage
          imageUrl={forms}
          token={token}
          is_pdf={
          Array.isArray(forms) &&
          forms.some(
          (item) =>
          typeof item?.document_fetch_url === 'string' &&
          item?.document_fetch_url.endsWith('.pdf'),
          )
          }
          doc_stage='application_form'
          after_submit = {true}
          setCurrentImg = {setCurrentImg}
        />


                          </div>

      </div>
    </div>}

        {isModalOpen && ( // currently working
          <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white w-full h-full md:w-3/4 md:h-auto lg:w-1/2 rounded-lg p-3 overflow-y-auto max-h-screen'>
              <ApplicantSection
                data={data}
                lead={leadData}
                setLeadData={setLeadData}
                disabled={loData.user.role == 'Loan Officer' ? true : false}
              />

              <div className='mt-4 flex justify-center'>
                <button
                  className='border border-black text-sm text-black px-4 py-1 rounded-md'
                  onClick={() => {
                    console.log('I am co Applicants', coApplicants);

                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isModalOpen2 && (
          <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white w-full h-full md:w-3/4 md:h-auto lg:w-1/2 rounded-lg p-3 overflow-y-auto max-h-screen'>

            {allVerified || lead_by_pass?  <MarkStatus
                data={data}
                close={setIsModalOpen2}
                lead={leadData}
                setLeadData={setLeadData}
                onHandleReturn={onHandleReturn}
              ></MarkStatus>:
              
              
              <DynamicDrawer
              open={openExistingPopup}
              setOpen={setOpenExistingPopup}
              onClose={() => {
              //  setClicked(false)
                setOpenExistingPopup(false)
              }
                
                } // Ensure onClose is defined
              height="80vh"
            >
              <div className='flex flex-col items-center h-full'>
          <span className='w-full font-semibold text-[14px] leading-[21px]'>
            Please complete pending fields to proceed.
          </span>
          <div className='flex flex-col flex-1 w-full gap-[7px] overflow-auto mt-[10px] mb-[10px]'>

            {Object?.keys(pending?.primary)?.length !== 0 && <h2 className='w-full font-semibold text-[20px] leading-[21px]'>Primary Applicant</h2>}
            {Object.keys(pending?.primary).map((section) => (
              <div key={section} className='mb-4'>
                <h3 className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>{section.replace(/_/g, ' ')}</h3>
                {/* <div className='flex flex-col'>
                  {keys.length > 0 ? (
                    keys.map((key, index) => (
                      <div key={index} className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                        <span className='text-[12px] font-bold text-[#727376]'>{key.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>
                    ))
                  ) : (
                    <div className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                      <span className='text-[12px] font-bold text-[#727376]'>ALL MANDATORY FIELDS ARE BLANK</span>
                    </div>
                  )}
                </div> */}
              </div>
            ))}

            {Object?.keys(pending?.coApplicants)?.map((coapp) => {

              return(
              <div>

                {Object?.values(pending?.coApplicants?.[coapp])?.length !== 0 && <h2 className='w-full font-semibold text-[20px] leading-[21px]'>{coapp}</h2>}

            {Object.keys(pending?.coApplicants?.[coapp]).map((section) => (
              <div key={section} className='mb-4'>
                <h3 className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>{section.replace(/_/g, ' ')}</h3>
                {/* <div className='flex flex-col'>
                  {keys.length > 0 ? (
                    keys.map((key, index) => (
                      <div key={index} className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                        <span className='text-[12px] font-bold text-[#727376]'>{key.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>
                    ))
                  ) : (
                    <div className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                      <span className='text-[12px] font-bold text-[#727376]'>ALL MANDATORY FIELDS ARE BLANK</span>
                    </div>
                  )}
                </div> */}
              </div>
            ))}
              </div>
              )
            })
          }
          </div>
          <div className='w-full flex gap-4 mt-6 justify-center items-center'>
            <Button inputClasses='w-full h-[46px]'      style={{ backgroundColor: 'rgb(227, 52, 57,0.9)', color: 'white' }} 
onClick={() => {
            // setClicked(false)
              setOpenExistingPopup(false)

              setIsModalOpen2(false)

            }}>
              Close
            </Button>
          </div>
        </div>
              
              
              
              
              </DynamicDrawer>}
            
            </div>
          </div>
        )}
        {isModalOpen3 && (
          <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white w-full md:w-3/4 md:h-auto lg:w-xl rounded-lg p-3 overflow-y-auto max-h-screen'>
              <ViewRemarks lead={leadData}></ViewRemarks>
              {/* <MarkStatus
                data={data}
                close={setIsModalOpen2}
                lead={leadData}
                setLeadData={setLeadData}
                onHandleReturn={onHandleReturn}
              ></MarkStatus> */}
              <div className='mt-4 flex justify-center'>
                <button
                  className='border border-black text-sm text-black px-4 py-1 rounded-md'
                  onClick={() => {
                    setIsModalOpen3(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
      <ToastMessage
        message={toastMessage}
        setMessage={setToastMessage}
        error={sfdcPush.status !== 'Complete' ? true : false}
      />

      <div
        id='titlebar'
        className='sticky inset-0 bg-neutral-white h-fit flex px-4 py-3 border border-[#ECECEC]'
      >

        
        <button
          className='p-0 mr-3 self-start'
          onClick={() => navigate('/branch-manager')}
          disabled={sfdcPush.loader}
        >
          {sfdcPush.loader ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              fill='none'
              viewBox='0 0 24 24'
            >
              <g>
                <rect
                  width='24'
                  height='24'
                  fill='#FEFEFE'
                  rx='12'
                  transform='matrix(1 0 0 -1 0 24)'
                ></rect>
                <path
                  stroke='#96989A'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M15 18l-6-6 6-6'
                ></path>
              </g>
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              fill='none'
              viewBox='0 0 24 24'
            >
              <g>
                <rect
                  width='24'
                  height='24'
                  fill='#FEFEFE'
                  rx='12'
                  transform='matrix(1 0 0 -1 0 24)'
                ></rect>
                <path
                  stroke='#373435'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.5'
                  d='M15 18l-6-6 6-6'
                ></path>
              </g>
            </svg>
          )}
        </button>
        <div className='flex-1'>
          <h3 className='w-[200px] truncate'>{title}</h3>
          <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            LEAD ID:
            <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
              {id}
            </span>
          </p>
        </div>

 
        <div className='flex justify-end gap-2 items-center'>

    {lead?.lead?.sfdc_status == 'Complete' &&<button className="w-[32px] h-[47px] bg-transparent p-0 hover:opacity-90 active:scale-95"
    onClick={()=>{setOpenAllForm(true)}}>
  <img
    src="/FORM BUTTON.png"
    alt="file icon"
    className="w-full h-full object-contain"
  />
</button>}
          {leadData?.lead && (
            <span className='cursor-pointer' onClick={() => setIsModalOpen3(true)}>
              <svg
                fill='#000000'
                height='25px'
                width='25px'
                version='1.1'
                id='Layer_1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox='0 0 511.999 511.999'
              >
                <g id='SVGRepo_bgCarrier' strokeWidth='0' />
                <g id='SVGRepo_tracerCarrier' strokeLinecap='round' strokeLinejoin='round' />
                <g id='SVGRepo_iconCarrier'>
                  <g>
                    <g>
                      <path d='M509.361,249.401c-0.771-1.927-19.335-47.719-59.326-93.862C396.198,93.42,329.101,60.585,255.999,60.585 S115.802,93.42,61.964,155.54c-39.99,46.143-58.555,91.935-59.326,93.862L0,255.999l2.639,6.598 c0.771,1.927,19.335,47.719,59.326,93.862c53.837,62.119,120.933,94.955,194.035,94.955s140.198-32.836,194.035-94.955 c39.99-46.143,58.555-91.935,59.326-93.862l2.639-6.598L509.361,249.401z M423.186,333.189 c-47.556,54.872-103.806,82.695-167.186,82.695c-63.056,0-119.073-27.555-166.492-81.897 c-27.892-31.964-44.602-64.427-50.95-78.004c6.256-13.426,22.639-45.309,50.256-77.173 c47.556-54.872,103.806-82.695,167.186-82.695c63.056,0,119.073,27.555,166.492,81.897c27.897,31.97,44.609,64.44,50.95,78.003 C467.186,269.442,450.803,301.325,423.186,333.189z' />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path d='M255.999,131.644c-68.569,0-124.355,55.786-124.355,124.355s55.786,124.355,124.355,124.355 s124.355-55.786,124.355-124.355S324.569,131.644,255.999,131.644z M255.999,344.824c-48.978,0-88.825-39.847-88.825-88.825 s39.847-88.825,88.825-88.825c48.978,0,88.825,39.847,88.825,88.825C344.824,304.977,304.977,344.824,255.999,344.824z' />
                    </g>
                  </g>
                  <g>
                    <g>
                      <path d='M202.704,255.999h35.53c0-9.796,7.969-17.765,17.765-17.765v-35.53C226.613,202.704,202.704,226.613,202.704,255.999z' />
                    </g>
                  </g>
                </g>
              </svg>
            </span>
          )}
          
          {leadData?.lead?.bm_submit == true && leadData?.lead?.sfdc_status !== 'Complete' && (
            <span className='cursor-pointer' onClick={() => setIsModalOpen(true)}>
              <svg
                fill='#000000'
                height='25px'
                width='25px'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox='0 0 27.442 27.442'
                xmlSpace='preserve'
              >
                <g>
                  <path d='M19.494,0H7.948C6.843,0,5.951,0.896,5.951,1.999v23.446c0,1.102,0.892,1.997,1.997,1.997h11.546c1.103,0,1.997-0.895,1.997-1.997V1.999C21.491,0.896,20.597,0,19.494,0z M10.872,1.214h5.7c0.144,0,0.261,0.215,0.261,0.481s-0.117,0.482-0.261,0.482h-5.7c-0.145,0-0.26-0.216-0.26-0.482C10.612,1.429,10.727,1.214,10.872,1.214z M13.722,25.469c-0.703,0-1.275-0.572-1.275-1.276s0.572-1.274,1.275-1.274c0.701,0,1.273,0.57,1.273,1.274S14.423,25.469,13.722,25.469z M19.995,21.1H7.448V3.373h12.547V21.1z' />
                </g>
              </svg>
            </span>
          )}

          {/* final verify starting */}

          {/* allVerified && */}
          {
          leadData?.lead?.bm_submit == true &&
          leadData?.lead?.sfdc_status !== 'Complete' ? (
            <span className='cursor-pointer' onClick={() => {
              
              
              setIsModalOpen2(true)

              if(!allVerified || allVerified == false) {
                setOpenExistingPopup(true)
              }
            
            }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='25'
                height='25'
                fill='black'
                viewBox='0 0 16 16'
              >
                <g>
                  <g stroke='black' stroke-width='1.5'>
                    <ellipse
                      cx='6.667'
                      cy='11.667'
                      stroke-linejoin='round'
                      rx='4.667'
                      ry='2.333'
                    ></ellipse>
                    <ellipse
                      cx='6.667'
                      cy='4.667'
                      stroke-linejoin='round'
                      rx='2.667'
                      ry='2.667'
                    ></ellipse>
                    <path stroke-linecap='round' d='M13.999 7.333h-2.667'></path>
                    <path stroke-linecap='round' d='M12.668 6v2.667'></path>
                  </g>
                </g>
              </svg>
            </span>
          ) : (
            ''
          )}

          {/* final verify ending */}
        </div>

        {/* {leadData && (
          <button>
            {!sfdcPush.loader &&
              leadData?.lead.sfdc_count !== 0 &&
              leadData?.lead.sfdc_count <= 4 &&
              (sfdcPush.status === 'Complete' ? (
                <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M5.843 17.372C4.273 17.372 3 16.099 3 14.529C3 12.959 4.273 11.686 5.843 11.686C5.843 8.546 8.389 6 11.529 6C13.879 6 15.895 7.426 16.762 9.46C17.051 9.394 17.349 9.351 17.658 9.351C19.873 9.351 21.668 11.146 21.668 13.361C21.668 15.576 19.873 17.371 17.658 17.371'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M16 14L11.1875 19L9 16.7273'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              ) : (
                <div
                  onClick={() => sfdcPUSH()}
                  className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-primary-red'
                >
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
                      stroke='#E33439'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
                      stroke='#E33439'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              ))}

            {sfdcPush.loader ? (
              <div className='ml-auto'>
                <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
              </div>
            ) : null}

            {leadData.lead.sfdc_count > 4 && leadData.lead.sfdc_status !== 'Complete' && (
              <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4'>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g opacity='0.6'>
                    <path
                      d='M17.658 15.371C19.873 15.371 21.668 13.576 21.668 11.361C21.668 9.146 19.873 7.351 17.658 7.351C17.349 7.351 17.051 7.393 16.762 7.46C15.896 5.426 13.879 4 11.529 4C8.389 4 5.843 6.546 5.843 9.686C4.273 9.686 3 10.959 3 12.529C3 14.099 4.273 15.372 5.843 15.372M14.355 13.022L9.368 18.009M15.387 15.516C15.387 17.4634 13.8084 19.042 11.861 19.042C9.91364 19.042 8.335 17.4634 8.335 15.516C8.335 13.5686 9.91364 11.99 11.861 11.99C13.8084 11.99 15.387 13.5686 15.387 15.516Z'
                      stroke='#96989A'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </g>
                </svg>
              </div>
            )}

            {leadData.lead.sfdc_count > 4 && leadData.lead.sfdc_status === 'Complete' ? (
              <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M5.843 17.372C4.273 17.372 3 16.099 3 14.529C3 12.959 4.273 11.686 5.843 11.686C5.843 8.546 8.389 6 11.529 6C13.879 6 15.895 7.426 16.762 9.46C17.051 9.394 17.349 9.351 17.658 9.351C19.873 9.351 21.668 11.146 21.668 13.361C21.668 15.576 19.873 17.371 17.658 17.371'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeMiterlimit='10'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M16 14L11.1875 19L9 16.7273'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            ) : null}
          </button>
        )} */}

        <button
          className='ml-4 '
          onClick={() => handleOpenForm(id)}
          disabled={
            primaryApplicant?.applicant_details?.extra_params?.eligibility &&
            leadData?.lead?.applicant_type !== 'C'
          }
        >
          {/* {(primaryApplicant?.applicant_details?.extra_params?.eligibility &&  leadData?.lead?.applicant_type !== 'C')? (
            <EditIcon />
       
          ) : (
            <EditLeadEnabled />
          )} */}
        </button>
      </div>
    </>
  );
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index ? children : null}
    </div>
  );
}

const FormDetails = React.forwardRef(function FormDetails(
  {
    title,
    progress = 0,
    data,
    message,
    className,
    page,
    id,
    lead,
    setLeadData,
    field,
    open,
    setOpen,
    setRemarkData,
    updateRemarks,
    documents,
    setDocuments,
    setStatusUpdate,
    add_progress
  },
  ref,
) {
    console.log("?? ~ lead:", lead)
  const { token } = useContext(AuthContext);

  const [tokenCookie, setTokenCookie] = useCookies(['user']);

  const { activeIndex, isActive } = useContext(LeadContext);

  // const[currentLead,setCurrentLead] = useState(lead || { applicants: []})

  const [forceRender, setForceRender] = useState(false); // to handle unexpected skip renders

  const [selected, setSelected] = useState({ id: 0, document_fetch_url: '' });

  const [docVerify, setDocVerify] = useState(null);

  const [modalUpdate, setModalUpdate] = useState({ update: null, value: '', page: '', id: '' });

  const [bankingPrimary, setBankingPrimary] = useState(0);

  const[disableField,setDisableField] = useState(false);

  const[toBeChecked,setToBeChecked] = useState(false)

// edge cases handling where progress is not 100 percent even after lo submit






  function checkAdditionalProgress () {

    let check_all = true;




    //extra params fetch

    let extra_params;

    let id;

    if(field == "property_details") {
      extra_params = {...lead?.property_details?.extra_params}

      id = lead?.property_details?.id;

      console.log("PROPERTY param check",lead?.property_details?.extra_params)
    }

    else if(page == "upload") {
      extra_params = {...lead?.applicants?.[isActive]?.applicant_details?.extra_params};

      id = lead?.applicants?.[isActive]?.applicant_details?.id
    }

    else {
     extra_params = {...lead?.applicants?.[isActive]?.[field]?.extra_params};

     id = lead?.applicants?.[isActive]?.[field]?.id;
    }



    if(extra_params && extra_params?.required_fields_status) {  

      let keys;

      if(page == 'upload') {
        keys =  Object?.keys(extra_params?.upload_required_fields_status)
      }

      else {
        keys = Object?.keys(extra_params?.required_fields_status);
      }

 
    for(const key of keys) {
      if(page == 'upload') {

        if(extra_params?.upload_required_fields_status?.[key] == false) {

          if(lead?.lead?.bm_submit == false || !lead?.lead?.bm_submit) {
            check_all = false;
            break;
          }

        }
      }

      else {

        if(extra_params?.required_fields_status?.[key] == false) {

          if(field == 'property_details') {

            if(lead?.property_details?.[key] == null || lead?.property_details?.[key] == "") {
              check_all = false;
              break;
            }
          }

          else {

            if(lead?.applicants?.[isActive]?.[field]?.[key] == null || lead?.applicants?.[isActive]?.[field]?.[key] == "") {

              if(key == 'ongoing_emi') {
  
                if(lead?.applicants?.[isActive]?.work_income_detail?.no_current_loan == null) {
                  check_all = false;
              break;
                }
              }
  
              else if(key == 'no_current_loan') {
                if(lead?.applicants?.[isActive]?.work_income_detail?.no_current_loan == null) {
                  check_all = false;
              break;
                }
              }
              else {
                check_all = false;
                break;
              }
            }
          }
      
        }
      }

    }

    // update progress if check all is true but progress is mismatched ** done to handle if any rejections from BM is done

    let progress;

    if(page == 'upload') {
      progress = extra_params?.upload_progress
    }

    else {
      progress = extra_params?.progress
    }


    console.log("EXTRA PARAMS >?>",page == "address"&&extra_params)

    if((check_all == true && progress !== 100) || lead?.applicants?.[isActive]?.applicant_details?.isApproved == true || (page == "address" && progress !== 100 && lead?.lead?.bm_submit == true) || (page == "property" && progress !== 100 && lead?.lead?.bm_submit == true)) {

      if(page == 'upload') {
        extra_params.upload_progress = 100;
      }

      else {
        extra_params.progress = 100;
      }

      try{
        const updatedData = editFieldsById(id,page == 'upload'?'applicant':page,{extra_params:extra_params},{headers:{
          Authorization:token
        }})

        if(page == "address" && progress !== 100 && lead?.lead?.bm_submit == true){
              setToBeChecked(true);
              return;

        }

              if(page == "property" && progress !== 100 && lead?.lead?.bm_submit == true){
              setToBeChecked(true);
              return;

        }
        
      }
      catch(err) {
        console.log(err)
      }
      }

    setToBeChecked(check_all)
    }




  }


  useEffect(()=>{
    checkAdditionalProgress(),[field,isActive,lead]})

  useEffect(() => {
    // setting cookies for faceliveness video url

    if (page == 'upload') {
      console.log('DATA?>>>>>', data);
    }

    if (data && data?.length) {
      data?.forEach((element) => {
        if (element?.label == 'Face liveness') {
          console.log('DATA>>>>', element);

          setTokenCookie('user', element?.documentValue?.result?.videoVerification?.video, {
            path: '/', // Available across your entire app
            maxAge: 3600, // Token expiration in seconds (1 hour)
            secure: true, // Ensure cookie is only sent over HTTPS
            sameSite: 'Strict', // Restricts cookie to same site
          });
        }
      });
    }
  }, [lead]);

    // Check if already verified fields on resubmission



    useEffect(()=> {

      isDisabled({field:field,page:page})

    },[lead?.applicants,isActive])


    useEffect(()=> {

      console.log("ACTIVEEE",isActive)
    },[isActive])

    const isDisabled = (object) => {

      const applicant = lead?.applicants?.[isActive]?.applicant_details;



      console.log("APPLICANT",applicant?.isApproved)


      // if approved flag is trigerred it will direcly disabled all fields ** new change 13/12

      if(applicant?.isApproved === true) {
        setDisableField(true);

        return
      }   

      else {
        setDisableField(false)
      }
  
      let if_verified;
  
  
      if(object?.page == 'property') {
  
        if_verified =  lead?.property_details?.bm_status;
      }
  
      else if(object?.page == 'banking') {

        if_verified   = lead?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status;
        
      }
  
      else if(object?.page == 'upload') {
        if_verified = lead?.applicants?.[isActive]?.applicant_details?.upload_bm_status;
  
      }
  
      else {
        if_verified   = lead?.applicants?.[isActive]?.[object?.field]?.bm_status
      }


      if(page == 'applicant') {
        console.log("ACTIVE",if_verified)

      }
  
      const pages = applicant?.resumbit_fields || {};
  
  
      if(lead?.lead?.reject_count>0) {     
        
        console.log("CONDITION",pages?.hasOwnProperty(page))
  
        if(pages?.hasOwnProperty(page) == false && if_verified !== null) {
          
          setDisableField(true)
        }
    
        else {
          setDisableField(false)
        }
      }
  
    }
  

  const handleOpen = () => {
    setOpen(true);
  };

  const onHandleVerifyDocument = (value) => {
    let filteredDocs = document.filter((docs) => {
      return docs.document_type == value;
    });
  };

  useEffect(() => {
    console.log('Final Lead', lead);
  }, [lead]);

  useEffect(() => {
    let tempVerified = true; // Default to true initially

    if (data && data.length > 0) {
      for (const element of data) {
        const bmStatus = element?.documentValue?.bm_status;

        if (element?.label !== 'Face liveness') {

          if(element?.label =="Other documents") {

            if(Object.keys(element?.documentValue)?.length) {

              let existing_meta = lead?.applicants?.[isActive]?.applicant_details?.document_meta;

              let activeOnes = existing_meta?.other_docs?.filter((doc)=>doc?.active == true)

              activeOnes.forEach((chunk) => {
    
                  if (chunk?.bm_status == null) {
                    tempVerified = null;
                  }
    
                  else if(chunk?.bm_status == false) {
                    tempVerified = false;
                    return;
                  }
                });
              
            }
          }
          else {
            if (element?.documentValue?.length) {
              element?.documentValue?.forEach((chunk) => {
  
                if (chunk?.bm_status == null) {
                  tempVerified = null;
                }
  
                else if(chunk?.bm_status == false) {
                  tempVerified = false;
                  return;
                }
              });
            }
          }  // need to put in
          
        }

        // else {
        //    if (element?.documentValue?.bm_status === null || element?.documentValue?.bm_status === false) {
        //   tempVerified = null;
        //   console.log("I am making null", element?.documentValue);
        //   break; // Exit early if any document is unverified
        // }
        // }

        // Only check the status if documentValue exists
        // if (element?.documentValue?.bm_status === null || element?.documentValue?.bm_status === false) {   ** COMMENTED FOR TESTING
        //   tempVerified = null;
        //   console.log("I am making null", element?.documentValue);
        //   break; // Exit early if any document is unverified
        // }
      }
    }

    if (page == 'upload') {
      console.log('I am trigerred the doc section', data);
    }

    setDocVerify(tempVerified); // Update docVerify based on the status
  }, [lead, isActive]); // Add data to the dependency array

  const onHandleDocumentUpadte = (values, stage) => {
    let meta_doc = lead?.applicants?.[isActive]?.applicant_details?.document_meta;

    const applicant_id = lead?.applicants?.[isActive]?.applicant_details.id;

    let updated = JSON.parse(JSON.stringify(meta_doc)); // Deep copy of meta_doc

    // Object.keys(updated).forEach((key) => {
    //   updated[key].forEach((element) => {
    //     if (element.id === id) {
    //       console.log('I am the element', element);
    //       element.bm_status = true;
    //     }
    //   });
    // });

    if(stage == 'banking_docs') {

      const banking_details = lead?.applicants?.[isActive]?.banking_details.filter((bank)=>!bank.extra_params)[0]
      
      const bank_id = banking_details?.id;

       editFieldsById(bank_id,'banking',{bm_status:true},  {
        headers: {
          Authorization: token,
        },
      },)

      banking_details.bm_status = true;

      let index;
      lead?.applicants?.[isActive]?.banking_details?.forEach((bank,i)=> {

        if(!bank?.extra_params) {
          index = i;
          return;
        }
      })

      let updated = {...lead};


      updated.applicants[isActive].banking_details[index] = banking_details;

      setLeadData(updated)


      return;

    }


    

    let newValues = values?.map((value) => {
      value.bm_status = true;

      return value;
    });

    if (updated[stage]) {
      updated[stage] = newValues;
    }

    try {
      let api_call = editFieldsById(
        applicant_id,
        'applicant',
        { document_meta: updated },
        {
          headers: {
            Authorization: token,
          },
        },
      ); // db update for bm status depending on yes or no
      console.log('I am respo', api_call);
    } catch (error) {
      console.log('Heyerror', error);
    }

    let updatedLead = { ...lead };

    // Check if all necessary properties exist, if not, initialize them
    if (updatedLead.applicants?.[isActive]) {
      if (!updatedLead.applicants[isActive].applicant_details) {
        updatedLead.applicants[isActive].applicant_details = {}; // Initialize applicant_details if undefined
      }

      // Now assign the updated value to document_meta
      updatedLead.applicants[isActive].applicant_details.document_meta = updated;
    }

    setLeadData(updatedLead); // Set the updated state

    console.log('I am updated one', updated);
  };





  const onHandleVerify = async (value, page, id,remarks) => {

    console.log("I am the page called",page);


    const reject_count = lead?.lead?.reject_count

    let exising_pages = lead?.applicants?.[isActive]?.applicant_details?.resumbit_fields || {};

    if(reject_count>0) {

      exising_pages[page] = true;

      await editFieldsById(lead?.applicants?.[isActive]?.applicant_details.id,'applicant',{resumbit_fields:exising_pages},{
        headers: {
            Authorization: token,
        },
    })
    }


    const applicant_detail = lead?.applicants?.[isActive]?.applicant_details;

    let banking_index = 0;

    // const data = await axios.patch(`http://localhost:8005/api/${page}/bm_verify/${id}`,{bm_status:value,id:id},{
    //   headers: {
    //     Authorization: token,
    //   },
    // });    // db update for bm status depending on yes or no
    try {
      console.log('i am the page', page);




      // if (['applicant', 'personal', 'address',"work-income"].includes(page) && value === false) {

      //   applicant_detail.extra_params.qualifier = false;
      //   applicant_detail.extra_params.eligibility = false;
      //   applicant_detail.bre_101_response = null;
      //   // resetLeadQualifier(applicant_detail?.id,{
      //   //   extra_params:applicant_detail.extra_params,
      //   //   bre_101_response:null
      //   // },{
      //   //   headers: {
      //   //       Authorization: token,
      //   //   }
      //   // })



      // }

      // else if(!['applicant', 'personal', 'address',"work-income"].includes(page) && value === false){
      //   applicant_detail.extra_params.eligibility = false;

      //       // resetLeadQualifier(applicant_detail?.id,{
      //       //   extra_params:applicant_detail.extra_params,
      //       // },{
      //       //   headers: {
      //       //       Authorization: token,
      //       //   }
      //       // })

      // }


      console.log("I am the props",page,id)

      if(page === 'upload') {

        let body = {upload_bm_status:value}

        if(value === true) {
          body.upload_bm_remarks = ""
        }
        const data = editFieldsById(applicant_detail?.id, 'applicant',body, {
          headers: {
              Authorization: token,
          },
      });
      }

      else if(page === 'property') {

        let body = {bm_status:value}

        if(value === true) {
          body.bm_remarks = ""
        }

        const data = editPropertyById(lead?.property_details?.id,body, {
          headers: {
              Authorization: token,
          },
      });

      console.log("I am the response",data)
      }

      else if(page === 'banking') {
        
        let body = {bm_status:value}

        if(value === true) {
          body.bm_remarks = ""
        }

        // const banking_id = lead?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.id

        const banking_id = data?.[0]?.id
      

        if(lead?.applicants?.[isActive]?.banking_details?.length) {

          let banking_data = lead?.applicants?.[isActive]?.banking_details

          banking_data?.forEach((bank,index)=> {
            if(bank?.id == banking_id) {
              banking_index = index;
            }
          })
        
          
        }



        const updated = editFieldsById(banking_id, 'banking',body, {
          headers: {
              Authorization: token,
          },
      });


      console.log("data>>>",data)

      }

      else {

        let body = {bm_status: value}

        if(value === true) {      // clear remarks if any ** resubmission case    ** changed line
          body.bm_remarks = ""
        }
        const data = editFieldsById(id, page, body, {
          headers: {
              Authorization: token,
          },
      });
      }


    // if(value === true) {

    //   if(page === 'upload') {
    //     updateRemarks('', value, applicant_detail?.id, page);

    //   }
    //   else {
    //     updateRemarks('', value, id, page);
    //   }
    // }

    
  //   const updatedLead = {
  //     ...lead, // Spread the existing lead data
  //     applicants: lead.applicants.map((applicant, index) => {
  //         // Check if this is the active applicant being updated
  //         if (index === isActive) {
  //             return {
  //                 ...applicant, // Spread the existing applicant data
  //                 [field]: {
  //                     ...applicant[field], // Spread the existing field data
  //                     ...(page === 'upload' 
  //                         ? { upload_bm_status: value } // If page is 'upload', update upload_bm_status
  //                         : page === 'banking' 
  //                           ? {
  //                               // Find the primary applicant and update their bm_status
  //                               ...applicant[field].map(item => 
  //                                   item.is_primary ? { ...item, bm_status: value } : item
  //                               )
  //                             }
  //                         : { bm_status: value } // Otherwise, update bm_status
  //                     )
  //                 }
  //             };
  //         }
  //         return applicant; // Return unchanged applicants
  //     })
  // };


  let updatedLead;

  if(page == 'banking') {


    let leadCopy  = {...lead}


    leadCopy.applicants[isActive].banking_details[banking_index].bm_status = value;
    leadCopy.applicants[isActive].banking_details[banking_index].bm_remarks = remarks;

    updatedLead = leadCopy;


  }

  else {  
   updatedLead = { 
    ...lead, // Spread the existing lead data
    ...(page === 'property' 
      ? { property_details: { 
          ...lead.property_details, // Spread existing property_details
          bm_status: value, // Update bm_status
          ...(value === true && { bm_remarks: "" }) // Only update bm_remarks to "" if value is true
        }}
      : {
          applicants: lead.applicants.map((applicant, index) => {
            // Check if this is the active applicant being updated
            if (index === isActive) {
              return {
                ...applicant, // Spread the existing applicant data
                [field]: Array.isArray(applicant[field]) // Ensure that the field is an array
                  ? applicant[field].map((item, idx) => 
                      idx === 0
                        ? { 
                            ...item, 
                            bm_status: value, // Update bm_status for the first item in the array
                            ...(value === true && { bm_remarks: "" }) // Update bm_remarks if value is true
                          }
                        : item // Return the other items unchanged
                    )
                  : {
                      ...applicant[field], // Spread the existing field data if it's not an array
                      ...(page === 'upload' 
                        ? { 
                            upload_bm_status: value, // If page is 'upload', update upload_bm_status
                            ...(value === true && { bm_remarks: "" }) // Update bm_remarks if value is true
                          }
                        : { 
                            bm_status: value, // Otherwise, update bm_status for the given field
                            ...(value === true && { bm_remarks: "" }) // Update bm_remarks if value is true
                          }
                      )
                  }
              };
            }
            return applicant; // Return unchanged applicants
          })
        }
    )
  };
  console.log("I am the updated lead data",updatedLead)

}


if(reject_count > 0 ) {

updatedLead.applicants[isActive].applicant_details.resumbit_fields = exising_pages;

}

    
    // Update the state with the new object
    setLeadData(updatedLead);

    
    console.log("Updated lead data:>>>>>", updatedLead);


  
      setForceRender(!forceRender);
    } catch (error) {
      console.log(error);
    }

    // setFieldValue(`applicants${[activeIndex]}.${page}.bm_status`,value) // updating local state of bm_status
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('closing called');

    setIsModalOpen(false);
  };

  useEffect(()=> {

    if(isModalOpen == false){
      sessionStorage.setItem('isOpen',false)
    }

  },[isModalOpen])

  const openFaceLiveness = async () => {
    const isBMAuthenticated = true; // Replace this with your context value
    
    let url;

    if(lead?.applicants?.[isActive]?.applicant_details?.faceliveness_response?.result?.["score"]) {

      // fetch the secured url itrust and open in a new tab**

      try {

        const response = await axios.get(lead?.applicants?.[isActive]?.applicant_details?.faceliveness_response?.videoUrl, {
          headers: {
            Authorization: `${token}`,
          },
          responseType: "blob", // Ensures response is treated as a Blob
        });

  
        const blobUrl = URL.createObjectURL(response.data);

        url = blobUrl;
      }

      catch(err) {
        console.log("**ERROR FETCHING LIVE IMAGE **",err)
      }
      // url = lead?.applicants?.[isActive]?.applicant_details?.faceliveness_response.result.videoUrl
    }

    else {
    url = new URL(
      window.location.origin + `/verify-video?isBMAuthenticated=${isBMAuthenticated}`,
    );
    }
    
    //window.open(url, '_blank');

    if (url) {
      window.open(url, "_blank");
    } else {
      console.error("No valid URL found for opening.");
    }
  };

  useEffect(() => {
    console.log('LLLLLEAD', lead);
  }, [lead]);



  const handleOtherDocuments = async() => {

    let existing_meta = structuredClone(lead?.applicants?.[isActive]?.applicant_details?.document_meta)

    const type = "other_docs"

    let multiple = false;

    if(selected?.document_fetch_url?.length>1) {
      multiple = true;
    }

    let index;

    
    existing_meta?.[type]?.forEach((ele,i)=> {

      if(multiple) {

        selected?.document_fetch_url?.forEach((ind)=> {

          if(ele?.id == ind?.id) {
            ele.bm_status = true;
            ele.bm_remarks = "";
          }
        })
      }

      else {
      if(ele?.id == selected?.document_fetch_url?.[0]?.id) {
        index = i;
      }
    }
    })


    console.log("META DOC UPD",existing_meta)


    if(multiple == false) {
      existing_meta[type][index].bm_status = true
      existing_meta[type][index].bm_remarks = ""

    }

    let updateCall = await editFieldsById(lead?.applicants?.[isActive]?.applicant_details?.id,'applicant',{
      document_meta:existing_meta
    }, {
      headers: {
        Authorization: token,
      },
    }
  )    // finished **


    let lead_copy = structuredClone(lead);

    lead_copy.applicants[isActive].applicant_details.document_meta = existing_meta;


    console.log("FINAL LEAD SET",lead_copy)

    setLeadData(lead_copy)


  }

  const statusStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: 100,
    backgroundColor: 'grey.300', // Equivalent to #e0e0e0 in the Material palette
    padding: '4px 8px',
    borderRadius: 1, // MUI's border-radius utility (1 = 4px)
    fontSize: '0.9rem',

    '@media (max-width: 600px)': {
      // For mobile screens
      position: 'relative', // Make it relative on mobile
      right: 'auto',
      top: 'auto',
      transform: 'none',
      marginTop: '8px',
      padding: '2px 6px', // Smaller padding for mobile
      fontSize: '0.75rem', // Smaller font size for mobile
    },

    '@media (max-width: 400px)': {
      // Even smaller screens (e.g. very small mobile devices)
      padding: '1px 4px', // Further reduce padding
      fontSize: '0.65rem', // Further reduce font size
    },
  };

  console.log('>>>>Data here', id);

  return (
    <div ref={ref} className={className}>
      <div className='flex justify-between items-center mb-3 relative'>
        <h3 className='text-sm not-italic font-medium text-primary-black'>{title}</h3>

        {/* condition applied depnding on section, progress and bm_status */}

        {!['qualifier', 'L&T Charges', 'eligibility', 'reference-details'].includes(page) &&
        progress === 100 &&
        lead?.lead?.bm_submit == true &&
        lead?.lead?.applicant_type == 'C' ||
        !['qualifier', 'L&T Charges', 'eligibility', 'reference-details'].includes(page) &&
        (progress === 100 || add_progress == true && toBeChecked== true) &&
        lead?.lead?.bm_submit == true &&
        lead?.lead?.sfdc_status !== 'Login Reject' &&
        lead?.lead?.sfdc_status !== 'Complete' ? (
          <div className='flex justify-between'>
            <YesButton
              click={() => {
                console.log('I am the field to update', field);
                setRemarkData({ page: page, id: id, field: field }); // setting the page and id for API call remark
                onHandleVerify(true, page, id);
              }}
             // disabled={page !== 'banking' && docVerify === null || disableField ||page !== 'banking' && docVerify === false }
              disabled={(page !== 'banking' && docVerify === null || disableField ||page !== 'banking' && docVerify === false && lead?.lead?.reject_count > 0) || !docVerify }
           />
            <Nobutton
              click={() => {
                console.log(isActive);
                console.log('page', page);
                console.log('LeadID====>', lead?.lead?.id);

                let loadRemarks = lead?.applicants?.[isActive]?.[field]?.bm_remarks;
                console.log('loadRemark==>', loadRemarks);
                if (page === 'property') {
                  loadRemarks = lead?.property_details?.bm_remarks;
                } else if (page === 'upload') {
                  loadRemarks = lead?.applicants?.[isActive]?.applicant_details?.upload_bm_remarks;

                  console.log('loaded', loadRemarks);
                } else if (page === 'banking') {
                  loadRemarks = lead?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_remarks;
                }

                setStatusUpdate({
                  verify: onHandleVerify,
                  value: false,
                  id: id,
                  page: page,
                  isDocs: false,
                  close: handleCloseModal,
                  setDocVerify: setDocVerify,
                  loadRemarks: loadRemarks,
                });

                setRemarkData({
                  page: page,
                  id: id,
                  applicantId: lead?.applicants?.[isActive]?.applicant_details?.id,
                  field: field,
                  isDocs: false,
                  leadId: lead?.lead?.id,
                }); // setting the page and id for api call remark
                handleOpen();
              }}
             // disabled={page !== 'banking'&& docVerify === null? true:(['applicant','address'].includes(page) && lead?.applicants?.[isActive]?.applicant_details?.is_ekyc_verified == true)?true:disableField?true:false
       //  }
       disabled={page !== 'banking'&& docVerify === null && lead?.lead?.reject_count > 0 ?true:(['applicant','address'].includes(page) && lead?.applicants?.[isActive]?.applicant_details?.is_ekyc_verified == true)?true:disableField && lead?.lead?.reject_count > 0?true:false}

            />
          </div>
        ) : (
          <div></div>
        )}

        {!['qualifier', 'L&T Charges', 'eligibility', 'reference-details'].includes(page) &&
          (page === 'upload' ? (
            lead?.applicants?.[isActive]?.[field]?.upload_bm_status === true ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Approved
              </Box>
            ) : lead?.applicants?.[isActive]?.[field]?.upload_bm_status === false ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Rejected
              </Box>
            ) : null
          ) : page == 'banking' ? (  //lead?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?
            data?.[0]?.bm_status === true ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Approved
              </Box>
            ) : data?.[0]?.bm_status == false ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Rejected
              </Box>
            ) : null
          ) : page === 'property' ? (
            lead?.property_details?.bm_status === true ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Approved
              </Box>
            ) : lead?.property_details?.bm_status === false ? (
              <Box
                component='span'
                sx={statusStyles}
                className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
              >
                Rejected
              </Box>
            ) : null
          ) : lead?.applicants?.[isActive]?.[field]?.bm_status === true ? (
            <Box
              component='span'
              sx={statusStyles}
              className='position-absolute top-50 translateY--50 right-0 bg-grey-300 padding-xs borderRadius-sm text-sm'
            >
              Approved
            </Box>
          ) : lead?.applicants?.[isActive]?.[field]?.bm_status === false ? (
            <Box component='span' sx={statusStyles}>
              Rejected
            </Box>
          ) : null)}

        {/* ENDING */}
        {message || progress === null ? null : <ProgressBadge progress={add_progress == true && toBeChecked== true?100:progress} />}
      </div>
      {message ? (
        <p className='text-xs not-italic font-normal text-dark-grey'>{message}</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {data && data.length ? (
            data.map((e, i) =>
              e ? (
                <div key={i} className='flex items-center flex-col gap-4'>


{e?.subtitle ? (
                    <p className='text-xs not-italic font-semibold text-primary-black mt-1'>
                      {e?.subtitle}
                    </p>
                    
                    
                  ) : null}
                  

{e?.label === 'Other documents' ?
  e?.documentValue
    ?.filter(other => other?.document_type_specific) // Filter out items that don't have document_type_specific
    .map((other) => {
      return (
        <div className='w-full flex gap-4 relative' key={other?.document_type_specific}>
          <p className='w-1/2 text-xs not-italic font-normal text-dark-grey'>
            {other?.document_type_specific}
          </p>
          <p
          className={`w-1/2 ${
            e?.label === 'Address proof'
          } text-xs not-italic font-medium text-primary-black`}
          >
            {other?.data?.length ? 'Uploaded' : '-'}
          </p>

          <Button
                                variant='outlined'
                                size='xs'
                                sx={{
                                  borderColor: 'black',
                                  color: 'black',
                                  padding: '0.2px 0.2px', // Custom padding for extra small size
                                  fontSize: '10px', // Small font size
                                }} // Sets the border and text color to black
                                className='cursor-pointer'
                                disabled = {lead?.applicants?.[isActive]?.applicant_details?.is_locked || lead?.applicants?.[isActive]?.applicant_details?.isApproved || disableField}
                                onClick={() => {
                                  if (
                                    e.documentValue?.bm_status ||
                                    e.documentValue?.bm_status === false
                                  ) {
                                    return;
                                  }

                                  if (e?.label == 'Face liveness') {
                                    openFaceLiveness(); //** ONLY FOR FACELIVENESS VIDEO 20/10 */
                                  } else {
                                    handleOpenModal();

                                    const clone = {
                                      document_fetch_url: other?.data,
                                      stage: 'other_docs',
                                    };

                                    console.log('i am clone', clone);

                                    setSelected(clone);

                                    console.log(documents);
                                  }
                                }}
                              >
                                {/* {e.documentValue?.bm_status ?"Verified":e.documentValue?.bm_status === false ?"Not Verified":"View"} */}

                                {/* {e.documentValue?.length > 0
                                  ? e.documentValue.every((doc) => doc.bm_status === true)
                                    ? 'Verified'
                                    : e.documentValue.every((doc) => doc.bm_status === false)
                                    ? 'Not Verified'
                                    : 'View'
                                  : 'View'} */}

                                  {other?.data?.[0]?.bm_status == true?"Verified":other?.data?.[0]?.bm_status == false?"Not Verified":"View"}
                              </Button>
        </div>
      );
    })
  : null
}
      
                  {e?.label ? (
                    <div className='w-full flex gap-4 relative' key={i}>
                      {e?.label !== 'Other documents'&&<p className='w-1/2 text-xs not-italic font-normal text-dark-grey'>
                        {e?.label}
                      </p>}
          
          {e?.label !== 'Other documents'&& <p
                        className={`w-1/2 ${
                          e?.label === 'Address proof'
                        } text-xs not-italic font-medium text-primary-black`}
                      >
                        {e?.value || (e?.value === 0 ? e?.value : '-')}
                      </p>}

                      {[
                        'Income proof',
                        'Account',
                        'ID Proof',
                        'Address Proof',
                        'Property Papers',
                        'Upload Selfie',
                        'Other Documents',
                        'Type of residence',
                        'Form 60',
                        'Customer Photo',
                        'Upload Selfie',
                        'ID Number',
                        'Face liveness',
                        'Account Aggregator',
                        'Penny drop',
                        'Salary slip',
                        'Application Form'
                      ].some((item) => {
                        const label = e?.label?.trim().toLowerCase();
                        const subtitle = e?.subtitle?.trim().toLowerCase();
                        // If title is 'upload-documents', check against additional labels

                        // General condition for other cases (labels and subtitles)
                        return [e?.label, e?.subtitle]
                          .filter(Boolean) // Filter out undefined or null values
                          .map((val) => val.trim().toLowerCase()) // Handle case-insensitivity
                          .includes(item.toLowerCase());
                      }) && (
                        <>
                          {/* e.documentValue?.bm_status ? (
  // Show "Verified" when bm_status is true
  <span className="text-green-500">Verified</span>
  
)  : */}
                          <Box
                            sx={{
                              width: '100px', // Adjust width as needed
                              justifyContent: 'space-between', // Space between items
                              backgroundColor: 'white',
                              position: 'absolute', // Make it absolute
                              top: 0, // Position it relative to the parent
                              right: 0, // Adjust based on where you want it
                              display: 'flex',
                              alignItems: 'center', // Center vertically
                            }}
                          >
                            {/* Eye Icon Below  */}

                            {e?.label !== 'Other documents' &&

                            <>

                            <span className='cursor-pointer'>
                              <svg
                                width='20'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M21.1303 9.8531C22.2899 11.0732 22.2899 12.9268 21.1303 14.1469C19.1745 16.2047 15.8155 19 12 19C8.18448 19 4.82549 16.2047 2.86971 14.1469C1.7101 12.9268 1.7101 11.0732 2.86971 9.8531C4.82549 7.79533 8.18448 5 12 5C15.8155 5 19.1745 7.79533 21.1303 9.8531Z'
                                  stroke='#373435'
                                  stroke-width='1.5'
                                ></path>
                                <path
                                  d='M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z'
                                  stroke='#373435'
                                  stroke-width='1.5'
                                ></path>
                              </svg>
                            </span>

                            {e?.documentValue &&
                            lead?.lead?.bm_submit == true &&
                            lead?.lead?.sfdc_status !== 'Login Reject' &&
                            lead?.lead?.sfdc_status !== 'Complete' ? (
                              <Button
                                variant='outlined'
                                size='xs'
                                sx={{
                                  borderColor: 'black',
                                  color: 'black',
                                  padding: '0.2px 0.2px', // Custom padding for extra small size
                                  fontSize: '10px', // Small font size
                                }} // Sets the border and text color to black
                                className='cursor-pointer'
                                disabled = {lead?.applicants?.[isActive]?.applicant_details?.is_locked || lead?.applicants?.[isActive]?.applicant_details?.isApproved || disableField}
                                onClick={() => {
                                  if (
                                    e.documentValue?.bm_status ||
                                    e.documentValue?.bm_status === false
                                  ) {
                                    return;
                                  }

                                  if (e?.label == 'Face liveness') {
                                    openFaceLiveness(); //** ONLY FOR FACELIVENESS VIDEO 20/10 */
                                  } else {
                                    handleOpenModal();

                                    const clone = {
                                      document_fetch_url: e?.documentValue,
                                      stage: e?.doc_stage,
                                    };

                                    console.log('i am clone', clone);

                                    setSelected(clone);

                                    console.log(documents);
                                  }
                                }}
                              >
                                {/* {e.documentValue?.bm_status ?"Verified":e.documentValue?.bm_status === false ?"Not Verified":"View"} */}

                                {/* {e.documentValue?.length > 0
                                  ? e.documentValue.every((doc) => doc.bm_status === true)
                                    ? 'Verified'
                                    : e.documentValue.every((doc) => doc.bm_status === false)
                                    ? 'Not Verified'
                                    : 'View'
                                  : 'View'} */}

                                  {
                                      e.documentValue?.length > 0 ? (                             
                                        e?.doc_stage == 'banking_docs'&& lead?.applicants?.[isActive]?.banking_details?.filter ((bank)=>!bank?.extra_params)?.[0]?.bm_status == true?"Verified":e?.documentValue?.every((doc) => doc?.bm_status === true) ? (
                                          "Verified"
                                        ) : e?.doc_stage == 'banking_docs'&& lead?.applicants?.[isActive]?.banking_details?.filter ((bank)=>!bank?.extra_params)?.[0]?.bm_status == false?"Not Verified":e?.documentValue?.every((doc) => doc?.bm_status === false) ? (
                                          "Not Verified"
                                        ) : (
                                          "View"
                                        )
                                      ) : (
                                        "View"
                                      )
                                  }
                              </Button>
                            ) : (
                              <div>-</div>
                            )}
                            </>
                      }

                            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                              <div
                                className={`bg-white p-4 rounded-lg shadow-lg ${
                                  (Array.isArray(selected?.document_fetch_url) &&
                                    selected.document_fetch_url.some(
                                      (item) =>
                                        typeof item?.document_fetch_url === 'string' &&
                                        item.document_fetch_url.endsWith('.pdf'),
                                    ) &&
                                    e?.doc_stage == 'id_proof_photos') ||
                                  (Array.isArray(selected?.document_fetch_url) &&
                                    selected.document_fetch_url.some(
                                      (item) =>
                                        typeof item?.document_fetch_url === 'string' &&
                                        item.document_fetch_url.endsWith('.pdf'),
                                    ) &&
                                    e?.doc_stage == 'address_proof_photos')
                                    ? 'w-full h-[80vh]'
                                    : Array.isArray(selected?.document_fetch_url) &&
                                      selected.document_fetch_url.some(
                                        (item) =>
                                          typeof item.document_fetch_url === 'string' &&
                                          item.document_fetch_url.endsWith('.pdf'),
                                      )
                                    ? 'w-full'
                                    : // Cover full width and set height to 90% of the viewport
                                      'max-w-sm w-full md:max-w-md lg:max-w-lg' // Default width for non-PDF case
                                }`}
                              >
                                {/* <img
                                src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCy16nhIbV3pI1qLYHMJKwbH2458oiC9EmA&s'
                                alt='Responsive '
                                className='w-full h-auto object-cover mb-4 rounded-lg'
                              /> */}
                                <SecureImage
                                  doc_stage={selected?.stage}
                                  imageUrl={selected?.document_fetch_url}
                                  token={token}
                                  is_pdf={
                                    Array.isArray(selected?.document_fetch_url) &&
                                    selected.document_fetch_url.some(
                                      (item) =>
                                        typeof item.document_fetch_url === 'string' &&
                                        item.document_fetch_url.endsWith('.pdf'),
                                    )
                                  }
                                  page = {page}
                                  setIsModalOpen = {setIsModalOpen}
                                />

                                <button
                                  onClick={handleCloseModal}
                                  className='bg-red-500 text-white text-xs text-center mx-auto px-3 py-1 rounded block'
                                >
                                  Close
                                </button>
                                <div className='flex justify-center'>
                                  <YesButton
                                    click={() => {
                                      // setRemarkData({ page: 'doc', id: e?.documentValue?.id }); // setting the page and id for api call remark
                                      // onHandleVerify(true, 'doc', selected.id);

                                      if(selected?.stage == 'other_docs') {
                                        handleOtherDocuments();
                                        handleCloseModal();
                                        return;
                                      }

                                      onHandleDocumentUpadte(
                                        selected?.document_fetch_url,
                                        selected?.stage,
                                      );

                                      handleCloseModal();
                                    }}
                                  />


                                  <Nobutton
                                  // disabled = {['id_proof_photos','address_proof_photos']?.includes(e?.doc_stage) && lead?.applicants?.[isActive]?.personal_details?.id_type == 'AADHAR' || lead?.applicants?.[isActive]?.personal_details?.selected_address_proof == 'AADHAR'}
                                  disabled={lead?.applicants?.[isActive]?.applicant_details?.is_ekyc_verified && (selected?.stage == 'id_proof_photos' && lead?.applicants?.[isActive]?.personal_details?.id_type == 'AADHAR' || selected?.stage == 'address_proof_photos' && lead?.applicants?.[isActive]?.personal_details?.selected_address_proof == 'AADHAR')
                                  }
                                    click={(e) => {
                                      // onHandleVerify(false, page, id);
                                      // let loadRemarks = lead?.applicants?.[isActive]?.applicant_details?.document_meta?.bm_remarks

                                      let activeData;

                                      //workingnnnnn
                                      

                                      if(selected?.stage == 'other_docs') {


                                        activeData =
                                        lead?.applicants?.[isActive]?.applicant_details
                                          ?.document_meta?.other_docs.filter((obj)=> {
                                            return obj?.id == selected?.document_fetch_url?.[0]?.id
                                          })

                                          //selected?.document_fetch_url?.[0]?.id

                                       const loadRemarks = selected?.document_fetch_url?.[0]?.bm_remarks;

                                       // here ** to
                                      setRemarkData({
                                        page: page,
                                        id: id,
                                        applicantId: lead?.applicants?.[isActive]?.applicant_details?.id,
                                        isDocs: true,
                                        stage: 'other_docs',
                                        leadId: lead?.lead?.id,
                                        field:field,
                                        multiple:selected?.document_fetch_url?.length>1?true:false,
                                        target:selected?.document_fetch_url
                                        
                                      }); // setting the page and id for api call remark
                                      setStatusUpdate({
                                        verify: onHandleVerify,
                                        value: false,
                                        id: id,
                                        page: page,
                                        isDocs: true,
                                        close: handleCloseModal,
                                        setDocVerify: setDocVerify,
                                        loadRemarks: loadRemarks,
                                        stage: 'other_docs',
                                        other_doc_id:selected?.document_fetch_url?.[0]?.id
                                      });
                                      handleOpen();


                                      return;


                                      }

                                      if(selected?.stage == 'banking_docs') {
                                        activeData =
                                        lead?.applicants?.[isActive]?.banking_details?.filter((bank)=>!bank?.extra_params)
                                      }

                                      else {
                                        activeData =
                                        lead?.applicants?.[isActive]?.applicant_details
                                          ?.document_meta?.[selected?.stage];
                                      }

                                       const loadRemarks = activeData[0]?.bm_remarks;

                                      setRemarkData({
                                        page: page,
                                        id: id,
                                        applicantId: lead?.applicants?.[isActive]?.applicant_details?.id,
                                        isDocs: true,
                                        stage: selected?.stage,
                                        leadId: lead?.lead?.id,
                                        field:field
                                      }); // setting the page and id for api call remark
                                      setStatusUpdate({
                                        verify: onHandleVerify,
                                        value: false,
                                        id: id,
                                        page: page,
                                        isDocs: true,
                                        close: handleCloseModal,
                                        setDocVerify: setDocVerify,
                                        loadRemarks: loadRemarks,
                                      });
                                      handleOpen();
                                    }}
                                  />
                                </div>
                              </div>
                            </Modal>
                          </Box>
                        </>
                      )}
                    </div>
                  ) : null}
                  {e?.children ? e?.children : null}
                </div>
              )   // here ** new
              
              : null,
            )
          ) : (
            <p className='text-xs not-italic font-medium text-primary-black'>
              This section is not done yet
            </p>
          )}
        </div>
      )}
    </div>
  );
});

function RemarksModal({
  open,
  onClose,
  onSave,
  updateRemarks,
  onHandleVerify,
  page,
  id,
  statusUpdate,
  lead,
}) {
  const [remarks, setRemarks] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    setRemarks(statusUpdate?.loadRemarks);
    console.log('I am remark set', statusUpdate?.loadRemarks);
  }, [statusUpdate]);

  const handleSave = async () => {
    if (remarks.length > 0) {
      const { message, data } = await onSave(remarks);
      if (message && data) {
        console.log('Remark log saved successfully:', message, data);
        onClose();
      }


      if(statusUpdate?.stage == 'other_docs') {
        updateRemarks(remarks, false,statusUpdate?.other_doc_id);
      }


      else {
        updateRemarks(remarks, false);
      }
      if (!statusUpdate.isDocs) {
        statusUpdate.verify(false, statusUpdate.page, statusUpdate.id, remarks);
      }

      statusUpdate.setDocVerify(false);

      statusUpdate.close();
    } else {
      setError('Remarks is Mandatory');
    }

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      sx={{
        '& .MuiDialog-paper': { background: '#64748b', borderRadius: '25px' },
        '& .MuiDialogTitle-root': {
          padding: '10px 20px',
          fontSize: '15px',
          textDecoration: 'underline',
        },
        '& .MuiDialogContent-root  ': {
          margin: '0',
          padding: '0',
        },
      }}
    >
      <DialogTitle>Remarks</DialogTitle>
      <DialogContent
        sx={{
          '& .MuiDialogContent': {
            margin: '0',
          },
        }}
        dividers
      >
        <TextField
          placeholder='Enter message Here...!'
          sx={{ marginTop: '0', background: 'white', padding: '10px' }}
          autoFocus
          margin='dense'
          id='remarks'
          label='Enter your remarks'
          type='text'
          fullWidth
          multiline
          rows={10} // Adjust this for textarea height
          variant='outlined'
          value={remarks == null ? '' : remarks}
          onChange={(e) => {
            setError('');
            setRemarks(e.target.value);
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <button
          className='px-3 border border-black rounded-sm bg-white text-sm text-black'
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className='px-3 border border-black rounded-sm text-sm bg-white text-black'
          onClick={handleSave}
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
}

const Separator = () => {
  return <div className='border-t-2 border-b-0 my-6 w-full'></div>;
};

const ViewRemarks = ({ lead }) => {
  const { token } = useContext(AuthContext);
  const [remarks, setRemarks] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    const getRemarks = async () => {
      try {
        const response = await getRemarkLogs(lead?.lead?.id, {
          headers: {
            Authorization: token,
          },
        });
        setRemarks(response || []);
      } catch (err) {
        setError('Failed to fetch remarks');
        console.error(err);
      }
    };

    if (lead?.lead?.id) {
      getRemarks();
    }
  }, [lead?.lead?.id]);

  if (error) return <p>{'No History Found !'}</p>;
  return (
    <>
      <AdminTable
        TableHeaderList={[
          {
            heading: 'LEAD ID',
            width: 70,
          },
          {
            heading: 'REMARK',
            width: 100,
          },
          {
            heading: 'FIELD',
            width: 140,
          },
          {
            heading: 'DATE',
            width: 100,

          },
        ]}
      >
        {remarks.length
          ? remarks.map(({ leadId, remark, relatedTable, timestamp }, i) => {
              return (
                <tr
                  key={i}
                  className='bg-white text-primary-black font-normal text-sm hover:bg-gray-50'
                >
                  <td className='p-2 text-gray-700'>{leadId}</td>
                  <td className='p-2 text-gray-700'>{remark}</td>
                  <td className='p-2 text-gray-700 '>{relatedTable}</td>
                  <td className='p-2 text-gray-700'>{moment(timestamp).format('DD-MM-YYYY')}</td>
                </tr>
              );
            })
          : 'No History Found !'}
      </AdminTable>
    </>
  );
};