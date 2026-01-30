import Sheet from 'react-modal-sheet';
import PropTypes from 'prop-types';
import BottomSheetHandle from '../BottomSheetHandle';
import { IconClose } from '../../assets/icons';

const TermsAndConditions = ({ show, setShow, children, title }) => {
  return (
    <Sheet
      style={{
        zIndex: 9999999 * 10,
      }}
      isOpen={show}
      onClose={() => setShow(false)}
      snapPoints={[0.7]}
      initialSnap={0}
      className='md:hidden'
    >
      <Sheet.Container>
        <Sheet.Header className='flex flex-col gap-2 py-2 px-4 border-b border-stroke'>
          <BottomSheetHandle />
          <div className='flex gap-4 justify-between'>
            <span className='font-semibold text-xl text-primary-black'>{title}</span>
            <button type='button' title='Dismiss' onClick={() => setShow(false)}>
              <IconClose />
            </button>
          </div>
        </Sheet.Header>
        <Sheet.Content
          disableDrag={true}
          className='px-4 text-dark-grey leading-6 my-4 mr-2 overflow-x-hidden overflow-y-auto'
          dangerouslySetInnerHTML={{
            __html: children,
          }}
        />
      </Sheet.Container>
    </Sheet>
  );
};

TermsAndConditions.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  children: PropTypes.elementType,
  title: PropTypes.string,
};

export default TermsAndConditions;
