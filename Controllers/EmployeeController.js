import Employee from "../Models/EmployeeModel.js";
// import { ErrorHandler } from "../utils/errorHendler.js";
const addEmployee = async (req, res,next) => {
    try {
        
        console.log('I have been called',req?.file)

        const newEmployee = new Employee({
            name: req.body.name,
            designation: req.body.designation,
            level: req.body.level,
            about: req.body.about,
            experience: req.body.experience,
            image: req?.file?.buffer.toString('base64')
        });
        await newEmployee.save();
        res.status(201).json({ message: 'Employee data saved successfully' });
    } catch (error) {
        console.error('Error saving employee data:', error);
        next(error);
    }
};

const getAllEmployee = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export {addEmployee,getAllEmployee}