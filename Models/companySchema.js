import mongoose from "mongoose";
const companySchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  ceo: {
    type: String,
    required: true,
  },
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
  video: {
    public_id: {
      type: String,
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
  },
  paragraphofcompany: String,
  history: String,
  employees: {
    type: Number,
    default: 0, // Default value
  },
  turnover: {
    type: Number,
    default: 0, // Default value
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
});

const Company = mongoose.model("Company", companySchema);

export default Company;
