import propTypes from 'prop-types';
import { IconClose } from '../../assets/icons';
import currentLocation from '../../assets/icons/current-location.svg';
import { useContext, useEffect, useRef, useState } from 'react';
import MapSearchDrawer from './MapSearchDrawer';
import { useJsApiLoader, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { LeadContext } from '../../context/LeadContextProvider';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB_VgPtaHSDn21sTi9b6f9Ga15cjvZ6-Sk';

const current_location = [
  {
    location1: 'Neo Valley Real Estates',
    location2: 'Sai Hill Road, Bhandup West, Mumbai, Maharshtra, India',
  },
];

const Map = ({ setShowMap }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    // libraries: ['places'],
  });

  const mapContainerRef = useRef(null);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const center = { lat: 48.8584, lng: 2.2945 };

  const [swipeAreaWidth, setSwipeAreaWidth] = useState(90);
  const [mapLocation, setMapLocation] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!isLoaded) {
    return 'loading';
  }

  return (
    <div
      id='map-container'
      ref={mapContainerRef}
      className='fixed inset-0 h-screen w-full bg-white flex flex-col no-scrollbar overflow-hidden'
    >
      <div className='flex flex-row p-3 px-4 justify-between items-center'>
        <span className='text-base font-medium'>Choose location</span>
        <button onClick={() => setShowMap(false)} type='button' title='Close map'>
          <IconClose />
        </button>
      </div>

      {/* <div className='h-full bg-blue-300 w-full flex-1'></div> */}

      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          zoomControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        }}
        onLoad={(map) => setMap(map)}
      >
        <Marker position={center} />
      </GoogleMap>

      <button
        onClick={() => {
          setMapLocation(current_location);
          setSwipeAreaWidth(260);
          map.panTo(center);
        }}
        style={{
          boxShadow: '0px 0px 14px 0px rgba(163, 163, 163, 0.35)',
        }}
        className='p-3 rounded-lg border border-primary-red flex gap-2 bg-neutral-white text-primary-red w-48 fixed left-2/4 -translate-x-2/4 bottom-28 items-center justify-between text-sm'
        type='button'
        title='Use current location'
      >
        <img src={currentLocation} alt='current location' role='presentation' />
        <span className='whitespace-nowrap'>Use current location</span>
      </button>
      <MapSearchDrawer
        mapContainerRef={mapContainerRef}
        searchDrawerOpen={searchDrawerOpen}
        setSearchDrawerOpen={setSearchDrawerOpen}
        Autocomplete={Autocomplete}
        mapLocation={mapLocation}
        setMapLocation={setMapLocation}
        swipeAreaWidth={swipeAreaWidth}
        setSwipeAreaWidth={setSwipeAreaWidth}
      />
    </div>
  );
};

export default Map;

Map.propTypes = {
  setShowMap: propTypes.func,
};
