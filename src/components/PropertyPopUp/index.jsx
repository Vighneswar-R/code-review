import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../../components/DropDown/index.jsx';
import { getPropertyPapers, getPropertyPaperValues } from '../../global/index.js';
import { AuthContext } from '../../context/AuthContextProvider.jsx';
import { LeadContext } from '../../context/LeadContextProvider.jsx';

function PropertyPopUp() {
  const { token } = useContext(AuthContext);
  const {
    values
  } = useContext(LeadContext);
  const [propertyCategory, setPropertyCategory] = useState('');
  const [authorityNameID, setAuthorityNameID] = useState('');
  const [typeOfProperty, setTypeOfProperty] = useState('');
  const [propertyTransactionType, setPropertyTransactionType] = useState('');
  const [propertyPapersData, setPropertyPapersData] = useState({});
  const [showData, setshowData] = useState([]);
  const [errors, setErrors] = useState({
    Property_Category: '',
    Authority_Name_ID: '',
    Type_of_Property: '',
    Property_Transaction_Type: '',
  });
  const [touched, setTouched] = useState({
    Property_Category: false,
    Authority_Name_ID: false,
    Type_of_Property: false,
    Property_Transaction_Type: false,
  });

  const handleValidation = (field, value) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: value === '' ? 'This field is mandatory' : '',
    }));
  };

  const state_code = 33; // default state code

  const getPropertyPaperValuesData = async () => {
    try {
      const { data } = await getPropertyPaperValues(values?.property_details?.state, {
        headers: { Authorization: token },
      });

      setPropertyPapersData(data?.data || {});
      
    } catch (error) {
      console.error('Error fetching property papers data:', error);
    }
  };

  const handleBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    handleValidation(field, value);
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (touched[field]) {
      handleValidation(field, value);
    }
  };

  const handlePropertyPP = async (value) => {
    try {
      const documents = {
        Authority_Name: authorityNameID,
        Property_Category: propertyCategory,
        Property_Transaction_Type: propertyTransactionType,
        Type_of_Property: typeOfProperty,
      };
      const { data } = await getPropertyPapers(documents, {
        headers: { Authorization: token },
      });

      setshowData(data?.data || []);
      setPropertyTransactionType(value);
      handleValidation('Property_Transaction_Type', value);
    } catch (error) {
      console.error('Error fetching property papers:', error);
    }
  };

  useEffect(() => {
    getPropertyPaperValuesData();
    if (propertyCategory && typeOfProperty && propertyTransactionType) {
      handlePropertyPP(propertyTransactionType);
    }
  }, [propertyCategory, authorityNameID, typeOfProperty, propertyTransactionType]);

  return (
    <div className='p-4'>
      <Dropdown
        label='Property Category'
        required
        name='Property_Category'
        options={(propertyPapersData.Property_Category || []).map((item) => ({
          value: item,
          label: item,
        }))}
        touched={touched.Property_Category}
        error={errors.Property_Category}
        onBlur={() => handleBlur('Property_Category', propertyCategory)}
        defaultSelected={propertyCategory}
        onChange={(value) => handleChange('Property_Category', value, setPropertyCategory)}
      />

      <Dropdown
        label='Authority Name'
        name='Authority_Name_ID'
        required
        options={(propertyPapersData.Authority_Name || []).map((item) => ({
          value: item,
          label: item,
        }))}
        error={errors.Authority_Name_ID}
        touched={touched.Authority_Name_ID}
        onBlur={() => handleBlur('Authority_Name_ID', authorityNameID)}
        defaultSelected={authorityNameID}
        onChange={(value) => handleChange('Authority_Name_ID', value, setAuthorityNameID)}
      />

      <Dropdown
        label='Type of Property'
        name='Type_of_Property'
        required
        options={(propertyPapersData.Type_of_Property || []).map((item) => ({
          value: item,
          label: item,
        }))}
        error={errors.Type_of_Property}
        touched={touched.Type_of_Property}
        onBlur={() => handleBlur('Type_of_Property', typeOfProperty)}
        defaultSelected={typeOfProperty}
        onChange={(value) => handleChange('Type_of_Property', value, setTypeOfProperty)}
      />

      <Dropdown
        label='Property Transaction Type'
        required
        name='Property_Transaction_Type'
        options={(propertyPapersData.Property_Transaction_Type || []).map((item) => ({
          value: item,
          label: item,
        }))}
        touched={touched.Property_Transaction_Type}
        error={errors.Property_Transaction_Type}
        onBlur={() => handleBlur('Property_Transaction_Type', propertyTransactionType)}
        defaultSelected={propertyTransactionType}
        onChange={(value) =>
          handleChange('Property_Transaction_Type', value, setPropertyTransactionType)
        }
      />

      <div className='col-span-2'>
        {showData && showData.length > 0 && (
          <div className='mt-4 p-4'>
            <h2 className='text-lg font-bold mb-4 text-center'>Property Docs Available:</h2>
            <ul className='list-disc ml-6'>
              {showData.map(({ Property_Papers }, index) => (
                <li className='text-start' key={index}>
                  {Property_Papers}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyPopUp;
