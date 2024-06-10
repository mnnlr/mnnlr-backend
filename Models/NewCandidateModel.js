import mongoose from 'mongoose';

const NewCandidateSchema = new mongoose.Schema({
  personalDetails: {
    name: String,
    fathersName: String,
    email: String,
    phone: String,
    address: String,
    postCode: String,
    city: String,
  },
  education: [
    {
      school: String,
      city: String,
      startDate: Date,
      endDate: Date,
      description: String,
    },
  ],
  internships: [
    {
      company: String,
      role: String,
      startDate: Date,
      endDate: Date,
    },
  ],
  skills: [String],
  interview:{
    type:Boolean,
    default:false
  },
selected:{
    type:String,
    enum:['pending','selected','rejected'],
    default:'pending'
  }
});

const New_Candidate = mongoose.model('newcandidate', NewCandidateSchema);

export default New_Candidate;
