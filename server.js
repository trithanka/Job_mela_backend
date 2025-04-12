const express=require("express");
const app=express();
const port=5000
const dotenv=require("dotenv");
dotenv.config()
const cors = require("cors");
//cors
// jsut for test
app.use(cors({
    origin: '*'
}));

app.use(express.json())
app.use("/v1",require("./src/routes/route"))


app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})
