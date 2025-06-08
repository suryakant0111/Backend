import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";





const connectDB = async () => {
    try {
      const connectionInstence =  await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
      console.log(`Connected to MongoDB at ${connectionInstence.connection.host}...`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
        
    }
}

export default connectDB;