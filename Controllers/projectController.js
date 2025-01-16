import cloudinary from "cloudinary";
import Project from "../Models/projectSchema.js";

export const createNewProject = async (req, res) => {
  try {
    const myCloud1 = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const { projectTitle, aboutProject } = req.body;

    const project = await Project.create({
      projectTitle,
      aboutProject,
      avatar: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
    });

    res
      .status(201)
      .json({ success: true, message: "Data Saved Successfully", project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({});

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    const imageId = project.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);

    await project.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Client Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
