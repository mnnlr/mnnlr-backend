import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({

    teamName: {
        type: String,
        required: true,
    },  

    PeojectLeader:{
        Id:{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'EmployeeSchema',
            required: true,
        },
        isSectionCompleted:{
            type:Boolean,
            default:false
        },
        isIntegrationDone:{
            type:Boolean,
            default:false
        },
        completionDate:{
            type:Date,
        },
    },

    projectName: {
        type: String,
        required: true,
    },

    teamMembers:[{
        Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmployeeSchema', // Ensure this matches the model name
            required: true,
        },
        isSectionCompleted:{
            type:Boolean,
            default:false
        },
        isIntegrationDone:{
            type:String,
            default:false
        },
        completionDate:{
            type:Date,
        },
    }],

    team: {
        type: String,
        required: true,
    },
    Shift: {
        type: String,
        required: true,
    }
});


const Team = mongoose.model('Team', TeamSchema);

export default Team;