export default function IconTick({ width, height }) {
  return (
    <svg
      width={width ? width : 24}
      height={height ? height : 24}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M20 6L9 17L4 12'
        stroke='#E33439'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
