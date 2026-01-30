import React from 'react';

export default function LoaderIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      width='21'
      height='20'
      viewBox='0 0 21 20'
      fill='none'
    >
      <path
        d='M20.5 10C20.5 15.5228 16.0228 20 10.5 20C4.97715 20 0.5 15.5228 0.5 10C0.5 4.47715 4.97715 0 10.5 0C16.0228 0 20.5 4.47715 20.5 10ZM2.5 10C2.5 14.4183 6.08172 18 10.5 18C14.9183 18 18.5 14.4183 18.5 10C18.5 5.58172 14.9183 2 10.5 2C6.08172 2 2.5 5.58172 2.5 10Z'
        fill='url(#paint0_angular_2503_18623)'
      />
      <defs>
        <radialGradient
          id='paint0_angular_2503_18623'
          cx='0'
          cy='0'
          r='1'
          gradientUnits='userSpaceOnUse'
          gradientTransform='translate(10.5 10) rotate(90) scale(10)'
        >
          <stop stopColor='#E33439' />
          <stop offset='1' stopColor='#FFF7F7' />
        </radialGradient>
      </defs>
    </svg>
  );
}
