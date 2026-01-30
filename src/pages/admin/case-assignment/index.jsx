import { useContext, useEffect, useState } from 'react';
import { Button, DropDown, TextInput } from '../../../components';
import { da } from 'date-fns/locale';
import { getBmAndLoList, getUserLeads, updateLeadLo } from '../../../global';
import { AuthContext } from '../../../context/AuthContextProvider';
import SearchableTextInput from '../../../components/TextInput/SearchableTextInput';
 
 
export default function CaseAssigning() {
  const [trustData, setTrustData] = useState([]);
  const [users, setUsers] = useState([]);
  // const [leads, setLeads] = useState([]);
  const [selectTrustData, setSelectTrustData] = useState([]);
  const [leadInfo, setLeadInfo] = useState(null);
  const [selectedLO, setSelectedLO] = useState('');
  const [selectedNewLO, setSelectedNewLO] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [remark, setRemark] = useState('');
  const { token, loAllDetails } = useContext(AuthContext);
  const loList = users.map((user) => ({
    value: user.id,
    label:  `${user.first_name || user.username} - ${user?.employee_code || ""}`,
  }));
  const newCurrentLo = loList.filter((listItem) => listItem.value !== selectedLO);


  const handleCurrentSelect = async (e,type) => {

        if(type == "newLo") return;

    setSelectedLO(e);
    console.log(e);
    if (!e) {
      return;
    }
    const data = await getUserLeads(e, {
      headers: {
        Authorization: token,
      },
    });
    const newLeads = data?.data?.leads.map((lead) => ({
      value: lead.id,
      label: lead.id,
    }));
    setTrustData([...newLeads]);
  };
  const handleAssignLo = async () => {
    const currentLo = users.find((user) => user.id === selectedLO);
    const newCurrentLo = users.find((user) => user.id === selectedNewLO);
    const values = {
      leadId: selectTrustData,
      loId: currentLo?.id,
      newLoId: newCurrentLo?.id,
      remarks: remark,
    };
 
    const updateLo = await updateLeadLo(values, {
      headers: {
        Authorization: token,
      },
    });
    if (updateLo?.data?.message) {
      alert(updateLo?.data?.message);
      setRefresh(true);
    }
  };
 
  const getLoUsersList = async () => {
    const data = await getBmAndLoList({
      headers: {
        Authorization: token,
      },
    });
    setUsers(data?.data?.users);
  };
 
  const handleCancel = () => {
    setLeadInfo(null);
    setSelectedLO('');
    setSelectedNewLO('');
    setRemark('');
    setTrustData([]);
    setRefresh(true);
  };
 
  useEffect(() => {
    getLoUsersList();
  }, [refresh]);
  return (
    <div className=' grow flex justify-center pt-6 bg-[#F7F7F8]'>
      <div>
        {/* {leadInfo && (
          <>
            <div className='text-primary-black'>
              <h4 className='mb-3'>CUSTOMER DETAILS</h4>
              <div className='flex text-sm mb-2'>
                <p className='flex-1 text-dark-grey'>Name</p>
                <p className='flex-1'>{leadInfo.cname}</p>
              </div>
              <div className='flex text-sm'>
                <p className='flex-1 text-dark-grey'>Mobile Number</p>
                <p className='flex-1'>{leadInfo.cnumber}</p>
              </div>
            </div>
            <hr className='my-3' />
            <div>
              <h4 className='mb-3'>LOAN OFFICER DETAILS</h4>
              <div className='flex text-sm mb-2'>
                <p className='flex-1 text-dark-grey'>Emp ID</p>
                <p className='flex-1'>{leadInfo.empId}</p>
              </div>
              <div className='flex text-sm mb-2'>
                <p className='flex-1 text-dark-grey'>Name</p>
                <p className='flex-1'>{leadInfo.empName}</p>
              </div>
              <div className='flex text-sm'>
                <p className='flex-1 text-dark-grey'>Branch</p>
                <p className='flex-1'>{leadInfo.empBranch}</p>
              </div>
            </div>
          </>
        )} */}
        <div className='py-3 overflow-x-hidden px-4 bg-neutral-white rounded-lg relative'>
          <SearchableTextInput
          label={'Current LO Id'}
          onChange={(e,value) => handleCurrentSelect(value.value)}
          options={loList}
          containerClasses='flex-1'
          ></SearchableTextInput>
          <DropDown
            name='itrust Id'
            label={'itrust Id'}
            options={trustData}
            placeholder={trustData.length == 0 ? 'No Leads Available' : 'itrust Id'}
            onChange={(selection) => setSelectTrustData(selection)}
            disabled={trustData.length == 0 && true}
            defaultSelected={selectTrustData}
            className='flex-grow'
          />
          {/* <DropDown
            name='New LO Id'
            label='New LO Id'
            options={newCurrentLo}
            placeholder='New LO Id'
            onChange={(selection) => setSelectedNewLO(selection)}
            disabled={false}
            defaultSelected={selectedNewLO}
            className='flex-grow'
          /> */}
          <SearchableTextInput
          label={'New LO Id'}
          onChange={(e,value) => handleCurrentSelect(value.value,"newLo")}
          options={newCurrentLo}
          ></SearchableTextInput>
          <TextInput
            label='Remark'
            required
            touched
            value={remark}
            onChange={(e) => {
              setRemark(e.target.value);
            }}
          />
        </div>
        <div className='flex mt-8 gap-6'>
          <Button onClick={handleCancel}>Cancel</Button>
 
          <Button primary onClick={handleAssignLo}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
