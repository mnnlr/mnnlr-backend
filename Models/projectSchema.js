import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

  avatar: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },

  projectTitle: {
    type: String,
    required: true,
  },

  aboutProject: {
    type: String,
    required: true,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
