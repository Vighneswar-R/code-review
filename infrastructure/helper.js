const getIstTime = () =>{
  const now = new Date();

// IST offset is +5:30 → 330 minutes
const IST_OFFSET_MINUTES = 330;

const updated_at_ist = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000);

return updated_at_ist
}




module.exports = {getIstTime}