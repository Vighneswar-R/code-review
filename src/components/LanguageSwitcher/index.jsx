import React from 'react';
import { useTranslation } from 'react-i18next';
import IconLanguage from '../../assets/icons/Language'
const LanguageSwitcher = ({menu}) => {
  const { i18n } = useTranslation();
 
  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };
 
  return (
   
    <>
    <div className="language-selector" style={{
      position:!menu?'absolute':'static',
      left:!menu?'150px':'120px',
      width:'110px'
    }}>
      {/* <IconLanguage /> */}
      <select value={i18n.language} onChange={handleLanguageChange} className="text-sm">
        <option value="en">English</option>
        <option value="hn">हिन्दी</option>
     
       
        {/* Add more languages as needed */}
      </select>
    </div>
  </>
   
  );
};
 
export default LanguageSwitcher;
 