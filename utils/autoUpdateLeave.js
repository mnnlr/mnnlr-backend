import EmployeeSchema from "../Models/employeeSchema.js";
import Leave from "../Models/LeaveModel.js";

const autoUpdateLeave = async () => {
  const now = new Date();

  const employees = await EmployeeSchema.find();

  for (const employee of employees) {

    const joinDate = new Date(employee.createdAt);

    const monthsSinceJoining = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24 * 30));

    if (monthsSinceJoining >= 1) {

      const leave = await Leave.findOne({
        employeeId: employee._id,
        createdAt: {
          $gte: new Date(new Date(joinDate).getFullYear(), 0, 1),
          $lt: new Date(new Date(joinDate).getFullYear() + 1, 0, 1)
        }
      });

      let numberOfLeavesToIncrement = 0;
      
      if(!leave || !leave?.updatedAt){
        numberOfLeavesToIncrement = monthsSinceJoining%12;
      }

      if(leave?.updatedAt){

        const lastUpdated = new Date(leave.updatedAt);

        const monthsSinceLastUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24 * 30));

        if(leave?.updatedAt?.getMonth() !== lastUpdated.getMonth()){

          numberOfLeavesToIncrement = (monthsSinceJoining%12) - monthsSinceLastUpdate;

        }
      }

      if (numberOfLeavesToIncrement > 0) { 

        await Leave.findOneAndUpdate(
          { 
            employeeId: employee._id,
            createdAt: {
              $gte: new Date(new Date(joinDate).getFullYear(), 0, 1),
              $lt: new Date(new Date(joinDate).getFullYear() + 1, 0, 1)
            } 
          },
          {
            $inc: {
              sickLeaveBalance: numberOfLeavesToIncrement,
              casualLeaveBalance: numberOfLeavesToIncrement,
            },
            $set: { updatedAt: now }
          },
          { new: true, upsert: true }
        );

        console.log(`Updated leave for employee ${employee._id}: Incremented by ${numberOfLeavesToIncrement} months`);
      }
    
    }
  }
};


export {
  autoUpdateLeave
};
