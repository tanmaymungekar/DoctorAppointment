import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../styles/notification.css";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import "../styles/user.css";
import jwt_decode from "jwt-decode";
import "../styles/addprescription.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 8;
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const { userId } = jwt_decode(localStorage.getItem("token"));
  const getAllNotif = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`/appointment/getallappointments?user=${userId}&page=${currentPage - 1}&limit=${notificationsPerPage}`);
      console.log("temp", temp)
      dispatch(setLoading(false));
      setNotifications(temp);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    getAllNotif();
  }, [currentPage]);

  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button key={i} onClick={() => handlePageChange(i)}>{i}</button>
      );
    }
    return pages;
  };

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  );

  const GeneratePrescriptionPDF = ({ appointment }) => {
    const handleGeneratePDF = () => {
      const doc = new jsPDF();
  
      // Extract data
      const { doctorDetails, doctorAdvance, prescription, date, time } = appointment;
      const lastPrescription = prescription[prescription.length - 1];
      const meds = lastPrescription?.meds || [];
      const notes = lastPrescription?.notes || "No additional notes provided.";
  
      // Add title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Prescription Report", 105, 20, { align: "center" });
  
      // Add Doctor Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Doctor: Dr. ${doctorDetails.firstname} ${doctorDetails.lastname}`, 20, 40);
      doc.text(`Specialization: ${doctorAdvance.specialization}`, 20, 50);
      doc.text(`Email: ${doctorDetails.email}`, 20, 60);
  
      // Add Appointment Details
      doc.setFont("helvetica", "bold");
      doc.text("Appointment Details:", 20, 80);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${date}`, 20, 90);
      doc.text(`Time: ${time}`, 20, 100);
  
      // Add Prescription Table
      doc.setFont("helvetica", "bold");
      doc.text("Prescription Details:", 20, 120);
      doc.autoTable({
        startY: 130,
        head: [["Medicine Name", "Dosage", "Duration"]],
        body: meds.map((med) => [
          med.medicineName,
          med.dosage,
          med.duration,
        ]),
        theme: "striped",
        styles: {
          fontSize: 10,
          halign: "center",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
        },
      });
  
      // Add Additional Notes
      const tableEndY = doc.lastAutoTable.finalY || 130;
      doc.setFont("helvetica", "bold");
      doc.text("Additional Notes:", 20, tableEndY + 10);
      doc.setFont("helvetica", "normal");
      doc.text(notes, 20, tableEndY + 20, { maxWidth: 170 });
  
      // Save the PDF
      doc.save(`Prescription-${date}.pdf`);
    };
  
    return (
      <button className="form-btn" onClick={handleGeneratePDF} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Generate PDF
      </button>
    );
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>

          {notifications.length > 0 ? (
            <div className="notifications">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th style={{ width: "500px" }}>Doctor Name</th>
                    <th>App. Date</th>
                    <th>Time</th>
                    <th>Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((ele, i) => (
                    <tr key={ele?._id}>
                      <td>{(currentPage - 1) * notificationsPerPage + i + 1}</td>
                      <td>{`${ele?.doctorDetails?.firstname} ${ele?.doctorDetails?.lastname}  `}</td>
                      <td>{ele?.date}</td>
                      <td>{ele?.time}</td>
                      <td>{ele?.prescription?.length > 0 ? <GeneratePrescriptionPDF appointment={ele}/> : <div disabled className="form-av">Not available</div>}</td>
                      {/* <td>{ele?.prescription[prescription.length - 1]}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">{renderPagination()}</div>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Notifications;
