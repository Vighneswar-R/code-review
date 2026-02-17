import React, { useContext, useState,useRef,useEffect} from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContextProvider';
import { uploadCsvStatePin } from '../../../global'; // Assuming this function is correctly imported

export default function StatePin() {
    const { token } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [tableData, setTableData] = useState([]);

     const readerRef = useRef(null);

    const PREVIEW_LIMIT = 40;
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    // Function to handle file upload
    const handleFileUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

      // Validate file type
    //   if (
    //         selectedFile.type !== "text/csv" &&
    //         !selectedFile.name.toLowerCase().endsWith(".csv")
    //     ) {
    //         alert("Only CSV files are allowed.");
    //         return;
    //     }

          // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            alert("File too large. Maximum 2MB allowed.");
            return;
        }

        setFile(selectedFile);
        // Parse the CSV file and set table data
        parseCSV(selectedFile);

    };

    // Function to parse CSV file and set table data
    const parseCSV = (file) => {
        const reader = new FileReader();
        readerRef.current = reader;

        reader.onload = (e) => {
            const text = e.target.result;
            const allRows = text.split('\n');
            const previewRows = allRows.slice(0, PREVIEW_LIMIT);
            const rows = previewRows.map(row => row.split(','));

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

            await uploadCsvStatePin(formData, options);
            setFile(null);
            setTableData([]);
            setUploadProgress(0);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        }
    };

       useEffect(() => {   // clean-up for mounting 
        return () => {
            if (readerRef.current) {
                readerRef.current.abort();
            }
        };
    }, []);

    return (
        <div className="max-w-screen-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg flex">
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4"> State Pin</h1>
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
                <div className="absolute top-80 right-40">
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