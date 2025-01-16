import EmployeeLoginLogout from "../Models/adminUserSchema.js";
import EmployeeUpdation from "../Models/employeeRegistration.js";

//Emloyee registration with default password

export const EmployeeRegistration = async (req, res) => {
 
  const { username, password } = req.body;
  try {
    const user = await EmployeeUpdation.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = password;

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//login and logout
export const loginLogout = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await EmployeeLoginLogout.findOne({ username, password });
  
    if (user) {
      const token = jwt.sign({ username: user.username }, "jwt-secret-key", {
        expiresIn: "40m",
      });
      res.cookie("token", token);
      res.status(200).send("Login successful");
      const tuser = EmployeeLoginLogout({
        username: username,
        password: password,
        loginTime: new Date(),
      });
      await tuser.save();
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error");
  }
};
