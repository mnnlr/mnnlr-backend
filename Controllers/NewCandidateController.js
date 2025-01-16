import New_Candidate from "../Models/NewCandidateModel.js";

const getAllNewCandidates = async (req, res) => {
    try {
      const Found_New_Candidates = await New_Candidate.find();
      res.status(200).json({success:true,Data:Found_New_Candidates});
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
}

const getNewCandidateById = async (req, res) => {
    try {

      const Found_New_Candidate = await New_Candidate.findById(req.params.id);

      res.status(200).json({success:true,Data:Found_New_Candidate});
    } catch (error) {
      res.status(404).send({ message: error.message });
    }
}

const updateCandidateById = async (req, res) => {

    try {
        
        const { id } = req.params;
        const { interview,selected } = req.body;

        const updatedCandidate = await New_Candidate.findByIdAndUpdate(id, { interview:interview,selected:selected?'selected':'rejected'}, { new: true });
        console.log('updated candidate info :- ',updatedCandidate);
        res.status(200).json({success:true,message:'Candidate updated successfully!'});
    
    } catch (error) {
    
        res.status(404).send({ message: error.message });
    
    }

}

const ApplyCandidacy = async (req, res) => {
    try {
      const resume = new New_Candidate(req.body);
      await resume.save();
      res.status(201).json({success:true,message:'Resume submitted successfully!'});
    } catch (error) {
      res.status(400).send(error);
    }
  }

export {getAllNewCandidates,ApplyCandidacy,getNewCandidateById,updateCandidateById};