import AddCourse from "./AddCourse/AddCourse";

export default function AdminCreateCourse() {
  return (
    <div>
      <h1 className="text-4xl text-richblack-300 font-boogaloo mb-8">
        Creeaza curs (Admin)
      </h1>
      <AddCourse />
    </div>
  );
}
