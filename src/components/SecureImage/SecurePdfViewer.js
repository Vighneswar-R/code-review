import React, { useState, useEffect } from "react";
import axios from "axios";

const securePdfViewer = (imageUrl, token) => {
  const [images, setImages] = useState([]); // Store fetched PDFs here
  const [error, setError] = useState(null);
  const [test, setTest] = useState([]); // Additional state, if needed

  // Function to test fetching a single PDF (for debugging purposes)
  const testFetch = async () => {
    try {
      console.log("URL passed:", imageUrl);

      const data = await axios.get(imageUrl?.[0]?.document_fetch_url, {
        headers: { 'Authorization': token },
      });

      console.log("First document fetch URL:", imageUrl?.[0]?.document_fetch_url);
      console.log("Test fetch response data:", data);
    } catch (err) {
      console.error("Error in testFetch:", err);
    }
  };

  // Function to fetch all PDFs
  const fetchPdfs = async () => {
    try {
      const pdfUrls = await Promise.all(
        imageUrl?.map(async (pdf) => {
          const url = typeof pdf === "string" ? pdf : pdf?.document_fetch_url;

          return axios.get(url, {
            headers: {
              'Authorization': token,
            },
            responseType: 'blob',
          })
          .then((resp) => {
            console.log("PDF Blob data:", resp?.data);
            // Create Object URL for each Blob to make it viewable
            return URL.createObjectURL(new Blob([resp.data], { type: 'application/pdf' }));
          })
          .catch((error) => {
            console.error("Error fetching PDF:", error);
            setError("Failed to fetch some PDFs");
            return null;
          });
        })
      );

      console.log("Fetched PDF blob URLs:", pdfUrls);
      setImages(pdfUrls.filter((url) => url !== null)); // Filter out failed fetches
      setTest(pdfUrls); // Optional, depends on usage
    } catch (error) {
      console.error("Error in fetchPdfs:", error);
      setError("An error occurred while fetching PDFs");
    }
  };

  // Clean up Blob URLs when the component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach((imageUrl) => {
        if (typeof imageUrl === 'string') {
          URL.revokeObjectURL(imageUrl); // Clean up Blob URL
        }
      });
    };
  }, [images]); // Re-run cleanup when images array changes

  useEffect(() => {
    fetchPdfs(); // Fetch PDFs on component mount
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    testFetch(); // Run test fetch when imageUrl changes
  }, [imageUrl]);

  return { images, error };
};

export default securePdfViewer;
