import user_model from "../Models/user_model.js";
import Employee from "../Models/employeeSchema.js";

export const hrTeamById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "id is not provided" });
  }

  try {
    const user = await user_model.findOne({ _id: id });

    if (!user || user.role !== "hr")
      return res
        .status(400)
        .json({ success: false, message: "user id is not valid." });

    const hrData = await Employee.findOne({ userId: user._id }).populate(
      "AssignedTeamsToHR",
    );

    if (
      !hrData ||
      !hrData.AssignedTeamsToHR ||
      hrData.AssignedTeamsToHR.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No HR data found with the given ID.",
      });
    }

    const TeamData = await Employee.find({
      employeeTeam: { $in: hrData.AssignedTeamsToHR },
    });

    return res.status(200).json({
      success: true,
      message: "Data found",
      data: {
        Team: hrData.AssignedTeamsToHR,
        Employees: TeamData,
      },
    });
  } catch (err) {
    console.error("Error: ", err);
    return res
      .status(500)
      .json({ success: false, message: "someting went wrong.", error: err });
  }
};
