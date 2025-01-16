// import EmployeeSchema from '../Models/employeeSchema.js';
import Team from '../Models/TeamModel.js';

const getTeam = async (req, res) => {
    const { shift } = req.query;

    const team = await Team.find({ Shift: shift})
    .populate({
        path: 'PeojectLeader.Id',
        select: 'firstName lastName avatar designation designationLevel employeeId'
    }).populate({
        path: 'teamMembers.Id',
        select: 'firstName lastName avatar designation designationLevel employeeId'
    });



    res.status(200).json({ data: team, success: true });
}

const createTeam = async (req, res,next) => {

    const {projectName,teamLeader,teamName,teamMembers,team,Shift } = req.body;

    if (!teamLeader || !projectName || !teamName || !teamMembers || !team || !Shift) {
        return next(new ErrorHandler(400, "Please provide all the required fields"));
    }



    const teamData = {
        projectName,
        teamName,
        PeojectLeader: {
            Id: teamLeader?._id,
            isSectionCompleted: false,
            isIntegrationDone: false,
            completionDate: null
        },
        teamMembers:teamMembers.map((member) => {
            return {
                Id: member?._id,
                isSectionCompleted: false,
                isIntegrationDone: false,
                completionDate: null
            }
        }),
        team,
        Shift
    }

    await Team.create(teamData);

    res.status(200).json({ message:'team created successfully', success: true });

}

export { createTeam,getTeam }