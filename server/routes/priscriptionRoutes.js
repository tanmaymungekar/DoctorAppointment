const express = require("express");
const {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
} = require("../controllers/prescriptionController");
const authMiddleware = require("../middleware/auth"); // Ensure users are authenticated

const router = express.Router();

// Create a new prescription
router.post("/prescriptions", authMiddleware, createPrescription);

// Get all prescriptions for a patient
router.get(
  "/prescriptions/patient/:userId",
  authMiddleware,
  getPrescriptionsByPatient
);

// Get a single prescription by ID
router.get(
  "/prescriptions/:prescriptionId",
  authMiddleware,
  getPrescriptionById
);

module.exports = router;
