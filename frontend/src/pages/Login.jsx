import loginImg from "../assets/Images/login.png";
import Template from "../components/core/Auth/Template";

function Login() {
  return (
    <Template
      title="Bine ai revenit!"
      description1="Perfecționează-ți abilitățile pentru prezent, viitor și tot ce urmează."
      description2="Învăță pentru a fi pregătit pentru viitor."
      image={loginImg}
      formType="login"
    />
  );
}

export default Login;
