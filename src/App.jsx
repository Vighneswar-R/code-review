import React from 'react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
const DashboardRoutes = lazy(() => import('./pages'));
import Loader from './components/Loader';
import ContextLayout from './context/ContextProvider';
import { useIdleTimer } from 'react-idle-timer';
import Overlay from './components/Overlay';
import BrowserVersionDetection from './components/BrowserVersionDetection';
// import './utils/disableConsole'
 
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
 
// const IDLE_TIMEOUT = 1000 * 10; // 10 seconds
 
 
const CheckInternet = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
 
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
 
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
 
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
 
  return (
    <>
      {!isOnline && <Overlay />}
      {children}
    </>
  );
};


 
function App() {
 
  //ERUDA TEMPORARY LOGGER
 
  // useEffect(() => {
  //   eruda.init(); // Initialize Eruda
  //   eruda.show(); // Show console immediately
  // }, []);


  
 
 
  const logout = () => {
    window.location.replace('/');
    sessionStorage.clear();
    console.log('User logged out due to inactivity');
  };
 
  const idleTimer = useIdleTimer({
    timeout: IDLE_TIMEOUT,
    onIdle: logout,
    onPresenceChange: (presence) => {
      // Handle state changes in one function
      console.log(presence);
    },
  });
 
 
  // catche clear and service worker unregister while mounting
 
 
  const clearCacheOld = () => {
    const clearedCache = sessionStorage.getItem('cacheCleared');
 
    if (!clearedCache) {
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }
 
      // Delete all caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          return Promise.all(cacheNames.map((cache) => caches.delete(cache)));
        }).then(() => {
          sessionStorage.setItem('cacheCleared', "true");
          window.location.reload(); // Reload only after clearing cache
        });
      }
    }
  };
 
  const clearCache = async () => {
    const clearedCache = sessionStorage.getItem('cacheCleared');
 
    if (!clearedCache) {
      try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
 
        // Delete all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cache) => caches.delete(cache)));
        }
 
        // Mark cache as cleared & reload
        sessionStorage.setItem('cacheCleared', "true");
        window.location.reload(); // Reload only after all operations complete
 
      } catch (error) {
        console.error("Error clearing cache:", error);
      }
    }
  };
 
  useEffect(()=> {
    clearCache();
  },[])


 
  // useEffect(() => {       // if by mistake clicked refresh it will ask for confirmation if clicked yes it will log out
  //   const handleBeforeUnload = (event) => {
  //     event.preventDefault(); // Prevent default behavior
  //     event.returnValue = ""; // For older browsers (required)
     
  //     // Show a custom dialog using the `confirm` method
 
  //     if(location.pathname == '/login') {    // if already in login page it will reload without any condition
  //       window.location.reload();
 
  //       return false;
  //     }
 
 
  //     const shouldRefresh = window.confirm("Would you like to refresh the page?");
  //     if (shouldRefresh) {
  //       // Allow the refresh
  //       window.location.reload();
  //     } else {
  //       // Cancel the refresh
  //       return false;
  //     }
  //   };
 
  //   // Add the `beforeunload` event listener
  //   window.addEventListener("beforeunload", handleBeforeUnload);
 
  //   // Cleanup the event listener on component unmount
  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);   //ending
  // useEffect(() => {
  //   let touchStartY = 0;
   
  //   const onTouchStart = (event) => {
  //     // Record the starting touch position
  //     touchStartY = event.touches[0].clientY;
  //   };
   
  //   const onTouchMove = (event) => {
  //     const touchMoveY = event.touches[0].clientY;
     
  //     // When the user is at the top of the page and swipes up
  //     if (window.scrollY === 0 && touchMoveY > touchStartY) {
  //       // Prevent the swipe-to-refresh action (swipe up at the top)
  //       event.preventDefault();
  //     }
  //   };
 
  //   // Add the event listeners for touchstart and touchmove
  //   document.addEventListener("touchstart", onTouchStart, { passive: true });
  //   document.addEventListener("touchmove", onTouchMove, { passive: false });
 
  //   // Cleanup the event listeners on component unmount
  //   return () => {
  //     document.removeEventListener("touchstart", onTouchStart);
  //     document.removeEventListener("touchmove", onTouchMove);
  //   };
  // }, []);
 
 
  // useEffect(() => {
  //   let startY = 0;
 
  //   const onTouchStart = (event) => {
  //     startY = event.touches[0].clientY; // Record the initial touch position
  //   };
 
  //   const onTouchMove = (event) => {
  //     const currentY = event.touches[0].clientY;
 
  //     // Prevent pull-to-refresh only when at the top and swiping down
  //     if (window.scrollY === 0 && currentY > startY) {
  //       event.preventDefault(); // Stop pull-to-refresh
  //     }
  //   };
 
  //   // Add touchstart and touchmove listeners
  //   document.addEventListener('touchstart', onTouchStart, { passive: true });
  //   document.addEventListener('touchmove', onTouchMove, { passive: false });
 
  //   // Cleanup listeners on unmount
  //   return () => {
  //     document.removeEventListener('touchstart', onTouchStart);
  //     document.removeEventListener('touchmove', onTouchMove);
  //   };
  // }, []);
 
  /*window.onerror = function (msg, url, lineNo, columnNo, error) {
    const errorDetails = {
      message: msg,
      url: url,
      line: lineNo,
      column: columnNo,
      error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : "No error object",
    };
 
    const errorMessage = `
    ERROR DETECTED:
    Message: ${errorDetails.message}
    URL: ${errorDetails.url}
    Line: ${errorDetails.line}, Column: ${errorDetails.column}
    Error: ${errorDetails.error}
   
    Please take a screenshot and share it with the development team.
    `;
 
    alert(errorMessage); // Stops execution and allows the user to take a screenshot
 
    console.error("Error Captured:", errorDetails);
  };
 
  window.addEventListener("unhandledrejection", (event) => {
    const rejectionDetails = {
      error: event.reason
        ? JSON.stringify(event.reason, Object.getOwnPropertyNames(event.reason))
        : "Unknown error",
    };
 
    const rejectionMessage = `
    UNHANDLED PROMISE REJECTION:
    Error: ${rejectionDetails.error}
   
    Please take a screenshot and share it with the development team.
    `;
 
    alert(rejectionMessage); // Stops execution and allows the user to take a screenshot
 
    console.error("Unhandled Promise Rejection:", rejectionDetails);
  });
 */

  //   useEffect(() => {
  //   const getCurrentScriptVersion = () => {
  //     const scripts = document.querySelectorAll('script[src]');
  //     for (const script of scripts) {
  //       const match = script.src.match(/[?&]v=([^&]+)/);
  //       if (match) return match[1];
  //     }
  //     return null;
  //   };

  //   const currentVersion = getCurrentScriptVersion();

  //   const checkForUpdate = async () => {
  //     try {
  //       const res = await fetch('/version.json');
  //       const { version: latestVersion } = await res.json();

  //       console.log("CURRENT",currentVersion);

  //       console.log("LATEST",latestVersion)


  //       if (currentVersion && latestVersion && currentVersion !== latestVersion) {
  //         console.log(`Version changed: ${currentVersion} → ${latestVersion}`);
  //       window.location.href = window.location.href; // Force hard reload
  //       }
  //     } catch (e) {
  //       console.error('Version check failed:', e);
  //     }
  //   };

  //   //5 * 60 * 1000

  //   const interval = setInterval(checkForUpdate,5000); // 5 min
  //   // checkForUpdate(); // run on first load

  //   return () => clearInterval(interval); // cleanup on unmount
  // }, []);




 
  return (
    <Suspense fallback={<Loader />}>
      <BrowserRouter>
        <BrowserVersionDetection>
          <CheckInternet>
            <Routes>
              <Route element={<ContextLayout />}>
                <Route path='*' element={<DashboardRoutes />} />
                 
              </Route>
            </Routes>
          </CheckInternet>
        </BrowserVersionDetection>
      </BrowserRouter>
    </Suspense>
  );
}
 
export default App;