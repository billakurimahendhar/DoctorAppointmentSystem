import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, X } from "lucide-react";

export default function DoctorCourses() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const doctor = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (doctor?._id) fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/courses/${doctor._id}`);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !video) return alert("Title and video are required!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", video);

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:4000/api/courses/${doctor._id}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(res.data.message);
      setTitle("");
      setDescription("");
      setVideo(null);
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-extrabold text-blue-700 tracking-tight">
            My Educational Courses
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-all duration-200"
          >
            <PlusCircle size={22} /> Upload Course
          </button>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <p className="text-center text-gray-500 mt-20 text-lg">
            You haven’t uploaded any courses yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="relative w-full aspect-video bg-gray-200">
                  <video
                    muted
                    controls
                    playsInline
                    preload="metadata"
                    className="object-cover w-full h-full"
                  >
                    <source
                      src={`${course.videoUrl.replace("/upload/", "/upload/f_mp4/")}`}
                      type="video/mp4"
                    />
                  </video>
                </div>

                <div className="p-5">
                  <h3 className="text-2xl font-semibold text-blue-700 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {course.description || "No description provided."}
                  </p>
                  <p className="text-sm text-gray-400">
                    Uploaded on {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-8 shadow-xl w-[90%] max-w-md relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold text-blue-700 mb-6">
                Upload New Course
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files[0])}
                  className="w-full border p-3 rounded-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800"
                >
                  {loading ? "Uploading..." : "Upload Course"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
