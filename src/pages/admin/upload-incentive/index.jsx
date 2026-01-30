import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContextProvider';
import { uploadIncentive } from '../../../global';
export default function UploadIncentive() {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tableData, setTableData] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
      parseCSV(selectedFile);
    } else {
      alert('Preview is only supported for CSV & XLSX files.');
      setTableData([]);
    }
  };

  // Parse CSV file for preview
  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text
        .trim()
        .split('\n')
        .map((row) => row.split(','));
      setTableData(rows);
    };
    reader.readAsText(file);
  };

  // Handle file upload (API call commented)
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        await uploadIncentive(formData, {
        headers: {
          Authorization: token, 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      setUploadProgress(100);
      alert('File uploaded successfully!');

      setFile(null);
      setUploadProgress(0);
      setTableData([]);
    } catch (error) {
      console.error('Upload error:', error);

      if(error?.response?.data?.message){
        alert(error?.response?.data?.message);
        return;
      }
      alert('Upload failed');
    }
  };

  return (
    <div className='max-w-screen-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg'>
      <h1 className='text-2xl font-bold mb-4'>Upload Incentive File</h1>

      <div className='flex items-center mb-4'>
        <label className='bg-gray-200 text-gray-700 rounded px-4 py-2 cursor-pointer hover:bg-gray-300'>
          Select File
          <input
            type='file'
            accept='.csv,.xls,.xlsx'
            className='hidden'
            onChange={handleFileChange}
          />
        </label>
        {file && <span className='ml-4 text-sm'>{file.name}</span>}
      </div>

      {file && (
        <div className='mb-4'>
          <progress value={uploadProgress} max='100' className='w-full' />
        </div>
      )}

      <button
        className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ${file ? '' : 'opacity-50 cursor-not-allowed'}`}
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </button>

      {tableData.length > 0 && (
        <div className='mt-8 overflow-x-auto'>
          <h2 className='text-lg font-semibold mb-4'>CSV File Preview</h2>
          <table className='min-w-full border text-sm'>
            <thead className='bg-gray-100'>
              <tr>
                {tableData[0].map((cell, index) => (
                  <th key={index} className='border px-2 py-1'>
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className='border px-2 py-1'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}