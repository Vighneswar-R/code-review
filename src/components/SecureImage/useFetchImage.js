import { useState, useEffect } from "react";
import axios from "axios";

const useFetchImage = (imageUrls, token,doc_stage) => {
  const [images, setImages] = useState([]); // Store all images in an array
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageUrls || !token) {
      // setError(new Error("Invalid image URLs or token"));
      setLoading(false);
      return;
    }



    const fetchImages = async () => {

      try {
        // Fetch all images concurrently while ensuring the order is maintained
        const fetchedImages = await Promise.all(
          imageUrls.map((image, index) => {
            const url = typeof image === "string"
              ? image
              : doc_stage === "banking_docs"
                ? image?.fetch_url
                : image?.document_fetch_url;
        
            return axios
              .get(url, {
                headers: {
                  Authorization: `${token}`,
                },
                responseType: "blob",
              })
              .then((response) => ({
                index,
                imageBlobUrl: URL.createObjectURL(response.data),
              }))
              .catch((err) => {
                console.warn("ERROR BLOB", err);
        
                // Return a fallback object so sort/map won't fail
                return {
                  index,
                  imageBlobUrl: null, // Or use a placeholder image URL if needed
                };
              });
          })
        );


        if(!fetchedImages?.length || !fetchedImages || fetchedImages == null) return;


        console.log("IMAGE ISSUE",fetchedImages)


        // Sort the fetched images by their original index to preserve order
        const sortedImages = fetchedImages
        .filter(item => item?.imageBlobUrl) // Remove failed images
        .sort((a, b) => a?.index - b?.index)
        .map(item => item.imageBlobUrl);

        setImages(sortedImages); // Update state with all fetched images in the correct order
        setLoading(false); // Set loading state to false after fetch is complete
      } catch (error) {
        console.log("Error fetching images:", error);
        setError(error); // Set error state
        setLoading(false); // Stop loading
      }
    };

    fetchImages();

    // Clean up: Revoke object URLs to prevent memory leaks
    return () => {
      images.forEach((imageUrl) => {
        URL.revokeObjectURL(imageUrl);
      });
    };
  }, [token]);  //imageUrls,

  return { images, isLoading, error };
};

export default useFetchImage;