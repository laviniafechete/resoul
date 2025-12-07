import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { adminEndpoints } from "../../../services/apis";
import AdminCoursesAudienceModal from "./AdminCoursesAudienceModal";

export default function AdminCourses() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audienceCourseId, setAudienceCourseId] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
        adminEndpoints.LIST_COURSES_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      setCourses(res?.data?.data || []);
    } catch (e) {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm("Sigur ștergi cursul?")) return;
    await apiConnector(
      "DELETE",
      adminEndpoints.DELETE_COURSE_API(courseId),
      null,
      { Authorization: `Bearer ${token}` }
    );
    fetchCourses();
  };

  const reassign = async (courseId) => {
    const instructorId = prompt("Introdu instructorId nou");
    if (!instructorId) return;
    await apiConnector(
      "PATCH",
      adminEndpoints.REASSIGN_COURSE_API(courseId),
      { instructorId },
      { Authorization: `Bearer ${token}` }
    );
    fetchCourses();
  };

  const toggleVisibility = async (courseId, currentStatus) => {
    const action = currentStatus === "Published" ? "unpublish" : "publish";
    if (!confirm(`Sigur vrei să ${action} acest curs?`)) return;

    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.TOGGLE_COURSE_VISIBILITY_API(courseId),
        {},
        { Authorization: `Bearer ${token}` }
      );
      alert(
        `Curs ${action === "publish" ? "publicat" : "făcut privat"} cu succes!`
      );
      fetchCourses();
    } catch (error) {
      console.log("Error toggling course visibility:", error);
      alert("Eroare la schimbarea vizibilității cursului!");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 className="text-4xl text-richblack-300 font-boogaloo mb-8">
        Cursuri
      </h1>
      <div className="overflow-x-auto border border-brand-primary rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-lavander-100">
            <tr>
              <th className="px-4 py-3 text-left">ID Curs</th>
              <th className="px-4 py-3 text-left">Titlu</th>
              <th className="px-4 py-3 text-left">Preț</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Instructor</th>
              <th className="px-4 py-3 text-left">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id} className="border-t border-brand-primary/40">
                <td className="px-4 py-3">
                  <span
                    className="bg-lavender-50 px-2 py-1 rounded text-xs font-mono cursor-pointer0"
                    onClick={() => {
                      navigator.clipboard.writeText(c._id);
                      alert("ID copiat în clipboard!");
                    }}
                    title="Click pentru a copia ID-ul"
                  >
                    {c._id}
                  </span>
                </td>
                <td className="px-4 py-3">{c.courseName}</td>
                <td className="px-4 py-3">RON {c.price}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.status === "Published"
                        ? "bg-green-600 text-richblack-300"
                        : "bg-gray-600 text-richblack-300"
                    }`}
                  >
                    {c.status === "Published" ? "Public" : "Privat"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c?.instructor
                    ? `${c.instructor.firstName} ${c.instructor.lastName}`
                    : "-"}
                </td>
                <td className="px-4 py-3 flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-1 border border-brand-primary rounded text-xs"
                    onClick={() => deleteCourse(c._id)}
                  >
                    Șterge
                  </button>
                  <button
                    className="px-3 py-1 border border-brand-primary rounded text-xs"
                    onClick={() => reassign(c._id)}
                  >
                    Reasignează
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-xs ${
                      c.status === "Published"
                        ? "border border-brand-primary text-richblack-600"
                        : "border border-brand-primary text-richblack-600"
                    }`}
                    onClick={() => toggleVisibility(c._id, c.status)}
                  >
                    {c.status === "Published" ? "Fă Privat" : "Fă Public"}
                  </button>
                  <button
                    className="px-3 py-1 border border-brand-primary rounded text-xs"
                    onClick={() => setAudienceCourseId(c._id)}
                  >
                    Audiență video
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {audienceCourseId && (
        <AdminCoursesAudienceModal
          courseId={audienceCourseId}
          onClose={() => setAudienceCourseId(null)}
        />
      )}
    </div>
  );
}
