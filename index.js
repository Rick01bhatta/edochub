import express from "express"
import cors from 'cors';
import {PORT} from "./config/env.js"
import connectToDatabase from "./database/mongodb.js";
import authRoutes from './routes/auth.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Welcome to out edochub system")
})

// Mount auth routes
app.use('/api/auth', authRoutes);

// Error handler (should be last)
app.use(errorHandler);

app.listen(PORT,async()=>{
    console.log(`Server is running on https://localhost:${PORT}`);
    await connectToDatabase();
})

export default app;