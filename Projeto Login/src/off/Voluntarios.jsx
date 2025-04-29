import React, { useState, useEffect } from 'react';
import "../styles/LoginPage.css"; // Importando o CSS

function GerenciarVoluntarios() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [voluntarios, setVoluntarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', endereco: '' });

  const handleCadastro = () => {
    setMostrarCadastro(true);
    setMostrarBusca(false);
  };

  const handleBusca = () => {
    setMostrarCadastro(false);
    setMostrarBusca(true);
    buscarVoluntarios();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const cadastrarVoluntario = (e) => {
    e.preventDefault();
    const nomeComNumero = /\d/;
    if (nomeComNumero.test(formData.nome)) {
      alert('O nome não pode conter números.');
      return;
    }
    fetch('http://localhost:3000/cadastrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.text())
      .then((data) => {
        alert(data);
        setFormData({ nome: '', cpf: '', email: '', endereco: '' });
        buscarVoluntarios();
      })
      .catch((error) => console.error('Erro:', error));
  };

  const buscarVoluntarios = () => {
    fetch(`http://localhost:3000/buscar?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => setVoluntarios(data))
      .catch((error) => console.error('Erro:', error));
  };

  const excluirVoluntario = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este voluntário?')) {
      fetch(`http://localhost:3000/excluir/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.text())
        .then((data) => {
          alert(data);
          buscarVoluntarios();
        })
        .catch((error) => console.error('Erro:', error));
    }
  };
  const editarVoluntario = (id) => {
    fetch(`http://localhost:3000/buscar/${id}`)
      .then(response => response.json())
      .then(voluntario => {
        setFormData(voluntario);
        setMostrarCadastro(true);
        setMostrarBusca(false);
      })
      .catch(error => console.error('Erro ao buscar voluntário:', error));
  };
  
  const atualizarVoluntario = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/editar/${formData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
      .then(response => response.text())
      .then(data => {
        alert(data);
        setFormData({ nome: '', cpf: '', email: '', endereco: '' });
        buscarVoluntarios();
        setMostrarCadastro(false);
      })
      .catch(error => console.error('Erro ao atualizar voluntário:', error));
  };

  return (
    <div>
      <header>
        <img src="logo-ong.png" alt="Logo da ONG" id="logo-ong" />
      </header>
      <div className="menu">
        <nav>
          <ul>
            <li><a href="#">Planeta Verde</a></li>
            <li><a href="#">Doador</a></li>
            <li><a href="#">Doação</a></li>
            <li><a href="#">Projeto</a></li>
            <li><a href="#">Atividade</a></li>
            <li><a href="#">Pedido</a></li>
            <li><a href="#">Registro de Despesas</a></li>
            <li><a href="#">Sobre Nós</a></li>
          </ul>
        </nav>
      </div>

      <div className="container">
        <h1>Gerenciar Voluntário</h1>
        <div className="buttons">
          <button onClick={handleCadastro}>Cadastrar Voluntário</button>
          <button onClick={handleBusca}>Buscar Voluntário</button>
        </div>

        {mostrarCadastro && (
          <div className="form-container">
          <h2>{formData.id ? 'Editar Voluntário' : 'Cadastrar Voluntário'}</h2>
          <form onSubmit={formData.id ? atualizarVoluntario : cadastrarVoluntario}>
            <input name="nome" type="text" value={formData.nome} onChange={handleInputChange} placeholder="Nome" required />
            <input name="cpf" type="text" value={formData.cpf} onChange={handleInputChange} placeholder="CPF" required />
            <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
            <input name="endereco" type="text" value={formData.endereco} onChange={handleInputChange} placeholder="Endereço" required />
            <button type="submit">{formData.id ? 'Atualizar' : 'Cadastrar'}</button>
          </form>
        </div>
        )}

        {mostrarBusca && (
          <div className="form-container">
            <h2>Buscar Voluntário</h2>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome, CPF ou email" />
            <button onClick={buscarVoluntarios}>Buscar</button>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Email</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {voluntarios.map((voluntario) => (
                  <tr key={voluntario.id}>
                    <td>{voluntario.nome}</td>
                    <td>{voluntario.cpf}</td>
                    <td>{voluntario.email}</td>
                    <td>{voluntario.endereco}</td>
                    <td>
                    <button className="editar" onClick={() => editarVoluntario(voluntario.id)}>Editar</button>
                    <button className="deletar" onClick={() => excluirVoluntario(voluntario.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarVoluntarios;
