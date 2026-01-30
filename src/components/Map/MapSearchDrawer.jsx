import { Global } from '@emotion/react';
import { CssBaseline, SwipeableDrawer } from '@mui/material';
import BottomSheetHandle from '../BottomSheetHandle';
import iconSearch from '../../assets/icons/search.svg';
import propTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import currentLocation from '../../assets/icons/current-location.svg';
import { IconArrowRight } from '../../assets/icons';
import addressNotFound from '../../assets/address-not-found.svg';
import { LeadContext } from '../../context/LeadContextProvider';

const current_location = [
  {
    location1: 'Neo Valley Real Estates',
    location2: 'Sai Hill Road, Bhandup West, Mumbai, Maharshtra, India',
  },
];

const suggested_location = [
  {
    location1: 'Neo Valley Real Estates',
    location2: 'Sai Hill Road, Bhandup West, Mumbai, Maharshtra, India',
  },
  {
    location1: 'neo Valley Real Estates',
    location2: 'Sai Hill Road, Bhandup West, Mumbai, Maharshtra, India',
  },
  {
    location1: 'Jeo Valley Real Estates',
    location2: 'Sai Hill Road, Bhandup West, Mumbai, Maharshtra, India',
  },
];

const MapSearchDrawer = ({
  mapContainerRef,
  searchDrawerOpen,
  setSearchDrawerOpen,
  Autocomplete,
  mapLocation,
  setMapLocation,
  swipeAreaWidth,
  setSwipeAreaWidth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { setShowMap, setFieldValue } = useContext(LeadContext);

  // const onCurrentLocationClick = useCallback(async () => {
  //   setSearchDrawerOpen(false);
  //   setMapLocation(true);
  // }, []);

  const searchLocation = (e) => {
    setSearchQuery(e.currentTarget.value);
    setMapLocation(
      suggested_location.filter((data) => data.location1.includes(e.currentTarget.value)),
    );
    if (!e.currentTarget.value) setMapLocation(null);
  };

  // useEffect(() => {
  //   if (!mapLocation) {
  //     setSwipeAreaWidth(90);
  //   } else {
  //     setSwipeAreaWidth(260);
  //   }
  // }, [mapLocation]);

  return (
    <>
      <CssBaseline />
      <Global
        styles={{
          '#map-container .MuiDrawer-root > .MuiPaper-root': {
            height: `calc(90% - ${swipeAreaWidth}px)`,
            overflow: 'visible',
          },
        }}
      />

      <SwipeableDrawer
        className='no-scrollbar overflow-hidden'
        anchor='bottom'
        container={() => mapContainerRef.current}
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
        onOpen={() => setSearchDrawerOpen(true)}
        swipeAreaWidth={swipeAreaWidth}
        allowSwipeInChildren={true}
        disableSwipeToOpen={false}
        disableBackdropTransition
        disableDiscovery
        ModalProps={{
          keepMounted: true,
        }}
      >
        <div
          role='presentation'
          style={{
            marginTop: `${-swipeAreaWidth}px`,
          }}
          className='bg-neutral-white rounded-t-2xl left-0 right-0 relative visible'
        >
          <div className='pt-2 pb-4 flex justify-center flex-col no-scrollbar'>
            <BottomSheetHandle />
          </div>

          <div className='w-full min-h-screen bg-neutral-white px-4 flex flex-col gap-2 relative'>
            <div
              className='input-container px-4 py-3 border rounded-lg 
        				flex gap-2
        				transition-all ease-out duration-150
        				focus-within:border-secondary-blue focus-within:shadow-secondary-blue focus-within:shadow-primary border-stroke'
            >
              <img src={iconSearch} alt='Search' role='presentation' />
              {/* <Autocomplete> */}
              <input
                value={searchQuery}
                onFocus={() => setSearchDrawerOpen(true)}
                onChange={searchLocation}
                placeholder='Search for area, apartment name'
                className='w-full focus:outline-none text-ellipsis text-primary-black'
              />
              {/* </Autocomplete> */}
            </div>

            {searchDrawerOpen && (
              <>
                <button
                  onClick={() => setMapLocation(current_location)}
                  className='flex gap-2 p-2 items-center'
                >
                  <img src={currentLocation} alt='current location' role='presentation' />
                  <span className='text-sm font-medium text-primary-red flex-1 text-left'>
                    Use current location
                  </span>
                  <IconArrowRight />
                </button>

                <hr
                  className='w-full h-px'
                  style={{
                    backgroundColor: '#EBEBEB',
                  }}
                />
              </>
            )}

            {mapLocation ? (
              <div className={`overflow-auto ${searchDrawerOpen ? 'h-[500px] pb-10' : 'h-auto'}`}>
                {mapLocation.map((data, i) => (
                  <button
                    onClick={() => {
                      setSearchDrawerOpen(false);
                      setSwipeAreaWidth(260);
                      setMapLocation([data]);
                      setSearchQuery('');
                    }}
                    key={i}
                  >
                    <div className='flex gap-2 justify-between py-4 px-2'>
                      <svg
                        className='mt-1'
                        width='28'
                        height='20'
                        viewBox='0 0 20 20'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M17.5 9.07416C17.5 13.1652 12.8125 18.3334 10 18.3334C7.1875 18.3334 2.5 13.1652 2.5 9.07416C2.5 4.98316 5.85786 1.66675 10 1.66675C14.1421 1.66675 17.5 4.98316 17.5 9.07416Z'
                          stroke='#727376'
                          strokeWidth='1.5'
                        />
                        <path
                          d='M12.5 9.16675C12.5 10.5475 11.3807 11.6667 10 11.6667C8.61929 11.6667 7.5 10.5475 7.5 9.16675C7.5 7.78604 8.61929 6.66675 10 6.66675C11.3807 6.66675 12.5 7.78604 12.5 9.16675Z'
                          stroke='#727376'
                          strokeWidth='1.5'
                        />
                      </svg>

                      <div>
                        <h3 className='text-start font-medium text-primary-black'>
                          {data.location1}
                        </h3>
                        <p className='text-start mt-1 text-xs text-light-grey'>{data.location2}</p>
                      </div>
                    </div>

                    {searchDrawerOpen && (
                      <hr
                        className='w-full h-px'
                        style={{
                          backgroundColor: '#EBEBEB',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            ) : null}

            {mapLocation && !searchDrawerOpen ? (
              <button
                onClick={() => setMapLocation(current_location)}
                className='p-2 rounded-md text-white bg-primary-red font-medium'
              >
                <h3
                  className='text-center'
                  onClick={() => {
                    setFieldValue('property_details.plot_house_flat', mapLocation[0].location1);
                    setFieldValue(
                      'property_details.project_society_colony',
                      mapLocation[0].location2,
                    );
                    setShowMap(false);
                  }}
                >
                  Confirm location
                </h3>
              </button>
            ) : null}

            {mapLocation?.length === 0 && (
              <img
                className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'
                src={addressNotFound}
                alt='Address not found'
              />
            )}
          </div>
        </div>
      </SwipeableDrawer>
    </>
  );
};

MapSearchDrawer.propTypes = {
  mapContainerRef: propTypes.object,
  searchDrawerOpen: propTypes.bool,
  setSearchDrawerOpen: propTypes.func,
};

export default MapSearchDrawer;
