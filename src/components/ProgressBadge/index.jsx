const ProgressBadge = ({ progress }) => {
  const getStyle = () => {
    if (progress <= 10) return 'bg-[#FFD6D7] text-primary-red';
    if (progress <= 99) return 'bg-[#E5F5FF] text-secondary-blue';
    return 'text-secondary-green bg-light-green';
  };

  return (
    <div
      className={`px-[6px] py-[2px] rounded-[14px] w-[44px] h-[22px] flex justify-center items-center ${getStyle()}`}
    >
      <span className='text-xs not-italic font-normal'>{progress}%</span>
    </div>
  );
};

export default ProgressBadge;
