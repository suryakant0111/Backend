import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';


const app = express()


app.use(cors({ 
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));

app.use(express.json({limit:  "16kb"}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static('public'));
app.use(cookieParser());



app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is healthy" });
});



// Importing routes
import userRoutes from './routes/user.routes.js';
app.use('/api/v1/user', userRoutes);
// https://localhost:5000/api/v1/user/register


export {app}