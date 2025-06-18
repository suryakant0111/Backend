
// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({ path: "./.env" });


connectDB().then(()=>{
console.log("Database connected successfully");
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch((error) => {
    console.error("Database connection failed:", error);    
});





























/*
import express from "express";

const app = express();
(async()=>{
    try {
      await  mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}` )

      app.on("error", (err) => {
        console.error("Server error:", err);
        throw err;
      });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        
    }
})();
*/