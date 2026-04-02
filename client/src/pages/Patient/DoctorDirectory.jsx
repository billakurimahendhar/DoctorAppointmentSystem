import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";

const renderStars = (value) =>
  Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < Math.round(value) ? "text-amber-400" : "text-slate-300"}>
      ★
    </span>
  ));

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [minExperience, setMinExperience] = useState("0");
  const [maxFee, setMaxFee] = useState("");
  const [minRating, setMinRating] = useState("0");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/doctor");
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specializations = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))],
    [doctors]
  );

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((doctor) => {
        const matchesSearch = `${doctor.name} ${doctor.specialization} ${doctor.qualification}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesSpecialization =
          specialization === "all" || doctor.specialization === specialization;
        const matchesExperience =
          Number(doctor.experience || 0) >= Number(minExperience || 0);
        const matchesFee =
          !maxFee || Number(doctor.feesPerConsultation || 0) <= Number(maxFee);
        const matchesRating =
          Number(doctor.averageRating || 0) >= Number(minRating || 0);

        return (
          matchesSearch &&
          matchesSpecialization &&
          matchesExperience &&
          matchesFee &&
          matchesRating
        );
      }),
    [doctors, search, specialization, minExperience, maxFee, minRating]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-blue-600">
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Find Your Doctor</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search by specialty, narrow by experience and fee, and compare real
            patient ratings before booking.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5">
          <input
            type="text"
            placeholder="Search doctor or speciality"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <select
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          >
            <option value="all">All specializations</option>
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min experience"
            value={minExperience}
            onChange={(event) => setMinExperience(event.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <input
            type="number"
            min="0"
            placeholder="Max fee"
            value={maxFee}
            onChange={(event) => setMaxFee(event.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <select
            value={minRating}
            onChange={(event) => setMinRating(event.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          >
            <option value="0">Any rating</option>
            <option value="3">3+ rating</option>
            <option value="4">4+ rating</option>
            <option value="4.5">4.5+ rating</option>
          </select>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={
                    doctor.profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={doctor.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Dr. {doctor.name}
                  </h2>
                  <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span>{renderStars(doctor.averageRating || 0)}</span>
                    <span className="text-slate-500">
                      {(doctor.averageRating || 0).toFixed(1)} ({doctor.reviewCount || 0})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                <p>Qualification: {doctor.qualification}</p>
                <p>Experience: {doctor.experience || 0} years</p>
                <p>Fee: Rs. {doctor.feesPerConsultation || 0}</p>
              </div>

              <div className="mt-5 flex gap-3">
                <Link
                  to={`/doctors/${doctor._id}`}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  View slots
                </Link>
                <Link
                  to={`/doctor-profile/${doctor._id}`}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reviews
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            No doctors match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
