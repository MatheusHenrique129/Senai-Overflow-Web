import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import {
  Container,
  Header,
  Content,
  ProfileContainer,
  FeedContainer,
  ActionsContainer,
  QuestionCard,
  Logo,
  IconSignOut,
  FormNewQuestion,
} from "./styles";

import Input from "../../components/Input";

import { useEffect, useState, useRef } from "react";
import logo from "../../assets/logo.png";
import { api } from "../../services/api";
import imgProfile from "../../assets/foto_perfil.png";
import { signOut, getUser, setUser } from "../../services/security";
import Modal from "../../components/Modal";
import Select from "../../components/Select";
import Tag from "../../components/Chips";
import Loading from "../../components/Loading";
import { validSquaredImage } from "../../utils";

function Profile({ setShowLoading, handleReload, setMessage }) {
  const [student, setStudent] = useState(getUser());

  // useEffect(() => {
  //   setStudent(getUser());
  // }, []);

  const handleImage = async (e) => {
    if (!e.target.files[0]) return;

    try {
      await validSquaredImage(e.target.files[0]);

      const data = new FormData();

      data.append("image", e.target.files[0]);

      setShowLoading(true);

      const response = await api.post(`/students/${student.id}/images`, data);

      setTimeout(() => {
        setStudent({ ...student, image: response.data.image });
        handleReload();
      }, 1000);

      setUser({ ...student, image: response.data.image });
    } catch (error) {
      alert(error);
      setShowLoading(false);
    }
  };

  return (
    <>
      <section>
        <img src={student.image || imgProfile} alt="Imagem de Perfil" />
        <label htmlFor="editImageProfile">Editar Foto</label>
        <input id="editImageProfile" type="file" onChange={handleImage} />
      </section>
      <section>
        <strong>NOME:</strong>
        <p>{student.name}</p>
      </section>
      <section>
        <strong>RA:</strong>
        <p>{student.ra}</p>
      </section>
      <section>
        <strong>E-MAIL:</strong>
        <p>{student.email}</p>
      </section>
    </>
  );
}

function Answer({ answer }) {
  const student = getUser();

  return (
    <section>
      <header>
        <img src={answer.Student.image || imgProfile} alt="Imagem de Perfil" />
        <strong>
          por{" "}
          {student.studentId === answer.Student.id
            ? " Você"
            : answer.Student.name}
        </strong>
        <p>{format(new Date(answer.created_at), "dd/MM/yyyy 'as' HH:mm")}</p>
      </header>
      <p>{answer.description}</p>
    </section>
  );
}

function Question({ question, setShowLoading }) {
  const [answers, setAnswers] = useState([]);

  const [showAnswers, setShowAnswers] = useState(false);

  const [newAnswer, setNewAnswer] = useState("");

  const qtdAnswers = answers.length;

  const student = getUser();

  useEffect(() => {
    setAnswers(question.Answers);
  }, [question.Answers]);

  const handleAddAnswer = async (e) => {
    e.preventDefault();

    if (newAnswer.length < 8) {
      return alert("A resposta deve ter no minimo 8 caracteres");
    }

    setShowLoading(true);

    try {
      const response = await api.post(`questions/${question.id}/answers`, {
        description: newAnswer,
      });

      const student = getUser();

      const answerAdded = {
        id: response.data.id,
        description: newAnswer,
        created_at: response.data.createdAt,
        Student: {
          id: student.studentId,
          name: student.name,
          image: student.image,
        },
      };

      setAnswers([...answers, answerAdded]);

      setNewAnswer("");

      setShowLoading(false);
    } catch (error) {
      alert(error);
      setShowLoading(false);
    }
  };

  return (
    <QuestionCard>
      <header>
        <img
          src={question.Student.image || imgProfile}
          alt="Imagem de Perfil"
        />
        <strong>
          por{" "}
          {student.studentId === question.Student.id
            ? " Você"
            : question.Student.name}
        </strong>
        <p>
          em {format(new Date(question.created_at), "dd/MM/yyyy 'as' HH:mm")}
        </p>
      </header>
      <section>
        <strong>{question.title} </strong>
        <p>{question.description}</p>
        <img src={question.image} alt="" />
      </section>
      <footer>
        <h1 onClick={() => setShowAnswers(!showAnswers)}>
          {qtdAnswers === 0 ? (
            " Seja o primeiro a responder"
          ) : (
            <>
              {qtdAnswers}
              {qtdAnswers > 1 ? " Respostas" : " Resposta"}
            </>
          )}
        </h1>
        {showAnswers && (
          <>
            {answers.map((a) => (
              <Answer answer={a} />
            ))}
          </>
        )}
        <form onSubmit={handleAddAnswer}>
          <textarea
            placeholder="Escreva uma resposta..."
            onChange={(e) => setNewAnswer(e.target.value)}
            required
            value={newAnswer}
          ></textarea>
          <button>Comentar</button>
        </form>
      </footer>
    </QuestionCard>
  );
}

