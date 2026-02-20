import PaymentSuccessIllustration from '../../../../assets/payment-success';
import { Button } from '../../../../components';
import { useContext } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import { AuthContext } from '../../../../context/AuthContextProvider';
import Topbar from '../../../../components/Topbar';
import PropTypes from 'prop-types';
import { editFieldsById } from '../../../../global';

const PaymentSuccess = ({ amount, method }) => {
  const { values, setCurrentStepIndex } = useContext(LeadContext);
  const {token} = useContext(AuthContext)

  const updateLeadStatus = async() => {

    const lead_status = values?.lead?.status


    if(lead_status !== 'L&T Paid') {
      try{
     await editFieldsById(values?.lead?.id,'lead',{status:'L&T Paid'},{
        headers: {
          Authorization: token,
        },
      })      // setting up for testing cases where the status is changed from database
    } catch(err){
      console.log("something went wrong ", err);
    }
    }

  }
  return (
    <div className='overflow-hidden flex flex-col h-[100vh] justify-between'>
      <Topbar title='L&T Charges' id={values?.lead?.id} showClose={true} />
      <div className='h-screen bg-[#EEF0DD] flex flex-col w-full overflow-x-hidden'>
        <div className='flex-1 flex-col flex items-center z-0 overflow-auto overflow-x-hidden'>
          {/* <div className='w-full relative z-0'> */}
          <div className='flex justify-center pointer-events-none'>
            <PaymentSuccessIllustration />
          </div>
          <div className='-translate-y-32'>
            <h4 className='text-xl font-medium leading-8 tracking-normal text-center text-primary-black mb-2'>
              Payment successful!
            </h4>
            <h3 className='text-3xl font-semibold tracking-normal text-center text-secondary-green mb-1'>
              {`₹ ${amount??1500}/-`}
            </h3>
            <p className='text-center text-sm not-italic font-normal text-primary-black'>
              L&T charges have been paid using {method}
            </p>
          </div>
          {/* </div> */}
          {/* </div> */}
        </div>
      </div>
      <div className='mt-auto w-full p-4 fixed bottom-0'>
        <Button
          primary={true}
          inputClasses='h-12'
          link='/lead/property-details'
          onClick={() => {
            setCurrentStepIndex(6);
            updateLeadStatus();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;

PaymentSuccess.propTypes = {
  amount: PropTypes.any,
  method: PropTypes.any,
};
