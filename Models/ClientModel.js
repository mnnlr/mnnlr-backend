import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  clientName: String,
  companyName: String,
  rating: Number,
  Images: Array,
  video: String,
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
