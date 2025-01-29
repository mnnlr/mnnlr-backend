import EmployeeSchema from "../Models/employeeSchema.js";

export const verifyEmp = async (req, res) => {
  const { mnnlrId, mnnlrEmail } = req.body;

  if (!mnnlrId || !mnnlrEmail)
    return res.status(400).json({
      success: false,
      message: "mnnlr EmployeeID and mnnlr EmploueeEmail is not provided.",
    });

  try {
    const isEmp = await EmployeeSchema.findOne({
      employeeId: mnnlrId,
      email: mnnlrEmail,
    });

    if (isEmp)
      return res.status(200).json({
        success: true,
        data: isEmp,
        message: "EmployeeID and EmployeeEmail is found in database.",
      });

    if (!isEmp)
      return res.status(404).json({
        success: false,
        message: "EmployeeID and EmploueeEmail was not found in database.",
      });
  } catch (err) {
    return res.status(500).json({ success: false, message: err });
  }
};
