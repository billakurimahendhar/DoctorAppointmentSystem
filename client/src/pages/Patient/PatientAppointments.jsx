import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../lib/api";
import { filterUpcomingSlots } from "../../lib/slots";

const statusClasses = {
  booked: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function PatientAppointments() {
  const { user } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRescheduleId, setActiveRescheduleId] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});

  const fetchAppointments = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/appointments/patient/${user._id}`);
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?._id]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        if (a.date === b.date) {
          return b.time.localeCompare(a.time);
        }

        return b.date.localeCompare(a.date);
      }),
    [appointments]
  );

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`, {
        cancelledBy: "patient",
        cancellationReason: "Cancelled from patient dashboard",
      });
      await fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to cancel appointment");
    }
  };

  const openReschedule = async (appointment) => {
    try {
      const { data } = await api.get(`/doctor/${appointment.doctorId._id}/slots`);
      setAvailableSlots(
        filterUpcomingSlots(data.slots || []).filter(
          (slot) => String(slot._id) !== String(appointment.slotId)
        )
      );
      setSelectedSlotId("");
      setActiveRescheduleId(appointment._id);
    } catch (error) {
      alert("Unable to load available slots");
    }
  };

  const submitReschedule = async (appointmentId) => {
    if (!selectedSlotId) {
      alert("Please choose a slot");
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/reschedule`, {
        slotId: selectedSlotId,
      });
      setActiveRescheduleId("");
      setSelectedSlotId("");
      setAvailableSlots([]);
      await fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to reschedule appointment");
    }
  };

  const submitReview = async (appointment) => {
    const draft = reviewDrafts[appointment._id] || { rating: 5, review: "" };

    try {
      await api.post("/reviews", {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId._id,
        patientId: user._id,
        rating: draft.rating,
        review: draft.review,
      });
      await fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save review");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            My Appointments
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cancel or reschedule booked visits, and leave a review after your
            consultation is complete.
          </p>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            No appointments found yet.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {sortedAppointments.map((appointment) => {
              const reviewDraft = reviewDrafts[appointment._id] || {
                rating: 5,
                review: "",
              };

              return (
                <div
                  key={appointment._id}
                  className="rounded-3xl bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          appointment.doctorId?.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={appointment.doctorId?.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          Dr. {appointment.doctorId?.name}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {appointment.doctorId?.specialization}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[appointment.status] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-slate-600">
                    <p>Date: {appointment.date}</p>
                    <p>Time: {appointment.time}</p>
                    <p>Reason: {appointment.reason || "General Consultation"}</p>
                    <p>Payment: {appointment.paymentMode} / {appointment.paymentStatus}</p>
                    {appointment.cancellationReason && (
                      <p>Cancellation reason: {appointment.cancellationReason}</p>
                    )}
                  </div>

                  {appointment.status === "booked" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => openReschedule(appointment)}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {activeRescheduleId === appointment._id && (
                    <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <h3 className="text-sm font-semibold text-blue-800">
                        Choose a new slot
                      </h3>

                      <div className="mt-3 max-h-56 space-y-2 overflow-auto">
                        {availableSlots.map((slot) => (
                          <label
                            key={slot._id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
                              selectedSlotId === slot._id
                                ? "border-blue-500 bg-white"
                                : "border-transparent bg-white/70"
                            }`}
                          >
                            <span>
                              {slot.date} at {slot.time}
                            </span>
                            <input
                              type="radio"
                              name={`reschedule-${appointment._id}`}
                              checked={selectedSlotId === slot._id}
                              onChange={() => setSelectedSlotId(slot._id)}
                            />
                          </label>
                        ))}
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => submitReschedule(appointment._id)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setActiveRescheduleId("");
                            setSelectedSlotId("");
                            setAvailableSlots([]);
                          }}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {appointment.review && (
                    <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <p className="font-semibold">
                        Your rating: {appointment.review.rating}/5
                      </p>
                      {appointment.review.review && (
                        <p className="mt-1">{appointment.review.review}</p>
                      )}
                    </div>
                  )}

                  {appointment.canReview && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Rate your doctor
                      </h3>
                      <div className="mt-3 flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() =>
                              setReviewDrafts((current) => ({
                                ...current,
                                [appointment._id]: {
                                  ...reviewDraft,
                                  rating: value,
                                },
                              }))
                            }
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              reviewDraft.rating === value
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-600"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewDraft.review}
                        onChange={(event) =>
                          setReviewDrafts((current) => ({
                            ...current,
                            [appointment._id]: {
                              ...reviewDraft,
                              review: event.target.value,
                            },
                          }))
                        }
                        rows="3"
                        placeholder="Write a short review"
                        className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm"
                      />
                      <button
                        onClick={() => submitReview(appointment)}
                        className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Submit review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
