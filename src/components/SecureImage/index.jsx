import React, { useEffect, useState,useRef } from 'react';
import useFetchImage from './useFetchImage'; // Path to your custom hook
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import PropTypes from 'prop-types';


import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message || "Something went wrong!"}</div>;
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const SecureImage = ({ imageUrl, token, is_pdf,doc_stage,view_port,setIsModalOpen,after_submit,setCurrentImg}) => {
  const { images, isLoading, error } = useFetchImage(imageUrl, token,doc_stage);
  const [selectedImage, setSelectedImage] = useState(0);
  const location = useLocation();
  const [numPages, setNumPages] = useState(null);
  const [checkPdf, setCheckPdf] = useState(false);
  const opened = useRef(false)


  const [passwordTried, setPasswordTried] = useState(false);  // prevent re-prompt
  const [viewerClosed, setViewerClosed] = useState(false);    // used to hide the viewer


  const onHandleNext = () => {
    if (images && selectedImage < images.length - 1) {

      sessionStorage.setItem('isOpen',false)

      setSelectedImage((prev) => prev + 1);
      

      setCheckPdf(false)

    }
  };

  const handlePassword = (callback, reason) => {
    if (passwordTried || viewerClosed) return; // already tried or cancelled

    const password = prompt('Enter the PDF password:');
    setPasswordTried(true); // whether valid or not, do not prompt again

    if (password) {
      callback(password); // try opening with password
    } else {
      setViewerClosed(true); // user clicked cancel or left it empty
      setIsModalOpen(false);
    }
  };


  const onHandlePrev = () => {
    if (images && selectedImage > 0) {

      sessionStorage.setItem('isOpen',false)

      setSelectedImage((prev) => prev - 1);

    }

    setCheckPdf(false)

  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages || 0); // Handle undefined or null numPages
  };

  useEffect(() => {
    if (!images || !images[selectedImage] || !images[selectedImage] == null) return;

    const decodeImage = (blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const uint8Array = new Uint8Array(reader.result);

        const isPdf =
          uint8Array[0] === 0x25 &&
          uint8Array[1] === 0x50 &&
          uint8Array[2] === 0x44 &&
          uint8Array[3] === 0x46;

        const isJpeg =
          uint8Array[0] === 0xff && uint8Array[1] === 0xd8;

        setCheckPdf(isPdf);
      };

      reader.readAsArrayBuffer(blob);
    };

    if (typeof images[selectedImage] === 'string') {
      fetch(images[selectedImage])
        .then((response) => response.blob())
        .then(decodeImage)
        .catch((err) => console.error('Error fetching image as blob:', err));
    } else if (images[selectedImage] instanceof Blob) {
      decodeImage(images[selectedImage]);
    }

  }, [selectedImage, images]);


  useEffect(()=> {
// alert(checkPdf)
  },[checkPdf])



  useEffect(()=> {

    // if(checkPdf) {

    //   if(doc_stage == 'id_proof_photos' || doc_stage == 'address_proof_photos') {
    //     null;
    //   }
    //   else {

    //     const newTab = window.open(images[selectedImage]);

    //   }
    // }
    
      if(doc_stage == 'application_form' && after_submit == true){
        setCurrentImg(images[selectedImage]);
        return;
      }

    let opened = sessionStorage.getItem('isOpen')

    if (    //      images[selectedImage] &&

      checkPdf &&
      (!opened || opened == "false")&&
      doc_stage !== 'id_proof_photos' &&
      doc_stage !== 'address_proof_photos'
    ) {
      
    
      window.open(images[selectedImage]);

      sessionStorage.setItem('isOpen',true);

  
  };

    
  },[selectedImage,images[selectedImage],images,checkPdf])

  const renderPdf = () => {
    if (!images || !images[selectedImage]) return <p>No PDF to display</p>;

    // if (images[selectedImage]) {

    //   if(doc_stage == 'id_proof_photos' || doc_stage == 'address_proof_photos') {
    //     null;
    //   }
    //   else {

    //     const newTab = window.open(images[selectedImage]);
    //   }
    // }


    return (
      <Box
        sx={{
          width: '100%',
          height: (doc_stage == 'id_proof_photos' || doc_stage == 'address_proof_photos')?'70vh': doc_stage == 'application_form'?'80vh':'30vh',
          display: 'flex',
          justifyContent: doc_stage == 'application_form'?'none':'center',
          alignItems: doc_stage == 'application_form'?'none':'center',
          overflow: doc_stage == 'application_form'?'none':'auto',
        }}
      >

<ErrorBoundary>

{(typeof images[selectedImage] === 'string' && images[selectedImage].trim() !== '') ? (
  <div style={{overflow:doc_stage == 'application_form'?'auto':'',width:doc_stage == 'application_form'?'80vw':'',height:doc_stage == 'application_form'?'70vh':''}}>

  {viewerClosed ? (
        <p>PDF viewer closed.</p>
      ) :(
    <Document
      file={images[selectedImage]}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={(error) => {
        console.error('Error loading PDF:', error);
        setCheckPdf(false);
      }}
      renderTextLayer={false}
      renderMode="canvas"
      loading="Loading PDF..."
      
    //     onPassword={(callback, reason) => {
    //   if (reason === 1 || reason === 2) {
    //     // Don't call callback here, or do it only once
    //     setPasswordFailed(true); // control with state
    //   }
    // }}
          onPassword={handlePassword}

    >
      {Array.from({ length: numPages || 0 }, (_, index) => (
        <div
          key={index}
          style={{
            width:'90vw',
            height: doc_stage === 'id_proof_photos' || doc_stage === 'address_proof_photos' ? '90vh' : doc_stage == 'application_form'?'80vh':'30vh',
            overflow:doc_stage == 'application_form'?'auto':'none'
          }}
        >
          <Page pageNumber={index + 1} width={doc_stage == 'application_form'?340:''}/>
        </div>
      ))}
    </Document>
      )}
    </div>
  ) : (
    <p>No valid PDF available</p>
  )}
        </ErrorBoundary>
      </Box>
    );
  };

  const renderImage = () => {
    if (!images || !images[selectedImage] || !images[selectedImage] == null) return <p>No Image to display</p>;

    return (
      <img
        src={images[selectedImage]}
        alt={`Image ${selectedImage}`}
        className={`${location?.pathname !== '/lead/upload-documents'?'h-full':view_port?'h-full':'h-10'} w-full object-contain object-center rounded-t-lg`}
        onError={() => console.error('Error loading image')}
    />
    );
  };

  return (
    <div className="relative w-full" style={{ height: !checkPdf?'350px':'' }}>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading images: {error}</p>}
      {!isLoading && !error && (checkPdf ? renderPdf() : renderImage())}

      {images?.length > 1 &&
        location?.pathname !== '/lead/upload-documents' &&
        location?.pathname !== '/lead/banking-details/manual' && (
          <div>
            <button
              onClick={onHandlePrev}
              disabled={selectedImage === 0}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 focus:outline-none flex items-center justify-center z-10${
                selectedImage === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ArrowBackIcon fontSize="large" />
            </button>
            <button
              onClick={onHandleNext}
              disabled={selectedImage >= images.length - 1}
              // className={`absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none flex items-center justify-center ${
              //   selectedImage >= images?.length-1
              //     ? 'opacity-50 cursor-not-allowed'
              //     : ''
              // }`}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none flex items-center justify-center z-10 ${
                 selectedImage >= images?.length-1
                  ? 'opacity-50 cursor-not-allowed'
               : ''}`}

            >
              <ArrowForwardIcon fontSize="large" />
            </button>
          </div>
        )}
    </div>
  );
};

export default SecureImage;
