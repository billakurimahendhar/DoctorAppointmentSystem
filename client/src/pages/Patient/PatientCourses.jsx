import { useEffect, useState } from "react";
import axios from "axios";
import { PlayCircle, X } from "lucide-react";

export default function PatientCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://doctorappointmentsystem-0818.onrender.com/api/courses")
      .then((res) => setCourses(res.data.courses))
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold text-blue-700 sm:text-4xl">
            Learn From Our Expert Doctors
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Watch informative videos uploaded by certified doctors to help you understand your health better.
          </p>
        </div>

        {loading ? (
          <div className="mt-20 text-center text-lg text-blue-700">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <p className="mt-20 text-center text-gray-500">
            No courses available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => setSelectedCourse(course)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full">
                  <video
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full rounded-t-2xl object-cover"
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <PlayCircle size={60} className="text-white drop-shadow-lg" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-xl font-semibold text-blue-700">
                    {course.title}
                  </h3>
                  <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                    {course.description || "No description provided."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dr. {course.doctorId?.name} ({course.doctorId?.specialization})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-2 hover:bg-red-100"
            >
              <X size={22} />
            </button>

            <video
              controls
              autoPlay
              className="aspect-video w-full bg-black"
            >
              <source
                src={`${selectedCourse.videoUrl.replace("/upload/", "/upload/f_mp4/")}`}
                type="video/mp4"
              />
            </video>

            <div className="p-4 sm:p-6">
              <h2 className="mb-2 text-xl font-semibold text-blue-700 sm:text-2xl">
                {selectedCourse.title}
              </h2>
              <p className="mb-4 text-gray-600">
                {selectedCourse.description || "No description available."}
              </p>
              <p className="text-sm text-gray-500">
                By Dr. {selectedCourse.doctorId?.name} ({selectedCourse.doctorId?.specialization}) on{" "}
                {new Date(selectedCourse.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
