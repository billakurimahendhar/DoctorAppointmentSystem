import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, GraduationCap, X } from "lucide-react";

export default function PatientCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/courses")
      .then((res) => setCourses(res.data.courses))
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-blue-700 mb-3">
            Learn From Our Expert Doctors
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch informative videos uploaded by certified doctors to help you
            understand your health better.
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center text-blue-700 text-lg mt-20">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">
            No courses available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-2xl shadow-lg cursor-pointer border border-gray-100 overflow-hidden group"
              >
                <div className="relative w-full aspect-video">
                  <video
                    muted
                    playsInline
                    preload="metadata"
                    className="object-cover w-full h-full rounded-t-2xl"
                    onMouseEnter={(e) => {
                      e.target.muted = true;
                      const playPromise = e.target.play();
                      if (playPromise !== undefined) playPromise.catch(() => {});
                    }}
                    onMouseLeave={(e) => e.target.pause()}
                  >
                    <source
                      src={`${course.videoUrl.replace("/upload/", "/upload/f_mp4/")}`}
                      type="video/mp4"
                    />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300">
                    <PlayCircle size={60} className="text-white drop-shadow-lg" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {course.description || "No description provided."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dr. {course.doctorId?.name} ({course.doctorId?.specialization})
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Player */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-3 right-3 bg-gray-100 hover:bg-red-100 p-2 rounded-full z-10"
              >
                <X size={22} />
              </button>

              <video
                controls
                autoPlay
                className="w-full aspect-video bg-black"
              >
                <source
                  src={`${selectedCourse.videoUrl.replace("/upload/", "/upload/f_mp4/")}`}
                  type="video/mp4"
                />
              </video>

              <div className="p-6">
                <h2 className="text-2xl font-semibold text-blue-700 mb-2">
                  {selectedCourse.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {selectedCourse.description || "No description available."}
                </p>
                <p className="text-sm text-gray-500">
                  By Dr. {selectedCourse.doctorId?.name} (
                  {selectedCourse.doctorId?.specialization}) on{" "}
                  {new Date(selectedCourse.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
