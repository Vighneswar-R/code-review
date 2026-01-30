import PaymentFailureIllustration from '../../../../assets/payment-failure';
import { Button } from '../../../../components';
import { useContext } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import Topbar from '../../../../components/Topbar';
import PropTypes from 'prop-types';

const PaymentFailure = ({ back, skip,status }) => {
  const { values } = useContext(LeadContext);
  return (
    
    <div className='overflow-hidden flex flex-col h-[100vh]'>
      <Topbar title='L&T Charges' id={values?.lead?.id} showClose={true} />
      <div className='h-screen bg-medium-grey flex flex-col w-full'>
        <div className='flex-1 flex items-center z-0'>
          <div className='w-full relative z-0'>
            <div className='flex justify-center pointer-events-none'>
              <PaymentFailureIllustration />
            </div>
            <div className='-translate-y-32'>
              <h4 className='text-center text-xl not-italic font-medium text-primary-black mb-2'>
                {status=='failure'? 'Payment unsuccessful!':'Transaction in Progress'}
              </h4>
              <p className='text-center text-sm not-italic font-normal text-light-grey'>
              {status=='failure'? 'Please try other payment options':''}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-auto w-full p-4 space-y-4 '>
        <Button inputClasses='h-12' primary={true} onClick={back}>
          Select other payment method
        </Button>
        <Button
          inputClasses={
            'border-none text-center text-base not-italic font-semibold underline h-12 bg-transparent'
          }
          onClick={skip}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailure;

PaymentFailure.propTypes = {
  back: PropTypes.any,
  skip: PropTypes.any,
};
