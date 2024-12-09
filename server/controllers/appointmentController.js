const { default: mongoose } = require("mongoose");
const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

const getallappointments = async (req, res) => {
  try {

    let keyword
    let appointments;
    if (req.query.search) {
      keyword = req.query.search
        ? {
          $or: [{ userId: req.query.search }, { doctorId: req.query.search }],
        }
        : {};
      appointments = await Appointment.find(keyword)
        .populate("doctorId")
        .populate("userId");
      // }

    }

    if (req.query.user) {

      console.log("req.query.userId", req.query.user);

      keyword = { userId: mongoose.Types.ObjectId(req.query.user) };

      console.log("asdads",[
        { $match: keyword }, // Match appointments based on userId
        {
          $lookup: {
            from: "users", // Name of the Doctor collection
            localField: "doctorId", // Field in Appointment collection
            foreignField: "_id", // Field in Doctor collection
            as: "doctorDetails", // Name of the output array
          },
        },
        { 
          $unwind: {
            path: "$doctorDetails", // Unwind the doctorDetails array
            preserveNullAndEmptyArrays: true, // Keep documents without matches
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            doctorId: 1,
            date: 1, // Include any additional fields from Appointment
            time: 1, // Example: appointment time
            "doctorDetails.firstname": 1,
            "doctorDetails.lastname": 1,
            "doctorDetails.email": 1, // Include more fields if needed
          },
        },
      ])

      // Use aggregation pipeline to join the `Doctor` collection
      appointments = await Appointment.aggregate([
        { $match: keyword }, // Match appointments based on userId
        {
          $lookup: {
            from: "users", // Name of the Doctor collection
            localField: "doctorId", // Field in Appointment collection
            foreignField: "_id", // Field in Doctor collection
            as: "doctorDetails", // Name of the output array
          },
        },
        {
          $unwind: {
            path: "$doctorDetails", // Unwind the doctorDetails array
            preserveNullAndEmptyArrays: true, // Keep documents without matches
          },
        },
        {
          $lookup: {
            from: "doctors", // Join with the 'doctor' collection
            localField: "doctorDetails._id", // Field in Users collection (_id)
            foreignField: "userId", // Field in Doctor collection
            as: "doctorAdvance", // Output array name
          },
        },
        {
          $unwind: {
            path: "$doctorAdvance", // Unwind the doctorDetails array
            preserveNullAndEmptyArrays: true, // Keep documents without matches
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            doctorId: 1,
            date:1,
            time:1,
            prescription:1,
            // firstname:1,
            // lastname:1,
            "doctorDetails.firstname": 1, // Project only the doctor's first name
            "doctorDetails._id": 1, // Project only the doctor's first name
            "doctorDetails.lastname": 1, // Optionally include last name
            "doctorDetails.email": 1, // Doctor's email from 'users',
            "doctorAdvance.specialization":1
          },
        },
        // {
        //   $lookup: {
        //     from: "doctor", // Name of the Doctor collection
        //     localField: "doctorId", // Field in Appointment collection
        //     foreignField: "userId", // Field in Doctor collection
        //     as: "doctorAdvance", // Name of the output array
        //   },
        // },
      ]);

      console.log("appointments", appointments);

    }

    // else {

    //   console.log("keyword", keyword)

    //   appointments = await Appointment.findById(keyword)
    //     .populate("doctorId")
    //     .populate("userId");
    // }

    return res.send(appointments);


  } catch (error) {
    console.log("error", error)
    res.status(500).send("Unable to get apponintments");
  }
};
const addPrescription = async (req, res) => {
  try {
    const { appointmentId, prescription } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $push: { prescription },
      },
      { new: true, strict: false }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).send("Prescription added successfully");
  } catch (error) {
    console.error("Error adding prescription:", error);
    res.status(500).json({ error: "Unable to add prescription" });
  }
};

const bookappointment = async (req, res) => {
  try {
    const appointment = await Appointment({
      date: req.body.date,
      time: req.body.time,
      age: req.body.age,
      bloodGroup: req.body.bloodGroup,
      gender: req.body.gender,
      number: req.body.number,
      familyDiseases: req.body.familyDiseases,
      // prescription: req.body.prescription,
      doctorId: req.body.doctorId,
      userId: req.locals,
    });

    const usernotification = Notification({
      userId: req.locals,
      content: `You booked an appointment with Dr. ${req.body.doctorname} for ${req.body.date} ${req.body.time}`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `You have an appointment with ${user.firstname} ${user.lastname} on ${req.body.date} at ${req.body.time} Age: ${user.age} bloodGropu: ${user.bloodGroup} Gender: ${user.gender} Mobile Number:${user.number} Family Diseases ${user.familyDiseases}`,
    });

    await doctornotification.save();

    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Unable to book appointment");
  }
};

const completed = async (req, res) => {
  try {
    const alreadyFound = await Appointment.findOneAndUpdate(
      { _id: req.body.appointid },
      { status: "Completed" }
    );

    const usernotification = Notification({
      userId: req.locals,
      content: `Your appointment with ${req.body.doctorname} has been completed`,
    });

    await usernotification.save();

    const user = await User.findById(req.locals);

    const doctornotification = Notification({
      userId: req.body.doctorId,
      content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
    });

    await doctornotification.save();

    return res.status(201).send("Appointment completed");
  } catch (error) {
    res.status(500).send("Unable to complete appointment");
  }
};

module.exports = {
  getallappointments,
  bookappointment,
  completed,
  addPrescription,
};
