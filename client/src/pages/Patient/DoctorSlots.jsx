import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function DoctorSlots() {
  const { id: doctorId } = useParams();
  const patient = JSON.parse(localStorage.getItem("user"));

  const [slots, setSlots] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slotRes = await axios.get(`http://localhost:4000/api/doctor/${doctorId}/slots`);
        setSlots(slotRes.data.slots || []);

        const docRes = await axios.get(`http://localhost:4000/api/doctor`);
        const found = docRes.data.doctors.find(d => d._id === doctorId);
        setDoctor(found);

        const dates = [...new Set(slotRes.data.slots.map(s => s.date))].sort();
        setSelectedDate(dates[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorId]);

  const visibleSlots = useMemo(() => {
    return slots.filter(s => s.date === selectedDate && !s.isBooked);
  }, [slots, selectedDate]);

  const paginatedSlots = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleSlots.slice(start, start + pageSize);
  }, [visibleSlots, page]);

  const totalPages = Math.ceil(visibleSlots.length / pageSize);

  const bookAppointment = async (slot, paymentMode) => {
    try {
      const { data: booking } = await axios.post(
        "http://localhost:4000/api/appointments/book",
        {
          doctorId,
          patientId: patient._id,
          slotId: slot._id,
          date: slot.date,
          time: slot.time,
          paymentMode,
        }
      );

      if (paymentMode === "offline") {
        alert("✅ Appointment booked (Pay at clinic)");
        return;
      }

      const { data } = await axios.post(
        "http://localhost:4000/api/payment/create-order",
        { amount: 500, appointmentId: booking.appointment._id }
      );

      const options = {
        key: "rzp_test_RRLXC3x2PPYQOB",
        amount: data.order.amount,
        currency: "INR",
        name: "MediConnect",
        description: "Doctor Appointment",
        order_id: data.order.id,
        handler: async (response) => {
          await axios.post("http://localhost:4000/api/payment/verify", {
            ...response,
            appointmentId: booking.appointment._id,
          });
          alert("✅ Payment successful!");
        },
        theme: { color: "#2563eb" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Available Slots</h1>

      {/* Date Selector */}
      <div className="flex gap-3 justify-center mb-8">
        {[...new Set(slots.map(s => s.date))].map(d => (
          <button
            key={d}
            onClick={() => { setSelectedDate(d); setPage(1); }}
            className={`px-4 py-2 rounded-lg ${selectedDate === d ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Slot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedSlots.map(slot => (
          <div key={slot._id} className="bg-white rounded-xl shadow-md p-6 text-center">
            <img
              src={doctor?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Doctor"
              className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border"
            />
            <h2 className="font-semibold text-blue-800">{doctor?.name}</h2>
            <p className="text-sm text-gray-500">{doctor?.qualification}</p>
            <p className="text-lg font-bold text-indigo-600 mt-2">🕒 {slot.time}</p>

            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => bookAppointment(slot, "online")}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Pay Online
              </button>
              <button
                onClick={() => bookAppointment(slot, "offline")}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Pay Offline
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
