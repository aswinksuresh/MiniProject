const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true,
        unique:true
    },
    field : {
        type:String,
        required:true,
    },
    specialization : {
        type:String,
        required:true,
    },
    time : {
        type:String,
        required:true,
    },
    location : {
        type:String,
        required:true,
    },
    availability: {
        type: Boolean,
        default: true
      }
})

const Doctor = new mongoose.model("Doctor", doctorSchema);
module.exports = Doctor; 