function NewQuestion({ handleReload, setShowLoading }) {
  const [categories, setCategories] = useState([]);

  const [categoriesSel, setCategoriesSel] = useState([]);

  const [image, setImage] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    gist: "",
  });

  const imageRef = useRef();

  const categoriesRef = useRef();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data);
      } catch (error) {
        alert(error);
      }
    };
    loadCategories();
  }, []);

  const handleCategories = (e) => {
    const idSel = e.target.value;

    const categorySel = categories.find((c) => c.id == idSel);

    if (categorySel && !categoriesSel.includes(categorySel))
      setCategoriesSel([...categoriesSel, categorySel]);

    e.target[e.target.selectedIndex].disabled = true;
    e.target.value = "";
  };

  const handleImage = (e) => {
    if (e.target.files[0]) {
      imageRef.current.src = URL.createObjectURL(e.target.files[0]);
      imageRef.current.style.display = "flex";
    } else {
      imageRef.current.src = "";
      imageRef.current.style.display = "none";
    }

    setImage(e.target.files[0]);
  };

  const handleUnselCategory = (idUnsel) => {
    setCategoriesSel(categoriesSel.filter((c) => c.id !== idUnsel));

    const { options } = categoriesRef.current;

    for (var i = 0; i < options.length; i++) {
      if (options[i].value === idUnsel.toString()) options[i].disabled = false;
    }
  };

  const handleInput = (e) => {
    setNewQuestion({ ...newQuestion, [e.target.id]: e.target.value });
  };

  const handleAddNewQuestion = async (e) => {
    e.preventDefault();

    const data = new FormData();

    if (newQuestion.gist) data.append("gist", newQuestion.gist);
    data.append("title", newQuestion.title);
    data.append("description", newQuestion.description);

    const categories = categoriesSel.reduce((s, c) => (s += c.id + ","), "");

    data.append("categories", categories.substr(0, categories.length - 1));

    if (image) data.append("image", image);
    if (newQuestion.gist) data.append("gist", newQuestion.gist);

    setShowLoading(true);

    try {
      await api.post("/questions", data, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      handleReload();
    } catch (error) {
      alert(error);
      setShowLoading(false);
    }
  };

  return (
    <FormNewQuestion onSubmit={handleAddNewQuestion}>
      <Input
        id="title"
        label="Titulo"
        value={newQuestion.title}
        handler={handleInput}
        required
      />
      <Input
        id="description"
        label="Descrição"
        value={newQuestion.description}
        handler={handleInput}
      />
      <Input
        id="gist"
        label="Gist"
        value={newQuestion.gist}
        handler={handleInput}
      />
      <Select
        id="Categories"
        label="Categorias"
        ref={categoriesRef}
        handler={handleCategories}
      >
        <option value="">Selecione</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.description}
          </option>
        ))}
        ;
      </Select>
      <div>
        {categoriesSel.map((c) => (
          <Tag
            info={c.description}
            handleClose={() => handleUnselCategory(c.id)}
          ></Tag>
        ))}
      </div>
      <input type="file" onChange={handleImage} />
      <img alt="Pré-visualização" ref={imageRef} />
      <button>Enviar</button>
    </FormNewQuestion>
  );
}

function Home() {
  const history = useHistory();

  const [questions, setQuestions] = useState([]);

  const [reload, setReload] = useState(null);

  const [showLoading, setShowLoading] = useState(false);

  const [showNewQuestion, setShowNewQuestion] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setShowLoading(true);
      const response = await api.get("/feed");

      setShowLoading(false);
      setQuestions(response.data);
    };
    loadQuestions();
  }, [reload]);

  const handleSignOut = () => {
    signOut();

    history.replace("/");
  };

  const handleReload = () => {
    setShowNewQuestion(false);
    setReload(Math.random());
  };

  return (
    <>
      {showLoading && <Loading />}
      {showNewQuestion && (
        <Modal
          title="Faça uma Pergunta"
          handleClose={() => setShowNewQuestion(false)}
        >
          <NewQuestion
            handleReload={handleReload}
            setShowLoading={setShowLoading}
          />
        </Modal>
      )}
      <Container>
        <Header>
          <Logo src={logo} onClick={handleReload} />
          <IconSignOut onClick={handleSignOut} />
        </Header>
        <Content>
          <ProfileContainer>
            <Profile
              handleReload={handleReload}
              setShowLoading={setShowLoading}
            />
          </ProfileContainer>
          <FeedContainer>
            {questions.map((q) => (
              <Question question={q} setShowLoading={setShowLoading} />
            ))}
          </FeedContainer>
          <ActionsContainer>
            <button onClick={() => setShowNewQuestion(true)}>
              Faça uma pergunta
            </button>
          </ActionsContainer>
        </Content>
      </Container>
    </>
  );
}

export default Home;
