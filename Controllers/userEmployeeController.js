import UserSchema from "../Models/userEmployeeSchema.js";

export const createUser = async (req, res) => {
  try {
    
    const { username, password, role } = req.body;

    const user = await UserSchema.create({
      username,
      password,
      role,
    });

    res.status(201).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserSchema.find({});

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
