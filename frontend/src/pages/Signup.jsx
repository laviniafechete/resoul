import signupImg from "../assets/Images/signup.png";
import Template from "../components/core/Auth/Template";

function Signup() {
  return (
    <Template
      title="Alătură-te comunității noastre"
      description1="Perfecționează-ți abilitățile pentru prezent, viitor și tot ce urmează."
      description2="Învăță pentru a fi pregătit pentru viitor."
      image={signupImg}
      formType="signup"
    />
  );
}

export default Signup;
