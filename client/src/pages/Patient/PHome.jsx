import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* Debounce Hook */
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
        const res = await axios.get("http://localhost:4000/api/doctor");
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

  const specialties = [...new Set(doctors.map((d) => d.specialization))];

  const highlightMatch = (text) => {
    if (!debouncedSearch) return text;
    const regex = new RegExp(`(${debouncedSearch})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === debouncedSearch.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen overflow-hidden">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center animate-fadeIn">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Your Health, <br />
            <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Find trusted doctors, book appointments instantly, and manage your
            medical records in one secure platform.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/doctors")}
              className="bg-blue-600 text-white px-7 py-3 rounded-xl shadow hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Book Appointment
            </button>
            <button
              onClick={() => navigate("/patient-reports")}
              className="border border-gray-300 px-7 py-3 rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              View Reports
            </button>
          </div>

          <div className="flex gap-8 text-sm text-gray-500">
            <span>✔ Verified Doctors</span>
            <span>✔ Secure Records</span>
            <span>✔ Easy Scheduling</span>
          </div>
        </div>

        <img
          src="https://img.freepik.com/free-photo/medical-banner-with-doctor-wearing-goggles_23-2149611193.jpg"
          alt="Healthcare"
          className="rounded-3xl shadow-xl hover:scale-105 transition duration-700"
        />
      </section>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 animate-slideUp">
        <div className="bg-white shadow-xl rounded-2xl p-4 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-400 transition">
          <span className="text-gray-400 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search by doctor name, specialty, qualification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-gray-700"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-red-500 text-sm transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* SPECIALTIES */}
      <div className="max-w-6xl mx-auto px-6 mt-8 flex flex-wrap gap-3 justify-center animate-fadeIn delay-200">
        {specialties.map((spec) => (
          <button
            key={spec}
            onClick={() => setSearch(spec)}
            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm"
          >
            {spec}
          </button>
        ))}
      </div>

      {/* DOCTORS */}
      <section className="bg-gray-50 py-20 mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fadeIn">
            {search ? "Search Results" : "Top Doctors"}
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading doctors...</p>
          ) : filteredDoctors.length === 0 ? (
            <p className="text-center text-red-500">No doctors found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredDoctors.slice(0, 8).map((doc, i) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl shadow hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden animate-slideUp"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="overflow-hidden">
                    <img
                      src={
                        doc.profileImage ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Doctor"
                      className="h-56 w-full object-cover hover:scale-110 transition duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800">
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
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300"
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

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 text-center mt-16 animate-fadeIn">
        <h2 className="text-3xl font-bold">Start Your Health Journey Today</h2>
        <p className="mt-2 text-blue-100">
          Book trusted doctors and manage your care effortlessly
        </p>
        <button
          onClick={() => navigate("/doctors")}
          className="mt-6 bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow hover:scale-110 active:scale-95 transition-all duration-300"
        >
          Find Doctors
        </button>
      </section>

      {/* Animations */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 1s ease forwards; }
        .animate-slideUp { animation: slideUp 0.8s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
