import { LeadContext } from '../../../../context/LeadContextProvider';
import { useContext } from 'react';
import ArrowRightIcon2 from '../../../../assets/icons/arrow-right-2';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Separator from './seperator';

export default function PreviewCard({ index, title, count, link, hide, children, hideLabel }) {
  const { setActiveIndex } = useContext(LeadContext);
  const handleClick = () => setActiveIndex(index);

  return (
    <>
      {hide || count == 0 ? null : (
        <div onClick={handleClick}>
          <Link
            to={link}
            className='rounded-lg border border-[#EBEBEB] bg-white p-3 flex flex-col gap-2 active:opacity-90'
          >
            <div className='flex justify-between'>
              <h4 className='overflow-hidden text-sm not-italic font-medium text-primary-black'>
                {title || '-'}
              </h4>
              <ArrowRightIcon2 />
            </div>

            <Separator />
            <div className='flex justify-start gap-[6px]'>
              {!hideLabel && (
                <p className='not-italic font-medium text-[10px] text-light-grey'>
                  INCOMPLETE FIELDS:{' '}
                </p>
              )}
              <span className='not-italic font-medium text-[10px] text-dark-grey leading-loose'>
                {count}
              </span>
            </div>
            {count === 'ALL' ? null : children}
          </Link>
        </div>
      )}
    </>
  );
}

PreviewCard.propTypes = {
  title: PropTypes.string,
  link: PropTypes.any,
  count: PropTypes.any,
  hide: PropTypes.any,
  children: PropTypes.any,
};
