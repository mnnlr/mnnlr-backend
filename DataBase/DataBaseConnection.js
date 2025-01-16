import mongoose from "mongoose";

const Connection = async (req, res) => {
  try {
    const data = await mongoose.connect(process.env.MONGO_URL, {});
    console.log(`Mongodb connected with server : ${data.connection.host}`);
  } catch (error) {
    console.log(`Error while connecting with database`, error.message);
  }
};

export default Connection;
