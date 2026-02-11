function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}


// set coords distance calc helper

function totalHaversineDistance(points) {
  const R = 6371; // km
  const toRad = deg => (deg * Math.PI) / 180;

  const haversine = (p1, p2) => {
    const dLat = toRad(p2.lat - p1.lat);
    const dLon = toRad(p2.lon - p1.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(p1.lat)) *
        Math.cos(toRad(p2.lat)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
  };

  return points.reduce((total, curr, i) => {
    if (i === 0) return total;
    return total + haversine(points[i - 1], curr);
  }, 0);
}


function calculateTotalDues(emi,additional){

  let fields = ["emi_for_month","arrear_emi","arrear_bounce_emi","bounce_charges","visit_charges"];

  let total = 0;

  for(const field of fields){

    if(additional?.length && additional?.includes(field)) continue;

    if(emi?.[field] && parseInt(emi?.[field]) == emi?.[field]) total = total + Number(emi?.[field]);

    console.log("FIELD",field,emi?.[field])


  };

  return total;

}


const calculatePaymentRecieved = (payments) =>{

  let total = 0;

  for(const pay of payments){

    total += pay?.amount || 0;
  }

  return total;

}


module.exports = {haversine,calculateTotalDues,totalHaversineDistance,calculatePaymentRecieved}