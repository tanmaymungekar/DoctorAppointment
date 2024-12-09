import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import { toast } from "react-hot-toast";
import jwt_decode from "jwt-decode";
import axios from "axios";
import "../styles/user.css";

const Priscriptions = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PerPage = 5;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const { userId } = jwt_decode(localStorage.getItem("token"));

  const getAllAppoint = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(
        `/appointment/getallappointments?search=${userId}`
      );
      setAppointments(temp);
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments. Please try again.");
    }
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const totalPages = Math.ceil(appointments.length / PerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)}>
          {i}
        </button>
      );
    }
    return pages;
  };

  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * PerPage,
    currentPage * PerPage
  );

  const completeAppointment = async (appointment) => {
    try {
      await axios.put(
        "/appointment/completed",
        {
          appointid: appointment._id,
          doctorId: appointment.doctorId._id,
          doctorname: `${appointment.userId.firstname} ${appointment.userId.lastname}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Appointment completed successfully.");
      getAllAppoint();
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment. Please try again.");
    }
  };

  const BASE_URL = "/api/prescriptions"; // Adjust based on your backend URL

  const prescriptionService = {
    createPrescription: async (prescriptionData) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/create`,
          prescriptionData
        );
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
      }
    },

    getPrescriptionsByPatient: async (userId) => {
      try {
        const response = await axios.get(`${BASE_URL}/patient/${userId}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
      }
    },

    getPrescriptionById: async (prescriptionId) => {
      try {
        const response = await axios.get(`${BASE_URL}/${prescriptionId}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : new Error("Network error");
      }
    },
  };

  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       const newPrescription = await prescriptionService.createPrescription({
  //         appointmentId,
  //         content,
  //         notes,
  //       });

  //       // Reset form and call parent callback
  //       setContent("");
  //       setNotes("");
  //       setError(null);

  //       if (onPrescriptionCreated) {
  //         onPrescriptionCreated(newPrescription.prescription);
  //       }
  //     } catch (err) {
  //       setError(err.message || "Failed to create prescription");
  //     }
  //   };

  const handleSubmit = async (e) => {};
  return (
    <>
      <Navbar />
      {/* {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>

          {appointments.length > 0 ? (
            <div className="appointments">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>P Name</th>
                    <th>P Age</th>
                    <th>P Gender</th>
                    <th>P Mobile No.</th>
                    <th>P bloodGroup</th>
                    <th>P Family Diseases</th>
                    <th>Appointment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{(currentPage - 1) * PerPage + index + 1}</td>
                      <td>{`${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`}</td>
                      <td>{`${appointment.userId.firstname} ${appointment.userId.lastname}`}</td>
                      <td>{appointment.age}</td>
                      <td>{appointment.gender}</td>
                      <td>{appointment.number}</td>
                      <td>{appointment.bloodGroup}</td>
                      <td>{appointment.familyDiseases}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.status}</td>
                      <td>
                        <button
                          className="btn user-btn complete-btn"
                          onClick={() => completeAppointment(appointment)}
                          disabled={appointment.status === "Completed"}
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">{renderPagination()}</div>
            </div>
          ) : (
            <Empty message="No appointments found." />
          )}
        </section>
      )} */}
      <div className="prescription-form">
        <h2>Create Prescription</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Prescription Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter prescription details"
            />
          </div>
          <div>
            <label>Additional Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <button type="submit">Create Prescription</button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default Priscriptions;
