import { useState } from "react";
import { api } from "../../services/api";
import Input from "../../components/Input";
import { Link, useHistory } from "react-router-dom";
import { Container, FormLogin, Header, Body, Button } from "./styles";
import { signIn } from "../../services/security";
import Loading from "../../components/Loading";

function Register() {
  const history = useHistory();

  const [showLoading, setShowLoading] = useState(false);

  const [student, setStudent] = useState({
    ra: "",
    name: "",
    email: "",
    password: "",
    validPassword: "",
  });

  const handleInput = (e) => {
    setStudent({ ...student, [e.target.id]: e.target.value });
  };

  const validPassword = () => student.password === student.validPassword;

  const buttonDisabled = () => {
    const { ra, name, email, password } = student;

    if (!ra || !name || !email || !password || !validPassword()) return true;

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validPassword()) return alert("As senhas precisam ser iguais!");

    try {
      const { ra, name, email, password } = student;

      const response = await api.post("/students", {
        ra,
        name,
        email,
        password,
      });

      signIn(response.data);

      setShowLoading(true);
      history.push("/home");
    } catch (error) {
      console.error(error);
      alert(error.response.data.error);
      setShowLoading(false);
    }
  };

  return (
    <>
      {showLoading && <Loading />}
      <Container>
        <FormLogin onSubmit={handleSubmit}>
          <Header>
            <h1>BEM VINDO AO SENAIOVERFLOW</h1>
            <h2>INFORME OS SEUS DADOS</h2>
          </Header>
          <Body>
            <Input
              id="ra"
              label="RA"
              type="text"
              value={student.ra}
              handler={handleInput}
            />
            <Input
              id="name"
              label="Nome"
              type="text"
              value={student.name}
              handler={handleInput}
            />
            <Input
              id="email"
              label="E-mail"
              type="email"
              value={student.email}
              handler={handleInput}
            />
            <Input
              id="password"
              label="Senha"
              type="password"
              value={student.password}
              handler={handleInput}
            />
            <Input
              id="validPassword"
              label="Confirmar Senha"
              type="password"
              onBlur={(e) => {
                if (!validPassword()) alert("As senhas precisam ser iguais");
                e.target.focus();
              }}
              value={student.validPassword}
              handler={handleInput}
            />
            <Button
              disabled={buttonDisabled()}
              onClick={() => setShowLoading(true)}
            >
              Cadastrar
            </Button>
            <Link to="/">Ou, se já tem cadastro, clique para entrar</Link>
          </Body>
        </FormLogin>
      </Container>
    </>
  );
}

export default Register;
