import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { adminEndpoints } from "../../../services/apis";

export default function AdminInstructors() {
  const { token } = useSelector((state) => state.auth);
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
        adminEndpoints.LIST_USERS_API("Instructor"),
        null,
        { Authorization: `Bearer ${token}` }
      );
      setInstructors(res?.data?.data || []);
      setFilteredInstructors(res?.data?.data || []);
    } catch (e) {
      setInstructors([]);
      setFilteredInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId) => {
    if (
      !confirm(
        "Sigur vrei să dezactivezi acest cont? Utilizatorul nu va mai putea accesa platforma."
      )
    )
      return;

    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.TOGGLE_ACTIVE_API(userId),
        {},
        { Authorization: `Bearer ${token}` }
      );
      alert("Cont dezactivat cu succes!");
      fetchInstructors();
    } catch (error) {
      console.log("Error deactivating user:", error);
      alert("Eroare la dezactivarea contului!");
    }
  };

  const activateUser = async (userId) => {
    if (
      !confirm(
        "Sigur vrei să activezi acest cont? Utilizatorul va putea accesa platforma."
      )
    )
      return;

    try {
      await apiConnector(
        "PATCH",
        adminEndpoints.ACTIVATE_USER_API(userId),
        {},
        { Authorization: `Bearer ${token}` }
      );
      alert("Cont activat cu succes!");
      fetchInstructors();
    } catch (error) {
      console.log("Error activating user:", error);
      alert("Eroare la activarea contului!");
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(
        (instructor) =>
          instructor.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          instructor.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <h1 className="text-4xl text-richblack-300 font-boogaloo mb-8">
        Instructori
      </h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută după nume sau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-brand-primary rounded-lg bg-lavender-50 text-richblack-300 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <div className="overflow-x-auto border border-brand-primary rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-lavander-100">
            <tr>
              <th className="px-4 py-3 text-left">ID Instructor</th>
              <th className="px-4 py-3 text-left">Nume</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Activ</th>
              <th className="px-4 py-3 text-left">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructors.map((u) => (
              <tr key={u._id} className="border-t border-brand-primary/40">
                <td className="px-4 py-3">
                  <span
                    className="bg-lavender-50 px-2 py-1 rounded text-xs font-mono cursor-pointer0"
                    onClick={() => {
                      navigator.clipboard.writeText(u._id);
                      alert("ID copiat în clipboard!");
                    }}
                    title="Click pentru a copia ID-ul"
                  >
                    {u._id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.active ? "Da" : "Nu"}</td>
                <td className="px-4 py-3 flex gap-2 flex-wrap">
                  {u.active ? (
                    <button
                      className="px-3 py-1 text-richblack-600 border border-brand-primary rounded text-xs hover:bg-red-700"
                      onClick={() => deactivateUser(u._id)}
                    >
                      Dezactivează
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 text-richblack-600 border border-brand-primary rounded text-xs hover:bg-red-700"
                      onClick={() => activateUser(u._id)}
                      title="Activează contul (pentru utilizatori care nu au primit OTP)"
                    >
                      Activează
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
