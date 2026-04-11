import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function PHome() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctor");
        setDoctors(res.data.doctors || []);
      } catch (err) {
        console.error("Error fetching doctors", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doc) =>
    `${doc.name} ${doc.specialization} ${doc.qualification}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase())
  );

  const specialties = [...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))];

  const highlightMatch = (text) => {
    if (!debouncedSearch) return text;
    const regex = new RegExp(`(${debouncedSearch})`, "gi");

    return text.split(regex).map((part, index) =>
      part.toLowerCase() === debouncedSearch.toLowerCase() ? (
        <span key={index} className="rounded bg-yellow-200 px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-white">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Your Health,
            <br />
            <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-gray-600 sm:text-lg lg:mx-0">
            Find trusted doctors, book appointments instantly, and manage your medical records in one secure platform.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              onClick={() => navigate("/doctors")}
              className="rounded-xl bg-blue-600 px-7 py-3 text-white shadow transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
            >
              Book Appointment
            </button>
            <button
              onClick={() => navigate("/patient-reports")}
              className="rounded-xl border border-gray-300 px-7 py-3 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100"
            >
              View Reports
            </button>
          </div>

          <div className="flex flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 lg:justify-start">
            <span>Verified Doctors</span>
            <span>Secure Records</span>
            <span>Easy Scheduling</span>
          </div>
        </div>

        <img
          src="https://img.freepik.com/free-photo/medical-banner-with-doctor-wearing-goggles_23-2149611193.jpg"
          alt="Healthcare"
          className="mx-auto w-full max-w-xl rounded-3xl object-cover shadow-xl transition duration-700 hover:scale-[1.02]"
        />
      </section>

      <div className="mx-auto -mt-6 max-w-4xl px-4 sm:-mt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl transition focus-within:ring-2 focus-within:ring-blue-400 sm:flex-row sm:items-center">
          <span className="text-xl text-gray-400">Search</span>
          <input
            type="text"
            placeholder="Search by doctor name, specialty, qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="self-start text-sm text-gray-400 transition hover:text-red-500 sm:self-center"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap justify-center gap-3 px-4 sm:px-6 lg:px-8">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSearch(spec)}
            className="rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-100"
          >
            {spec}
          </button>
        ))}
      </div>

      <section className="mt-10 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {search ? "Search Results" : "Top Doctors"}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading doctors...</p>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-center text-red-500">No doctors found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {filteredDoctors.slice(0, 8).map((doc, index) => (
                <div
                  key={doc._id}
                  className="animate-slideUp overflow-hidden rounded-2xl bg-white shadow transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="overflow-hidden">
                    <img
                      src={
                        doc.profileImage ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Doctor"
                      className="h-56 w-full object-cover transition duration-700 hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800">
                      Dr. {highlightMatch(doc.name)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {highlightMatch(doc.specialization)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {highlightMatch(doc.qualification)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {doc.experience} yrs experience
                    </p>

                    <button
                      onClick={() => navigate(`/doctors/${doc._id}`)}
                      className="mt-4 w-full rounded-xl bg-blue-600 py-2 text-white transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-16 bg-blue-600 px-4 py-14 text-center text-white sm:px-6 sm:py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Start Your Health Journey Today</h2>
        <p className="mt-2 text-blue-100">
          Book trusted doctors and manage your care effortlessly
        </p>
        <button
          onClick={() => navigate("/doctors")}
          className="mt-6 rounded-xl bg-white px-8 py-3 font-semibold text-blue-700 shadow transition-all duration-300 hover:scale-[1.03]"
        >
          Find Doctors
        </button>
      </section>

      <style>{`
        .animate-fadeIn { animation: fadeIn 1s ease forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
