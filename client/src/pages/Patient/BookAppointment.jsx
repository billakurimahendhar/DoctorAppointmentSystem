import { useState, useEffect } from "react";
import axios from "axios";

export default function BookAppointment({ doctorId }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMode, setPaymentMode] = useState("offline");
  const [loading, setLoading] = useState(false);

  const patient = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchSlots();
  }, [doctorId]);

  const fetchSlots = async () => {
    const res = await axios.get(`http://localhost:4000/api/doctor/${doctorId}/slots`);
    setSlots(res.data.slots.filter((s) => !s.isBooked));
  };

  const handleBooking = async () => {
    if (!selectedSlot) return alert("Please select a slot first.");

    try {
      setLoading(true);
      const appointment = {
        doctorId,
        patientId: patient._id,
        slotId: selectedSlot._id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        paymentMode,
      };

      const res = await axios.post(
        "http://localhost:4000/api/appointments/book",
        appointment
      );

      if (paymentMode === "online") {
        await startRazorpayPayment(res.data.appointment);
      } else {
        alert("Appointment booked (offline payment).");
      }
      fetchSlots();
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const startRazorpayPayment = async (appointment) => {
    const amount = 500; // fixed fee or doctor-specific
    const { data } = await axios.post("http://localhost:4000/api/payment/create-order", {
      amount,
      appointmentId: appointment._id,
    });

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID",
      amount: data.order.amount,
      currency: "INR",
      name: "MediConnect",
      description: "Doctor Appointment Payment",
      order_id: data.order.id,
      handler: async function (response) {
        await axios.post("http://localhost:4000/api/payment/verify", {
          ...response,
          appointmentId: appointment._id,
        });
        alert("Payment successful! Appointment confirmed.");
      },
      theme: { color: "#2563eb" },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        Book Appointment
      </h2>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {slots.map((slot) => (
          <button
            key={slot._id}
            onClick={() => setSelectedSlot(slot)}
            className={`p-3 rounded-lg border ${
              selectedSlot?._id === slot._id
                ? "bg-blue-700 text-white"
                : "bg-gray-50 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {slot.date} <br />
            <span className="text-sm text-gray-500">{slot.time}</span>
          </button>
        ))}
      </div>

      {/* Payment Mode */}
      <div className="mb-6 text-center">
        <label className="mr-4 font-semibold text-gray-700">Payment Mode:</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
        </select>
      </div>

      {/* Confirm Button */}
      <div className="text-center">
        <button
          onClick={handleBooking}
          disabled={loading}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
        >
          {loading ? "Processing..." : "Confirm Appointment"}
        </button>
      </div>
    </div>
  );
}
