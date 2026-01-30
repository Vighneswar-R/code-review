import { Link } from 'react-router-dom';
import Button from '../Button';
import Searchbox from '../Searchbox.jsx';
import PropTypes from 'prop-types';

export default function AdminHeader({
  title,
  query,
  setQuery,
  handleSearch,
  handleResetSearch,
  showSearch,
  showButton,
  buttonText,
  prompt,
  handleButtonClick,
  callback,
  showRefresh,
  backRoute,
}) {
  return (
    <div className='p-6 border-b border-lighter-grey flex justify-between items-center'>
      <div className='gap-3 flex items-center'>
        {backRoute && (
          <Link to={backRoute}>
            <svg
              width='30'
              height='29'
              viewBox='0 0 30 29'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M18.6001 21.5996L11.4001 14.3996L18.6001 7.19961'
                stroke='#373435'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
              />
            </svg>
          </Link>
        )}
        <h2>{title}</h2>
      </div>
      <div className='flex gap-4 items-center'>
        {showRefresh && (
          <button
            onClick={callback}
            className='bg-transparent border-lighter-grey border-x border-y rounded-md flex gap-2 py-2.5 px-5'
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M4 11C4 6.582 7.582 3 12 3C16.418 3 20 6.582 20 11C20 15.418 16.418 19 12 19H9M9 19L12 16M9 19L12 22'
                stroke='#E33439'
                stroke-width='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>

            <span className='text-primary-red text-base'>Refresh</span>
          </button>
        )}
        {showSearch && (
          <Searchbox
            query={query}
            setQuery={setQuery}
            handleSubmit={handleSearch}
            handleReset={handleResetSearch}
            inputClasses='w-[340px]'
            prompt={prompt}
          />
        )}
        {showButton && (
          <Button
            inputClasses='h-12 md:!py-2.5 px-5 md:w-auto md:!text-base'
            primary
            onClick={handleButtonClick}
          >
            + &nbsp;{buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

AdminHeader.propTypes = {
  title: PropTypes.string,
  showSearch: PropTypes.bool,
  showButton: PropTypes.bool,
  buttonText: PropTypes.string,
  handleButtonClick: PropTypes.func,
};
