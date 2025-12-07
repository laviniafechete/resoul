import { useEffect } from "react";
import RenderSteps from "./RenderSteps";

export default function AddCourse() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex w-full items-start gap-x-6">
      <div className="flex flex-1 flex-col">
        <h1 className="mb-14 text-3xl font-medium text-richblack-300 font-boogaloo text-center lg:text-left">
          Adauga curs
        </h1>

        <div className="flex-1">
          <RenderSteps />
        </div>
      </div>

      {/* Course Upload Tips */}
      <div className="sticky top-10 hidden lg:block max-w-[400px] flex-1 rounded-md border-[1px] border-brand-primary p-6 ">
        <p className="mb-8 text-lg text-richblack-300">
          Sfaturi pentru uploadul cursului
        </p>

        <ul className="ml-5 list-item list-disc space-y-4 text-xs text-richblack-300">
          <li>Seteaza pretul cursului sau face-l gratuit.</li>
          <li>Dimensiunea standard pentru miniatura cursului este 1024x576.</li>
          <li>
            Sectiunea video controleaza video-ul de prezentare al cursului.
          </li>
          <li>Constructorul de curs este unde creezi & organizezi un curs.</li>
          <li>
            Adauga subiecte in sectiunea Constructorul de curs pentru a crea
            lecții, teste și teme.
          </li>
          <li>
            Informatiile din sectiunea date suplimentare apar pe pagina unica a
            cursului.
          </li>
          <li>Fă anunțuri pentru a notifica orice important</li>
          <li>Note pentru toți studenții înscriși în același timp.</li>
        </ul>
      </div>
    </div>
  );
}
