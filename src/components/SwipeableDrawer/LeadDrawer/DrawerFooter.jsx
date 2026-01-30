/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import DrawerArrowUpButton from '../../../assets/icons/drawerArrowUpButton.svg';
import DrawerArrowDownButton from '../../../assets/icons/drawerArrowDownButton.svg';
import { useContext } from 'react';
import { LeadContext } from '../../../context/LeadContextProvider';
import { useLocation } from 'react-router-dom';
import { coApplicantPagesRoute, primaryPagesRoute } from '../../../utils';

export default function DrawerFooter() {
  const {
    currentStepIndex,
    applicantStepsProgress,
    drawerOpen,
    setDrawerOpen,
    activeIndex,
    values,
    coApplicantStepsProgress,
  } = useContext(LeadContext);

  const location = useLocation();

  const pages = values.applicants?.[activeIndex]?.applicant_details?.is_primary
    ? primaryPagesRoute
    : coApplicantPagesRoute;

  return (
    <div className='flex justify-between p-4 pt-3 rounded-t-2xl bg-white w-full border-solid border relative z-[1000]'>
      <div className='flex flex-col'>
        <span style={{ fontSize: '10px', fontWeight: '500', lineHeight: '15px', color: '#E33439' }}>
          {!values.applicants?.[activeIndex]?.applicant_details?.is_primary &&
          location?.pathname !== '/lead/preview'
            ? 'CO-APPLICANT '
            : null}

          {location?.pathname !== '/lead/preview' ? (
            <span
              style={{ fontSize: '10px', fontWeight: '500', lineHeight: '15px', color: '#E33439' }}
            >
              STEP: {pages?.indexOf(location.pathname) + 1} / {pages?.length}
            </span>
          ) : (
            <span
              style={{ fontSize: '10px', fontWeight: '500', lineHeight: '15px', color: '#E33439' }}
            >
              STEP: 11 / {primaryPagesRoute?.length}
            </span>
          )}
        </span>
        <span style={{ fontSize: '12px', fontWeight: '500', lineHeight: '18px' }}>
          {applicantStepsProgress.map((e) => {
            if (e.url === location?.pathname) {
              return e.title;
            }
          })}
        </span>
      </div>
      <img
        className='h-8 w-8'
        src={drawerOpen ? DrawerArrowDownButton : DrawerArrowUpButton}
        alt=''
        onClick={() => setDrawerOpen((prev) => !prev)}
      />
    </div>
  );
}
