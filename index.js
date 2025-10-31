import express from "express"
import {PORT} from "./config/env.js"
import connectToDatabase from "./database/mongodb.js";


const app=express();


app.get("/",(req,res)=>{
    res.send("Welcome to out edochub system")
})

app.listen(PORT,async()=>{
    console.log(`Server is running on https://localhost:${PORT}`);
    await connectToDatabase();
})

export default app;