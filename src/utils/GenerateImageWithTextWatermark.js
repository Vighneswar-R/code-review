import moment from 'moment';

const base64ToBlob = async (base64String) => {
  const [, contentType, base64Data] = base64String.match(/^data:(.*);base64,(.*)$/);

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

const splitTextToMultiline = (line1, line2, line3) => {
  let lines = [];
  lines.push(line3);
  lines.push(line2);
  lines.push(line1);

  return lines;
};

// const generateImageWithTextWatermark = async (
//   lead_id,
//   employee_code,
//   first_name,
//   middle_name,
//   last_name,
//   lat,
//   long,
//   bankStatementFile,
// ) => {
//   return new Promise((resolve, reject) => {
//     let timeStamp = moment().format('DD/MM/YYYY, h:mm:ss a');

//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     const img = new Image();

//     img.src = URL.createObjectURL(bankStatementFile);

//     img.onload = async () => {
//       if (img?.height > img?.width) {
//         canvas.height = 1920;
//         canvas.width = 1080;
//       } else {
//         canvas.height = 1080;
//         canvas.width = 1920;
//       }

//       ctx.fillStyle = 'black';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height - 180);
//       ctx.font = '32px Poppins';
//       ctx.fillStyle = 'white';
//       //ctx.fillStyle = '#E33439';

//       let name = [];

//       if (first_name) {
//         name.push(first_name);
//       }

//       if (middle_name) {
//         name.push(middle_name);
//       }

//       if (last_name) {
//         name.push(last_name);
//       }

//       const multilineText = splitTextToMultiline(
//         `CAF: ${lead_id}; Lat:${lat}; Long:${long}`,
//         `EMP code: ${employee_code}; Timestamp: ${timeStamp}`,
//         `LO Name: ${name?.join(' ')}`,
//       );

//       const padding = 30;
//       const textX = padding;
//       const textY = canvas.height - padding;
//       ctx.textAlign = 'left';
//       ctx.textBaseline = 'bottom';

//       multilineText.forEach((line, index) => {
//         ctx.fillText(line, textX, textY - index * 40);
//       });

//       const processedImageUrl = await canvas.toDataURL('image/jpeg', 1);

//       let base64Blob = await base64ToBlob(processedImageUrl);

//       const image = new File([base64Blob], bankStatementFile.name, { type: 'image/jpeg' });

//       resolve(image);
//     };
//     img.onerror = (error) => {
//       reject(error);
//     };
//   });
// };

const generateImageWithTextWatermark = async (
  visitId = null,
  lead_id=null,
  employee_code,
  first_name,
  middle_name,
  last_name,
  lat,
  long,
  bankStatementFile
) => {
  return new Promise((resolve, reject) => {
    console.log("visitId", visitId,lead_id)
    let timeStamp = moment().format('DD/MM/YYYY, h:mm:ss a');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = URL.createObjectURL(bankStatementFile);

    img.onload = () => {
      URL.revokeObjectURL(img.src); // Free memory

      if (img.height > img.width) {
        canvas.height = 1920;
        canvas.width = 1080;
      } else {
        canvas.height = 1080;
        canvas.width = 1920;
      }

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height - 180);

      ctx.font = '32px Poppins';
      ctx.fillStyle = 'white';

      const name = [first_name, middle_name, last_name].filter(Boolean).join(' ');
      const idLabel = visitId ? `VisitID: ${visitId}` : `CAF: ${lead_id}`
       const multilineText = [
        `${idLabel}; Lat:${lat}; Long:${long}`,
        `EMP code: ${employee_code}; Timestamp: ${timeStamp}`,
        `LO Name: ${name}`,
      ];

      const padding = 30;
      const textX = padding;
      const textY = canvas.height - padding;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';

      multilineText.forEach((line, index) => {
        ctx.fillText(line, textX, textY - index * 40);
      });

      // Use toBlob instead of toDataURL to prevent memory issues
      canvas.toBlob((blob) => {
        const image = new File([blob], bankStatementFile.name, { type: 'image/jpeg' });
        resolve(image);
      }, 'image/jpeg', 0.8); // Reduce quality slightly to save space
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};


export default generateImageWithTextWatermark;