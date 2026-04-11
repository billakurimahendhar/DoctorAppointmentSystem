import { useState, useEffect } from "react";
import axios from "axios";
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
    if (!doctor?._id) {
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`https://doctorappointmentsystem-0818.onrender.com/api/courses/${doctor._id}`);
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [doctor?._id]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`https://doctorappointmentsystem-0818.onrender.com/api/courses/${doctor._id}`);
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
        `https://doctorappointmentsystem-0818.onrender.com/api/courses/${doctor._id}/upload`,
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
    <div className="page-shell">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-700 sm:text-4xl">
            My Educational Courses
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-white transition-all duration-200 hover:bg-blue-800"
          >
            <PlusCircle size={22} /> Upload Course
          </button>
        </div>

        {courses.length === 0 ? (
          <p className="mt-20 text-center text-base text-gray-500 sm:text-lg">
            You have not uploaded any courses yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full bg-gray-200">
                  <video
                    muted
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  >
                    <source
                      src={`${course.videoUrl.replace("/upload/", "/upload/f_mp4/")}`}
                      type="video/mp4"
                    />
                  </video>
                </div>

                <div className="p-5">
                  <h3 className="mb-2 text-2xl font-semibold text-blue-700">
                    {course.title}
                  </h3>
                  <p className="mb-3 text-gray-600">
                    {course.description || "No description provided."}
                  </p>
                  <p className="text-sm text-gray-400">
                    Uploaded on {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <X size={22} />
            </button>

            <h2 className="mb-6 pr-10 text-2xl font-bold text-blue-700">
              Upload New Course
            </h2>

            <form onSubmit={handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
                className="w-full rounded-lg border p-3 text-sm"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 py-3 text-white hover:bg-blue-800"
              >
                {loading ? "Uploading..." : "Upload Course"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
