import { useState, useMemo } from "react";
import { Chart, registerables } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

Chart.register(...registerables);

export default function InstructorChart({ courses }) {
  // State to keep track of the currently selected chart
  const [currChart, setCurrChart] = useState("students");

  // Predefined color palette for better consistency
  const colorPalette = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#EC4899", // Pink
    "#6B7280", // Gray
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        totalStudents: 0,
        totalRevenue: 0,
        avgStudentsPerCourse: 0,
        avgRevenuePerCourse: 0,
        topCourse: null,
        totalCourses: 0,
      };
    }

    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.totalStudentsEnrolled || 0),
      0
    );
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (course.totalAmountGenerated || 0),
      0
    );
    const avgStudentsPerCourse = totalStudents / courses.length;
    const avgRevenuePerCourse = totalRevenue / courses.length;

    const topCourse = courses.reduce((max, course) =>
      (course.totalStudentsEnrolled || 0) > (max.totalStudentsEnrolled || 0)
        ? course
        : max
    );

    return {
      totalStudents,
      totalRevenue,
      avgStudentsPerCourse: Math.round(avgStudentsPerCourse),
      avgRevenuePerCourse: Math.round(avgRevenuePerCourse),
      topCourse,
      totalCourses: courses.length,
    };
  }, [courses]);

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) =>
      course.courseName.length > 20
        ? course.courseName.substring(0, 20) + "..."
        : course.courseName
    ),
    datasets: [
      {
        label: "Studenți înscriși",
        data: courses.map((course) => course.totalStudentsEnrolled || 0),
        backgroundColor: colorPalette.slice(0, courses.length),
        borderColor: colorPalette
          .slice(0, courses.length)
          .map((color) => color + "80"),
        borderWidth: 2,
      },
    ],
  };

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) =>
      course.courseName.length > 20
        ? course.courseName.substring(0, 20) + "..."
        : course.courseName
    ),
    datasets: [
      {
        label: "Venituri (RON)",
        data: courses.map((course) => course.totalAmountGenerated || 0),
        backgroundColor: colorPalette.slice(0, courses.length),
        borderColor: colorPalette
          .slice(0, courses.length)
          .map((color) => color + "80"),
        borderWidth: 2,
      },
    ],
  };

  // Data for bar chart (comparison)
  const chartComparisonData = {
    labels: courses.map((course) =>
      course.courseName.length > 15
        ? course.courseName.substring(0, 15) + "..."
        : course.courseName
    ),
    datasets: [
      {
        label: "Studenți",
        data: courses.map((course) => course.totalStudentsEnrolled || 0),
        backgroundColor: "#3B82F6",
        yAxisID: "y",
      },
      {
        label: "Venituri (RON)",
        data: courses.map((course) => course.totalAmountGenerated || 0),
        backgroundColor: "#10B981",
        yAxisID: "y1",
      },
    ],
  };

  // Options for pie charts
  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          usePointStyle: true,
          color: "rgb(153 157 170)",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#E5E7EB",
        bodyColor: "#E5E7EB",
        borderColor: "#F59E0B",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Options for bar chart
  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Cursuri",
          color: "#E5E7EB",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Studenți",
          color: "#E5E7EB",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Venituri (RON)",
          color: "#E5E7EB",
          font: {
            size: 12,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#E5E7EB",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#E5E7EB",
        bodyColor: "#E5E7EB",
        borderColor: "#F59E0B",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            if (label === "Venituri (RON)") {
              return `${label}: ${value.toLocaleString()} RON`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
        <p className="text-lg font-bold text-richblack-5">
          Analiză Performanță
        </p>
        <div className="flex items-center justify-center h-64">
          <p className="text-richblack-300">
            Nu există cursuri pentru a afișa analiza
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-md border border-brand-primary p-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold text-richblack-300">
          Analiză Performanță
        </p>
        <div className="text-sm text-richblack-300">
          {stats.totalCourses} cursuri • {stats.totalStudents} studenți
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-lavender-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-richblack-300">
            {stats.totalStudents}
          </div>
          <div className="text-xs text-richblack-300">Total Studenți</div>
        </div>
        <div className="bg-lavender-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-400">
            {stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-richblack-300">Venit Total (RON)</div>
        </div>
        <div className="bg-lavender-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-400">
            {stats.avgStudentsPerCourse}
          </div>
          <div className="text-xs text-richblack-300">Medie Studenți/Curs</div>
        </div>
        <div className="bg-lavender-100 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-400">
            {stats.avgRevenuePerCourse}
          </div>
          <div className="text-xs text-richblack-300">
            Medie Venit/Curs (RON)
          </div>
        </div>
      </div>

      {/* Top Course Info */}
      {stats.topCourse && (
        <div className="bg-lavender-100 rounded-lg p-3 mb-4">
          <div className="text-sm text-richblack-300 mb-1">
            Cursul cu cei mai mulți studenți:
          </div>
          <div className="text-richblack-300 font-semibold truncate">
            {stats.topCourse.courseName}
          </div>
          <div className="text-xs text-richblack-300">
            {stats.topCourse.totalStudentsEnrolled || 0} studenți •{" "}
            {(stats.topCourse.totalAmountGenerated || 0).toLocaleString()} RON
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 font-semibold mb-4">
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
            currChart === "students"
              ? "bg-yellow-500 text-richblack-900"
              : "bg-lavender-100 text-richblack-300 hover:bg-richblack-600"
          }`}
        >
          📊 Studenți
        </button>
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
            currChart === "income"
              ? "bg-yellow-500 text-richblack-900"
              : "bg-lavender-100 text-richblack-300 hover:bg-richblack-600"
          }`}
        >
          💰 Venituri
        </button>
        <button
          onClick={() => setCurrChart("comparison")}
          className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
            currChart === "comparison"
              ? "bg-yellow-500 text-richblack-900"
              : "bg-lavender-100 text-richblack-300 hover:bg-richblack-600"
          }`}
        >
          📈 Comparație
        </button>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 bg-lavender-100 rounded-lg p-4">
        <div className="relative w-full h-full max-h-80">
          {currChart === "students" && (
            <Pie data={chartDataStudents} options={pieOptions} />
          )}
          {currChart === "income" && (
            <Pie data={chartIncomeData} options={pieOptions} />
          )}
          {currChart === "comparison" && (
            <Bar data={chartComparisonData} options={barOptions} />
          )}
        </div>
      </div>

      {/* Chart Legend/Info */}
      <div className="text-xs text-richblack-300 text-center mt-2">
        {currChart === "students" && "Distribuția studenților pe cursuri"}
        {currChart === "income" && "Distribuția veniturilor pe cursuri"}
        {currChart === "comparison" &&
          "Comparație studenți vs venituri pe cursuri"}
      </div>
    </div>
  );
}

InstructorChart.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      courseName: PropTypes.string,
      totalStudentsEnrolled: PropTypes.number,
      totalAmountGenerated: PropTypes.number,
    })
  ),
};
