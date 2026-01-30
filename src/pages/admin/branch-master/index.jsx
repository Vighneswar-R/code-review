import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContextProvider';
import { uploadCsvBranchMaster } from '../../../global'; // Assuming this function is correctly imported

export default function BranchMaster() {
    const { token } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [tableData, setTableData] = useState([]);

    // Function to handle file upload
    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);

        // Parse the CSV file and set table data
        parseCSV(selectedFile);
    };

    // Function to parse CSV file and set table data
    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.split(','));
            setTableData(rows);
        };
        reader.readAsText(file);
    };

    // Function to handle file upload
    const handleUpload = async () => {
        try {
            if (!file) {
                alert('Please select a file.');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const options = {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress(progress);
                },
            };

            await uploadCsvBranchMaster(formData, options);
            setFile(null);
            setUploadProgress(0);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        }
    };

    return (
        <div className="max-w-screen-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg flex">
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4"> Branch Master </h1>
                <div className="flex items-center mb-4">
                    <label className="w-32 flex justify-center items-center bg-gray-200 text-gray-700 rounded-lg p-2 cursor-pointer hover:bg-gray-300">
                        Select File
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {file && (
                        <span className="ml-3">{file.name}</span>
                    )}
                </div>
                <div className="mb-4">
                    {file && (
                        <progress value={uploadProgress} max="100" className="w-full" />
                    )}
                </div>
                <button
                    className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ${file ? '' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={handleUpload}
                    disabled={!file}
                >
                    Upload
                </button>
            </div>
            {tableData.length > 0 && (
                 <div className='absolute top-80 right-4 left-64'>
                    <h2 className="text-lg font-semibold mb-5">CSV File Preview</h2>
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full text-sm" style={{ minWidth: '1000px' }}>
                            <thead>
                                <tr className="bg-gray-200">
                                    {tableData[0].map((cell, index) => (
                                        <th key={index} className="border px-2 py-2">{cell}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border px-2 py-2">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}