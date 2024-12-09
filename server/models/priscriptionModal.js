const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    content: {
      type: String, // Can hold text or a file path to the uploaded prescription
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the doctor
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String, // Optional notes added by the doctor
      required: false,
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt fields
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

module.exports = Prescription;
