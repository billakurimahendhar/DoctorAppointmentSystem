import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const slotStyles = {
  available: "bg-emerald-50 border-emerald-200 text-emerald-700",
  blocked: "bg-amber-50 border-amber-200 text-amber-700",
  booked: "bg-slate-100 border-slate-200 text-slate-500",
};

export default function AvailabilityManager() {
  const doctor = JSON.parse(localStorage.getItem("user"));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [newSlot, setNewSlot] = useState({
    date: "",
    time: "10:00",
  });

  const fetchAvailability = async () => {
    if (!doctor?._id) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/doctor/${doctor._id}/availability`);
      const items = data.slots || [];
      setSlots(items);

      if (!selectedDate && items.length > 0) {
        setSelectedDate(items[0].date);
      }
    } catch (error) {
      console.error("Failed to fetch availability", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [doctor?._id]);

  const dates = useMemo(
    () => [...new Set(slots.map((slot) => slot.date))],
    [slots]
  );

  const visibleSlots = useMemo(
    () => slots.filter((slot) => slot.date === selectedDate),
    [slots, selectedDate]
  );

  const updateSlotStatus = async (slotId, status) => {
    try {
      await api.patch(`/doctor/${doctor._id}/availability/${slotId}`, { status });
      await fetchAvailability();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update slot");
    }
  };

  const addSlot = async (event) => {
    event.preventDefault();

    try {
      await api.post(`/doctor/${doctor._id}/availability`, newSlot);
      setNewSlot((current) => ({ ...current, time: "10:00" }));
      setSelectedDate(newSlot.date);
      await fetchAvailability();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to add slot");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading availability...
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Availability Manager
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Block busy slots, reopen time windows, or add custom appointment
            times for future dates.
          </p>
        </div>

        <form
          onSubmit={addSlot}
          className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-[1fr_1fr_auto]"
        >
          <input
            type="date"
            value={newSlot.date}
            onChange={(event) =>
              setNewSlot((current) => ({ ...current, date: event.target.value }))
            }
            className="rounded-xl border border-slate-200 p-3"
            required
          />
          <input
            type="time"
            value={newSlot.time}
            onChange={(event) =>
              setNewSlot((current) => ({ ...current, time: event.target.value }))
            }
            className="rounded-xl border border-slate-200 p-3"
            required
          />
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add custom slot
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleSlots.map((slot) => (
            <div
              key={slot._id}
              className={`rounded-2xl border p-5 shadow-sm ${
                slotStyles[slot.status] || "bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide">
                    {slot.date}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{slot.time}</h2>
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold capitalize">
                  {slot.status}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {slot.status !== "booked" && (
                  <>
                    <button
                      onClick={() => updateSlotStatus(slot._id, "available")}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:w-auto"
                    >
                      Set available
                    </button>
                    <button
                      onClick={() => updateSlotStatus(slot._id, "blocked")}
                      className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 sm:w-auto"
                    >
                      Block slot
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

