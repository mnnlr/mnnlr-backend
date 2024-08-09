import moment from "moment";

async function calculateTotalWorkingHours(attandance, period) {
  // console.log('attandance : ',attandance)
  if (!attandance?._id) return;

  // const now = new Date();
  // let startDate;

  // switch (period) {
  //   case "today":
  //     startDate = new Date(now.setHours(0, 0, 0, 0));
  //     break;
  //   case "week":
  //     startDate = new Date(now.setDate(now.getDate() - now.getDay()));
  //     startDate.setHours(0, 0, 0, 0);
  //     break;
  //   case "month":
  //     startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  //     break;
  //   case "year":
  //     startDate = new Date(now.getFullYear(), 0, 1);
  //     break;
  //   default:
  //     throw new Error("Invalid period specified.");
  // }

  // console.log('attandance : ',attandance)

  let totalSeconds = 0;
  let calculatedAttendance = null;

  const attandanceObj = attandance.toObject();
  
console.log('attandanceObj : ',attandanceObj)
  calculatedAttendance = { ...attandanceObj, timeTracking: [] };

  attandanceObj.timeTracking.forEach(entry => {

    const timeIn = moment(entry.timeIn, 'HH:mm:ss');
    if(!entry.timeOut){
      console.log('current time : ',new Date().toTimeString().split(' ')[0])
    }
    const timeOut = entry.timeOut ? moment(entry.timeOut, 'HH:mm:ss') : moment( new Date().toTimeString().split(' ')[0], 'HH:mm:ss');

    const duration = moment.duration(timeOut.diff(timeIn));
    
    calculatedAttendance.timeTracking.push({
      ...entry,
      duration: `${String(duration.hours()).padStart(2, '0')}:${String(duration.minutes()).padStart(2, '0')}:${String(duration.seconds()).padStart(2, '0')}`
    });

    totalSeconds += duration.asSeconds();
  });

  const totalWorkingHours = `${String(Math.floor(totalSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(totalSeconds % 60)).padStart(2, '0')}`;
  calculatedAttendance.totalWorkingHours = totalWorkingHours;
 

  return new Promise((resolve,reject)=>{
    resolve({calculatedAttendance,totalSeconds});
    reject('error while calculating total working hours')
  })
}

export default calculateTotalWorkingHours;
