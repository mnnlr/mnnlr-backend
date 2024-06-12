import mongoose from "mongoose";

const contectusSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  phoneNo: {
    type: Number,
    require: true,
  },

  message: {
    type: String,
    require: true,
  },
});

const ContactUs = mongoose.model("ContactUs", contectusSchema);

export default ContactUs;
