const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      required: true
    },
    patientName: {
      type: String,
      required: true,

    },
    time: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    }
  });
  appointmentSchema.index({ patientName: 1, doctorName: 1 }, { unique: true });
const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;

