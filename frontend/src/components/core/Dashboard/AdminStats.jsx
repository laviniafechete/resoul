import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { courseEndpoints } from "../../../services/apis";

export default function AdminStats() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalCategories: 0,
    totalRevenue: 0,
    loading: true,
  });

  const getAdminStats = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      // Fetch admin stats from backend
      const response = await apiConnector(
        "GET",
        courseEndpoints.ADMIN_STATS_API,
        null,
        { Authorization: `Bearer ${token}` }
      );

      setStats({
        ...response.data.data,
        loading: false,
      });
    } catch (error) {
      console.log("Could not fetch admin stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    getAdminStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Cursuri",
      value: stats.totalCourses,
      icon: "📚",
      color: "bg-blue-500",
    },
    {
      title: "Total Studenți",
      value: stats.totalStudents,
      icon: "👨‍🎓",
      color: "bg-green-500",
    },
    {
      title: "Total Instructori",
      value: stats.totalInstructors,
      icon: "👨‍🏫",
      color: "bg-purple-500",
    },
    {
      title: "Total Categorii",
      value: stats.totalCategories,
      icon: "📂",
      color: "bg-orange-500",
    },
    {
      title: "Venit Total",
      value: `RON ${stats.totalRevenue.toFixed(2)}`,
      icon: "💰",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div>
      <h1 className="text-4xl text-richblack-300 font-boogaloo text-center sm:text-left mb-8">
        Statistici Platforma
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg p-6 border border-brand-primary hover:border-brand-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-2xl`}
              >
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-brand-primary">
                  {card.value}
                </p>
                <p className="text-richblack-300 text-sm">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-richblack-800 rounded-lg p-6 border border-richblack-700">
        <h2 className="text-2xl text-richblack-300 font-boogaloo mb-4">
          Informatii Platforma
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-richblack-300">
          <div>
            <p>
              <strong>Status:</strong> Activ
            </p>
            <p>
              <strong>Ultima actualizare:</strong>{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div>
            <p>
              <strong>Versiune:</strong> 1.0.0
            </p>
            <p>
              <strong>Mediu:</strong> Development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
