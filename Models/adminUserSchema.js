import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  username: String,
  password: String,
  loginTime: { type: Date, default: Date.now },
  logoutTime: { type: Date },
});

const EmployeeLoginLogout = mongoose.model(
  "EmployeeLoginLogout",
  employeeSchema
);

export default EmployeeLoginLogout;
