import mongoose from "mongoose";

const employeeUpdation = new mongoose.Schema({
  username: String,
  password: {
    type: String,
    default: "Anand.ceo@123",
  },
});

const EmployeeUpdation = mongoose.model("EmployeeUpdation", employeeUpdation);

export default EmployeeUpdation;
