import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { filterUpcomingSlots } from "../../lib/slots";

export default function DoctorBookingSlots() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const patient = JSON.parse(localStorage.getItem("user"));

  const [slots, setSlots] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [reason, setReason] = useState("General Consultation");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => new Date());

  const pageSize = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotRes, doctorRes] = await Promise.all([
          api.get(`/doctor/${doctorId}/slots`),
          api.get(`/doctor/profile/${doctorId}`),
        ]);

        const slotItems = slotRes.data.slots || [];
        setSlots(slotItems);
        setDoctor(doctorRes.data.doctor || null);

        const dates = [...new Set(slotItems.map((slot) => slot.date))].sort();
        setSelectedDate(dates[0] || "");
      } catch (error) {
        console.error("Failed to fetch doctor slots", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const upcomingSlots = useMemo(
    () => filterUpcomingSlots(slots, now),
    [slots, now]
  );

  const availableDates = useMemo(
    () => [...new Set(upcomingSlots.map((slot) => slot.date))],
    [upcomingSlots]
  );

  useEffect(() => {
    if (!availableDates.length) {
      if (selectedDate) {
        setSelectedDate("");
      }
      if (page !== 1) {
        setPage(1);
      }
      return;
    }

    if (!availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0]);
      setPage(1);
    }
  }, [availableDates, page, selectedDate]);

  const visibleSlots = useMemo(
    () => upcomingSlots.filter((slot) => slot.date === selectedDate),
    [upcomingSlots, selectedDate]
  );

  const paginatedSlots = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return visibleSlots.slice(startIndex, startIndex + pageSize);
  }, [visibleSlots, page]);

  const totalPages = Math.ceil(visibleSlots.length / pageSize);

  const bookAppointment = async (slot, paymentMode) => {
    try {
      console.log("Booking appointment with slot:", slot, "and payment mode:", paymentMode);
      const { data: booking } = await api.post("/appointments/book", {
        doctorId,
        patientId: patient._id,
        slotId: slot._id,
        date: slot.date,
        time: slot.time,
        paymentMode,
        reason,
      });
      console.log("Received booking response from server:", booking);

      if (paymentMode === "offline") {
        alert("Appointment booked successfully");
        navigate("/patient-appointments");
        return;
      }


       console.log("Initiating online payment for appointment:", booking);
      const { data } = await api.post("/payment/create-order", {
        amount: doctor?.feesPerConsultation || 500,
        appointmentId: booking.appointment._id,
      });
      console.log("Received order details from server:", data);

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout failed to load");
      }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: "INR",
        name: "MediConnect",
        description: "Doctor Appointment",
        order_id: data.order.id,
        handler: async (response) => {
          await api.post("/payment/verify", {
            ...response,
            appointmentId: booking.appointment._id,
          });
          alert("Payment successful");
          navigate("/patient-appointments");
        },
        theme: { color: "#2563eb" },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading slots...
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className=" bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src={
                doctor?.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={doctor?.name}
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Dr. {doctor?.name}
              </h1>
              <p className="text-sm text-slate-500">{doctor?.specialization}</p>
              <p className="text-sm text-slate-500">
                Fee Rs. {doctor?.feesPerConsultation || 0}
              </p>
            </div>
          </div>

          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows="2"
            className="mt-5 w-full rounded-2xl border border-slate-200 p-3 text-sm"
            placeholder="Reason for consultation"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => {
                setSelectedDate(date);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedDate === date
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              {date}
            </button>
          ))}
        </div>

        {paginatedSlots.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            No upcoming slots are available right now.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedSlots.map((slot) => (
              <div key={slot._id} className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{slot.date}</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {slot.time}
                </h2>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => bookAppointment(slot, "online")}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Pay online
                  </button>
                  <button
                    onClick={() => bookAppointment(slot, "offline")}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Pay offline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

