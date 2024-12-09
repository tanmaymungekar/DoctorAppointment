const Prescription = require("../models/prescriptionModel");
const Appointment = require("../models/appointmentModel");

const createPrescription = async (req, res) => {
  const { appointmentId, content, notes } = req.body;

  try {
    // Check if the appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Create a new prescription
    const prescription = new Prescription({
      appointmentId,
      content,
      notes,
      createdBy: req.user.id, // Assuming `req.user.id` holds the logged-in doctor's ID
    });

    await prescription.save();

    return res.status(201).json({
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return res.status(500).json({ error: "Unable to create prescription" });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  const { userId } = req.params; // Patient's user ID

  try {
    const prescriptions = await Prescription.find()
      .populate({
        path: "appointmentId",
        match: { userId }, // Only fetch prescriptions where the patient matches
        select: "date time doctorId", // Select relevant fields
        populate: { path: "doctorId", select: "name" }, // Include doctor details
      })
      .sort({ createdAt: -1 });

    // Filter out prescriptions that don’t match the userId
    const filteredPrescriptions = prescriptions.filter(
      (p) => p.appointmentId !== null
    );

    return res.status(200).json(filteredPrescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return res.status(500).json({ error: "Unable to fetch prescriptions" });
  }
};

const getPrescriptionById = async (req, res) => {
  const { prescriptionId } = req.params;

  try {
    const prescription = await Prescription.findById(prescriptionId).populate({
      path: "appointmentId",
      select: "date time userId doctorId",
      populate: [
        { path: "userId", select: "name" },
        { path: "doctorId", select: "name" },
      ],
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return res.status(500).json({ error: "Unable to fetch prescription" });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
};
