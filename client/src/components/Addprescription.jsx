import React, { useState, useEffect } from "react";
import "../styles/addprescription.css";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const AddPrescription = ({ setModalOpen, ele, allreadyPrescribed }) => {
  const [formDetails, setFormDetails] = useState({
    meds: [
      {
        medicineName: "",
        dosage: "",
        duration: "",
      },
    ],
    notes: "",
  });

  useEffect(() => {
    console.log(
      "🚀 ~ useEffect ~ ele:",
      ele.prescription[ele.prescription.length - 1]
    );
    if (allreadyPrescribed && ele.prescription.length) {
      setFormDetails(ele.prescription[ele.prescription.length - 1]);
    }
  }, [allreadyPrescribed, ele]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMeds = [...formDetails.meds];
    updatedMeds[index][name] = value;
    setFormDetails({ ...formDetails, meds: updatedMeds });
  };

  const addNewMed = () => {
    setFormDetails({
      ...formDetails,
      meds: [
        ...formDetails.meds,
        { medicineName: "", dosage: "", duration: "" },
      ],
    });
  };

  const addOrEditPrescription = async () => {
    if (
      formDetails.meds.length === 0 ||
      formDetails.meds.some(
        (med) => !med.medicineName || !med.dosage || !med.duration
      ) ||
      !formDetails.notes
    ) {
      return toast.error("All fields must be filled out.");
    }

    try {
      const response = await axios.post(
        "/appointment/prescriptions/",
        {
          appointmentId: ele._id,
          prescription: formDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(
        allreadyPrescribed
          ? "Prescription updated successfully."
          : "Prescription added successfully."
      );
      return response.data;
    } catch (error) {
      console.error("Error adding/editing prescription:", error);
      toast.error("Failed to add/edit prescription. Please try again.");
    }
  };

  return (
    <div className="modal">
      <div className="modal__content">
        <IoMdClose
          className="close-btn"
          onClick={() => {
            setModalOpen(false);
            setFormDetails({
              meds: [
                {
                  medicineName: "",
                  dosage: "",
                  duration: "",
                },
              ],
              notes: "",
            });
          }}
        />
        <h2>
          {allreadyPrescribed ? "Edit" : "Add"} Prescription for{" "}
          {ele?.userId?.firstname}
        </h2>
        <div className="meds-container">
          {formDetails.meds.map((med, index) => (
            <div className="med-item" key={index}>
              <label>
                Medicine Name:
                <input
                  type="text"
                  name="medicineName"
                  value={med.medicineName}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Enter medicine name"
                />
              </label>
              <label>
                Dosage:
                <input
                  type="text"
                  name="dosage"
                  value={med.dosage}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Enter dosage"
                />
              </label>
              <label>
                Duration:
                <input
                  type="text"
                  name="duration"
                  value={med.duration}
                  onChange={(e) => handleInputChange(e, index)}
                  placeholder="Enter duration"
                />
              </label>
            </div>
          ))}
        </div>
        <button className="add-med-btn" onClick={addNewMed}>
          Add Another Medicine
        </button>
        <label>
          Notes:
          <textarea
            name="notes"
            value={formDetails.notes}
            onChange={(e) =>
              setFormDetails({ ...formDetails, notes: e.target.value })
            }
            placeholder="Additional notes"
          />
        </label>
        <button className="form-btn" onClick={addOrEditPrescription}>
          {allreadyPrescribed ? "Update" : "Add"} Prescription
        </button>
      </div>
    </div>
  );
};

export default AddPrescription;
