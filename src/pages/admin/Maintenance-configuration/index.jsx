import React, { useContext, useState } from 'react';
import AdminHeader from "../../../components/Header/AdminHeader";
import DatePicker2 from "../../../components/DatePicker/DatePicker2";
import FormPopUp from "../../../components/FormPopUp";
import { TextInput, DropDown } from "../../../components/index.jsx";
import moment from "moment";
import { parseISO, isValid } from 'date-fns';
import { maintenanceConfiguration } from "../../../global/index.js";
import { AuthContext } from "../../../context/AuthContextProvider.jsx";
import BasicTimePicker from '../../../components/BasicTimePicker';
 
export default function MaintenanceConfiguration() {
  const { token } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [values, setValues] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    is_active: true,
  });
 
  const [dateError, setDateError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
 
  const handleTitleChange = (e) => {
    setValues((prev) => ({
      ...prev,
      title: e.target.value.trimStart().replace(/\s\s+/g, ' ')
    }));
  };
 
  const handleDescriptionChange = (e) => {
    setValues((prev) => ({
      ...prev,
      description: e.target.value.trimStart().replace(/\s\s+/g, ' ')
    }));
  };
 
  const handleDropDownChange = (value) => {
    setValues((prev) => ({
      ...prev,
      is_active: value
    }));
  };
 
  const handleDateChange = (dateString) => {
    debugger
    console.log("Selected Date String:", dateString);
    if (dateString) {
      const parsedDate = parseISO(dateString);
      console.log("Parsed Date:", parsedDate);
      if (!isValid(parsedDate)) {
        console.error("Parsed date is invalid:", parsedDate);
        setDateError('Please enter a valid date');
        return;
      }
      const formattedDate = moment(parsedDate).format('YYYY-MM-DD');
      console.log("Formatted Date:", formattedDate);
      setValues((prev) => ({
        ...prev,
        date: formattedDate
      }));
      setDateError('');
    } else {
      setValues((prev) => ({
        ...prev,
        date: ''
      }));
      setDateError('Invalid date selected');
    }
  };
 
  const onDatePickerBlur = (e) => {
    const inputValue = e.target.value;
    const formattedDate = moment(inputValue, 'DD/MM/YYYY').format('YYYY-MM-DD');
    handleDateChange(formattedDate);
  };
 
  const submit = async () => {
    console.log("Current Values Before Submit:", values);
 
    setErrors({});
 
    try {
      const payload = {
        date: values.date,
        start_time: moment(values.start_time).format('HH:mm'),
        end_time: moment(values.end_time).format('HH:mm'),
        is_active: values.is_active,
        message: `${values.title} ${values.description}`.trim(),
      };
 
      const options = {
        headers: {
            Authorization: token
        },
        data: payload,
      };
 
      const data = await maintenanceConfiguration(payload ,options);
     
      console.log("Response", data);
 
      setShow(false);
      alert('Submitted');
     
    } catch (error) {
      console.error("API error:", error);
      setSubmitError('An error occurred while submitting the form.');
     
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <>
      <AdminHeader
        title='Maintenance Configuration'
        query=""
        setQuery={() => {}}
        // showSearch={true}
        showButton={true}
        // showRefresh={true}
        buttonText='Add Downtime'
        handleButtonClick={() => setShow(true)}
      />
     
      <FormPopUp
        title="Add Downtime"
        actionMsg='Save'
        showpopup={show}
        setShowPopUp={setShow}
        handleActionClick={() => {
          console.log("Current Values Before Submit:", values);
          console.log("Current Errors Before Submit:", errors);
          submit();
        }}
        handleResetAction={() => {
          setValues({
            title: '',
            description: '',
            date: '',
            start_time: '',
            end_time: '',
            is_active: true,
          });
          setErrors({});
          setDateError('');
        }}
      >
        <div className='p-6 overflow-y-scroll overflow-x-hidden flex flex-col gap-y-4'>
          <div className='flex gap-6'>
            <TextInput
              label='Title'
              required
              name='title'
              value={values.title}
              onChange={handleTitleChange}
              error={errors.title}
              touched={!!errors.title}
              divClasses='flex-1'
            />
            <TextInput
              label='Description'
              required
              name='description'
              value={values.description}
              onChange={handleDescriptionChange}
              error={errors.description}
              touched={!!errors.description}
              divClasses='flex-1'
            />
          </div>
          <div className='flex gap-6'>
            <DropDown
              label='Active'
              name='is_active'
              required
              options={[
                { value: true, label: 'True' },
                { value: false, label: 'False' },
              ]}
              onChange={handleDropDownChange}
              defaultSelected={values.is_active}
              inputClasses='flex-1'
            />
            <DatePicker2
              value={values.date ? moment(values.date).format('DD/MM/YYYY') : ''}
              required
              name='date'
              label='Date'
              error={dateError}
              onAccept={(dateString) => {
                handleDateChange(dateString);
              }}
              onBlur={onDatePickerBlur}
            />
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col">
              <label htmlFor="start-time" className="mb-2">Start Time</label>
              <BasicTimePicker
                id="start-time"
                value={values.start_time}
                onChange={(time) => {
                  console.log("Selected Start Time:", time);
                  setValues((prev) => ({ ...prev, start_time: time }));
                }}
              />
            </div>
            <div className="flex flex-col ml-auto">
              <label htmlFor="end-time" className="mb-2">End Time</label>
              <BasicTimePicker
                id="end-time"
                value={values.end_time}
                onChange={(time) => {
                  console.log("Selected End Time:", time);
                  setValues((prev) => ({ ...prev, end_time: time }));
                }}
              />
            </div>
          </div>
          {submitError && <div className="text-red-500">{submitError}</div>}
        </div>
      </FormPopUp>
    </>
  );
}