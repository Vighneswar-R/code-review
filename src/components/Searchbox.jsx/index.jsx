import React, { useState } from 'react';
import SearchIcon from '../../assets/icons/search';
import CloseIcon2 from '../../assets/icons/close2';

export default function Searchbox({
  query,
  setQuery,
  handleSubmit,
  handleReset,
  disabled,
  inputClasses,
  prompt,
  handleSearchQuery
}) {
  return (
    <form
      name='searchbox'
      onSubmit={handleSubmit}
      onReset={handleReset}
      className={`${inputClasses} flex items-center p-2 h-11 gap-2 border-[#D9D9D9] bg-white shadow-search rounded-lg focus-within:outline outline-1 outline-offset-2`}
    >
      <div className=''>
        <SearchIcon />
      </div>
      <input
        value={query}
        onChange={(e) => {
          let value = e.currentTarget.value;
          value = value?.trimStart()?.replace(/\s\s+/g, ' ');
          const pattern = /^[a-zA-Z0-9\\/-\s,.]+$/;
          if (!pattern.test(value) && value.length != 0) {
            return;
          }
          if (value.trim().length === 0) {
            handleReset();
          }
          setQuery(value);
        }}
        className={`w-full truncate ${disabled ? 'opacity-40' : 'opacity-100'}`}
        type='text'
        placeholder={prompt}
        disabled={disabled}
      />
      {query ? (
        <div className='flex gap-1'>
          <button type='reset' className='flex p-1 justify-center items-center'>
            <CloseIcon2 />
          </button>
          <button
            type='submit'
            className='flex justify-center items-center px-[10px] py-[5px] rounded-3xl bg-primary-red active:opacity-90'
            onClick={handleSearchQuery}
          >
            <span className='text-center text-xs not-italic font-semibold text-white'>Search</span>
          </button>
        </div>
      ) : null}
    </form>
  );
}
