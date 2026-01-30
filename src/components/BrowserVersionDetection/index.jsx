import Bowser from 'bowser';
import Header from '../Header';
// Define minimum supported versions for each browser
const MIN_SUPPORTED_VERSIONS = {
  Chrome: 141,
  Firefox: 143,
  Safari: 26,
  'Microsoft Edge': 140,
};

const MIN_OS_SUPPORTED_VERSIONS = {
  Windows: 11,
  macOS: 15,
  Android: 15,
  iOS: 18,
};

const BrowserVersionDetection = ({ children }) => {
  const browser = Bowser.getParser(window.navigator.userAgent);
  const browserName = browser.getBrowserName();
  const browserVersion = parseInt(browser.getBrowserVersion(), 10);
  const OS_details = getOSInfo();
  const OS_Type = OS_details.OS;
  const OS_Version = OS_details.Version.version || 21;
  console.log('OS_Version',OS_Version)

  let isSupportedVersion = false;
  let isSupportedBrowser = false;

  let isSupportedOS = false;
  let isSupportedOSVersion = false;

  function getOSInfo() {
    const userAgent = navigator.userAgent;
    console.log("userAgent",userAgent);
    let osInfo = {
      OS: '',
      Version: '121',

    };
    
    if (userAgent.indexOf("Win") !== -1) {
      osInfo.OS = "Windows";
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      if (match) {
        const version = match[1];
        console.log('version 1',version)
        osInfo.Version = { version };
        console.log('match',match)
      }
    } else if (userAgent.indexOf("(iPhone") !== -1) {
      osInfo.OS = "iOS";
      const match = userAgent.match(/iPhone OS (\d+[_\.]\d+)/);
      if (match) {
        const version = match[1].replace('_', '.');
        console.log('version 2',version)
        osInfo.Version = { version };
        console.log('match',match)
      }
    } else if (userAgent.indexOf("Android") !== -1) {
      osInfo.OS = "Android";
      const match = userAgent.match(/Android (\d+\.\d+)/);
      if (match) {
        const version = match[1];
        osInfo.Version = { version };
        console.log('version 3',version);
        console.log('match',match)
      }else{
        osInfo.Version = { version:21 };  
      }
     
    } else if (userAgent.indexOf("Linux") !== -1) {
      osInfo.OS = "Linux";
      // Linux version detection is not straightforward due to varied distributions
    } else if (userAgent.indexOf("Macintosh") !== -1) {
     
      osInfo.OS = "macOS";
      const match = userAgent.match(/OS (\d+[_\.]\d+[_\.]?\d*) like Mac OS X/);
      if (match) {
        const version = match[1].replace(/_/g, ".");
        osInfo.Version = { version };
        console.log('version 4',version);
        console.log('match',match)
      }
    }

    return osInfo;
  }

  if (MIN_SUPPORTED_VERSIONS[browserName]) {
    // Check if the current browser version is supported
    isSupportedBrowser = true;
    isSupportedVersion = browserVersion >= MIN_SUPPORTED_VERSIONS[browserName];
  } else {
    // If browser is not supported
    isSupportedBrowser = false;
  }

  if (MIN_OS_SUPPORTED_VERSIONS[OS_Type]) {
    // Check if the current browser version is supported
    isSupportedOS = true;
    isSupportedOSVersion = OS_Version >= MIN_OS_SUPPORTED_VERSIONS[OS_Type];
  } else {
    // If browser is not supported
    isSupportedOS = false;
  }

  if (!isSupportedBrowser) {
    return (
      <div className='h-screen'>
        <Header />

        <div className='flex justify-center items-center h-full bg-[#FAFAFA]'>
          <div className='bg-[#FDECE8] max-w-[422px] rounded-lg border-x border-y border-primary-red m-5 p-5 text-center'>
            <h2 className='text-primary-red font-medium'>Browser Not Supported</h2>
            <p className='text-dark-grey mt-1'>
              Please note that only Firefox, Chrome, Safari, and Edge are supported browsers. Other
              browsers may not be compatible with our platform's technical requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupportedOS) {
    return (
      <div className='h-screen'>
        <Header />

        <div className='flex justify-center items-center h-full bg-[#FAFAFA]'>
          <div className='bg-[#FDECE8] max-w-[422px] rounded-lg border-x border-y border-primary-red m-5 p-5 text-center'>
            <h2 className='text-primary-red font-medium'>Operating System Not Supported</h2>
            <p className='text-dark-grey mt-1'>
              Please note that only Windows, macOS, Android, iOS are supported Operating System. Other
              Operating System may not be compatible with our platform's technical requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

console.log('OS_Version',OS_Version)
  if (!isSupportedVersion) {
    return (
      <div className='h-screen'>
        <Header />

        <div className='flex justify-center items-center h-full bg-[#FAFAFA]'>
          <div className='bg-[#FDECE8] max-w-[422px] rounded-lg border-x border-y border-primary-red m-5 p-5 text-center'>
            <h2 className='text-primary-red font-medium'>Browser Update Required</h2>
            <p className='text-dark-grey mt-1'>
              Your current browser version ({browserName} {browserVersion}) is not supported. Please
              update your browser to improve your experience and security.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // if (!isSupportedOSVerison) {
  //   return (
  //     <div className='h-screen'>
  //       <Header />

  //       <div className='flex justify-center items-center h-full bg-[#FAFAFA]'>
  //         <div className='bg-[#FDECE8] max-w-[422px] rounded-lg border-x border-y border-primary-red m-5 p-5 text-center'>
  //           <h2 className='text-primary-red font-medium'>Operating System Version Update Required</h2>
  //           <p className='text-dark-grey mt-1'>
  //             Your current operating system version ({`${OS_Type} ${OS_Version}`}) is not supported. Please
  //             update your operating system to improve your experience and security.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );

  // }

  // Render application if the browser & the browser version is supported
  return <>{children}</>;
};

export default BrowserVersionDetection;
