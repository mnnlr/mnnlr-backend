import Leaves from "../Models/LeaveModel.js";

export const autoRemoveLeaves = async () => {
  const currentDate = new Date();

  try {
    const allLeaves = await Leaves.find({});
    console.log("all Leaves: ", allLeaves);

    // Iterate through each leave document
    for (const leaveDoc of allLeaves) {
      // Filter out expired leaves
      leaveDoc.leavesDetails = leaveDoc.leavesDetails.filter((item) => {
        return new Date(item.endDate) >= currentDate;
      });
      console.log("leave doc: ", leaveDoc);
      // Save the updated document back to the database
      await leaveDoc.save();
    }

    console.log("Expired leaves removed successfully: ");
  } catch (err) {
    console.error("Error while removing expired leaves:", err);
    throw err; // Re-throw the error to handle it in the cron job
  }
};
