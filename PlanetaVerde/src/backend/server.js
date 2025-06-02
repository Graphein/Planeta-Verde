const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "planeta_verde",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados MySQL");
});

function gerarSenha() {
  return crypto.randomBytes(8).toString('hex');  // Senha de 8 bytes (pode ser ajustado)
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ajuda.planetaverde@gmail.com",
    pass: "nfmyjqbwisuexeut",
  },
});

const JWT_SECRET =
  "5fcd95ffcfad0327aafd77c2ff738d591f2a52b83d8672a120a06b57d7b4f8af13333f93ede5592878c2e3eb90ae2c92f78d08e2db0b80748e00a0c2f282e0f57f854972e6227424fe101b4301bfaac48f0673193bf36d5551a319ce1108b5bb0a2b6d1c304aeb94fe34b82f2e893575cacb731acde51952d4177a5c5192b055d02f35bef6bf834432eddc3f32fff6061c1a27fa8a6417ce3d44e02f9290dcd3bd8fcd899a9e437da66b00d4b009e3ef3e1b96840ab40ea302b703a1f85d5a5836bb8630606d2b5e23c9a408ddf5079bae563ddef41f7f7a743d3b7554d9982a18fe379cf431b3a3f38e6bb57b3cc62bb7b6bf271712d4389d6a030c1227531c";

  const executeQuery = (query, values, res, tipoOperacao = "", tabela = "") => {
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Erro ao executar a consulta:", err);
        return res.status(500).json({ error: "Erro ao executar a consulta", details: err.message });
      }
  
      if (tipoOperacao === "insert") {
        const newId = results.insertId;
        if (!tabela) {
          return res.status(500).json({ error: "Tabela não fornecida para busca do novo registro" });
        }
        const selectQuery = `SELECT * FROM ${tabela} WHERE id = ?`;
        db.query(selectQuery, [newId], (err, newRecord) => {
          if (err) {
            console.error("Erro ao buscar o novo registro:", err);
            return res.status(500).json({ error: "Erro ao buscar o novo registro", details: err.message });
          }
          res.status(201).json(newRecord[0]);
        });
      } else if (tipoOperacao === "update") {
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Registro não encontrado" });
        }
        return res.status(200).json({ message: "Registro atualizado com sucesso" });
      } else if (tipoOperacao === "delete") {
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Registro não encontrado para exclusão" });
        }
        return res.status(200).json({ message: "Registro excluído com sucesso" });
      } else {
        return res.json(results);
      }
    });
  };

// Middleware de autenticação
const autenticar = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Middleware de autorização por nível de acesso
const autorizar = (niveisPermitidos) => (req, res, next) => {
  if (!niveisPermitidos.includes(req.user.nivel_acesso)) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
};

// ---------- ROTAS DE USUÁRIOS ----------

// Cadastro de usuário (apenas admin pode criar usuários)
app.post("/usuarios", autenticar, autorizar(["admin"]), async (req, res) => {
  const { nome, email, senha, nivel_acesso } = req.body;
  if (!nome || !email || !senha || !nivel_acesso) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, email, senha, nivel_acesso" });
  }

  const niveisValidos = ["admin", "gerente", "voluntario"];
  if (!niveisValidos.includes(nivel_acesso)) {
    return res.status(400).json({ error: "Nível de acesso inválido. Use: admin, gerente, voluntario" });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const query = "INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (?, ?, ?, ?)";
    executeQuery(query, [nome, email, senhaCriptografada, nivel_acesso], res, "insert");
  } catch (error) {
    console.error("Erro ao criptografar senha:", error);
    res.status(500).json({ error: "Erro ao criptografar senha" });
  }
});

// Login (todos podem acessar)
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: "Campos obrigatórios: email, senha" });
  }

  const query = "SELECT * FROM usuarios WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuário" });
    if (results.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nivel_acesso: usuario.nivel_acesso },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel_acesso: usuario.nivel_acesso },
    });
  });
});

app.post("/recuperar-senha", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email é obrigatório" });

  const query = "SELECT * FROM usuarios WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuário" });
    if (results.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });

    const usuario = results[0];
    
    // Gerar uma senha temporária
    const novaSenha = gerarSenha();
    
    // Criptografar a nova senha
    bcrypt.hash(novaSenha, 10, (err, senhaHash) => {
      if (err) return res.status(500).json({ error: "Erro ao criptografar senha" });

      // Atualizar a senha no banco de dados
      const updateQuery = "UPDATE usuarios SET senha = ? WHERE id = ?";
      db.query(updateQuery, [senhaHash, usuario.id], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao atualizar a senha" });

        // Enviar e-mail com a nova senha
        const mailOptions = {
          from: "ajuda.planetaverde@gmail.com",
          to: email,
          subject: "Sua Nova Senha - Planeta Verde",
          html: `
            <h1>Senha Alterada com Sucesso</h1>
            <p>Sua senha foi alterada com sucesso. Aqui está sua nova senha:</p>
            <p><strong>${novaSenha}</strong></p>
            <p>Por favor, acesse sua conta usando essa nova senha. Se você não solicitou essa alteração, entre em contato com nosso suporte.</p>
          `,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).json({ error: "Erro ao enviar email", details: error.message });
          res.json({ message: "Sua nova senha foi enviada para o seu e-mail" });
        });
      });
    });
  });
});

// Redefinir senha (todos podem acessar)
app.post("/redefinir-senha/:token", async (req, res) => {
  const { token } = req.params;
  const { novaSenha } = req.body;
  if (!novaSenha) return res.status(400).json({ error: "Nova senha é obrigatória" });

  const query = "SELECT * FROM usuarios WHERE token_recuperacao = ? AND data_expiracao_token > NOW()";
  db.query(query, [token], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao verificar token" });
    if (results.length === 0) return res.status(400).json({ error: "Token inválido ou expirado" });

    const usuario = results[0];
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    const updateQuery = "UPDATE usuarios SET senha = ?, token_recuperacao = NULL, data_expiracao_token = NULL WHERE id = ?";
    db.query(updateQuery, [senhaCriptografada, usuario.id], (err) => {
      if (err) return res.status(500).json({ error: "Erro ao redefinir senha" });
      res.json({ message: "Senha redefinida com sucesso" });
    });
  });
});

// Trocar senha (todos podem acessar)
app.put("/trocar-senha", autenticar, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ error: "Campos obrigatórios: senhaAtual, novaSenha" });
  }

  const query = "SELECT * FROM usuarios WHERE id = ?";
  db.query(query, [req.user.id], async (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuário" });
    if (results.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });

    const usuario = results[0];
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: "Senha atual incorreta" });

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    const updateQuery = "UPDATE usuarios SET senha = ? WHERE id = ?";
    db.query(updateQuery, [senhaCriptografada, usuario.id], (err) => {
      if (err) return res.status(500).json({ error: "Erro ao trocar senha" });
      res.json({ message: "Senha trocada com sucesso" });
    });
  });
});

// ---------- ROTAS DE DOAÇÕES ----------

// Agendar Doação (apenas admin e gerente)
app.post("/doacoes/agendar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, doador, tipo_doacao, quantidade, descricao, responsavel, observacoes, status } = req.body;
  if (!data || !doador || !tipo_doacao || !quantidade || !responsavel || !status) {
    return res.status(400).json({ error: "Campos obrigatórios: data, doador, tipo_doacao, quantidade, responsavel, status" });
  }

  const query =
    "INSERT INTO agendar_doacao (data_agendamento, doador_id, tipo_doacao, quantidade, descricao, responsavel_id, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  executeQuery(
    query,
    [data, doador, tipo_doacao, quantidade, descricao, responsavel, observacoes, status],
    res,
    "insert",
    "agendar_doacao"
  );
});

// Receber Doação (todos podem acessar)
app.post("/doacoes/receber", autenticar, autorizar(["admin", "gerente", "voluntario"]), (req, res) => {
  const { doador, tipo_doacao, quantidade, observacoes } = req.body;
  if (!doador || !tipo_doacao || !quantidade) {
    return res.status(400).json({ error: "Campos obrigatórios: doador, tipo_doacao, quantidade" });
  }

  const query =
    "INSERT INTO receber_doacao (data_recebimento, doador_id, tipo_doacao, quantidade, observacoes, responsavel_id) VALUES (NOW(), ?, ?, ?, ?, ?)";
  executeQuery(query, [doador, tipo_doacao, quantidade, observacoes, req.user.id], res, "insert", "receber_doacao");
});

// Atualizar Doação Agendada (apenas admin e gerente)
app.put("/doacoes/agendar/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, doador, tipo_doacao, quantidade, descricao, responsavel, observacoes, status } = req.body;

  const camposPermitidos = ["data", "doador", "tipo_doacao", "quantidade", "descricao", "responsavel", "observacoes", "status"];
  const dados = { data, doador, tipo_doacao, quantidade, descricao, responsavel, observacoes, status };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const valores = [];
  const setClause = camposFiltrados.map(campo => {
    if (campo === "data") return "data_agendamento = ?";
    if (campo === "doador") return "doador_id = ?";
    if (campo === "responsavel") return "responsavel_id = ?";
    return `${campo} = ?`;
  }).join(", ");

  camposFiltrados.forEach(campo => valores.push(dados[campo]));
  valores.push(id);

  const query = `UPDATE agendar_doacao SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Atualizar Doação Recebida (apenas admin e gerente)
app.put("/doacoes/receber/:id", autenticar, autorizar(["admin", "gerente","voluntario"]), (req, res) => {
  const { id } = req.params;
  const { doador, tipo_doacao, quantidade, observacoes } = req.body;

  const camposPermitidos = ["doador", "tipo_doacao", "quantidade", "observacoes"];
  const dados = { doador, tipo_doacao, quantidade, observacoes };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const valores = [];
  const setClause = camposFiltrados.map(campo => {
    if (campo === "doador") return "doador_id = ?";
    return `${campo} = ?`;
  }).join(", ");

  camposFiltrados.forEach(campo => valores.push(dados[campo]));
  valores.push(id);

  const query = `UPDATE receber_doacao SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Excluir Doação Agendada (apenas admin)
app.delete("/doacoes/agendar/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM agendar_doacao WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// Excluir Doação Recebida (apenas admin)
app.delete("/doacoes/receber/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM receber_doacao WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// Pesquisar Doação Agendada (apenas admin e gerente)
app.get("/doacoes/agendar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { status, doador_id, tipo_doacao } = req.query;
  let query = "SELECT * FROM agendar_doacao WHERE 1=1";
  const values = [];

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }
  if (doador_id) {
    query += " AND doador_id = ?";
    values.push(doador_id);
  }
  if (tipo_doacao) {
    query += " AND tipo_doacao LIKE ?";
    values.push(`%${tipo_doacao}%`);
  }

  executeQuery(query, values, res);
});

// Pesquisar Doação Recebida (todos podem acessar)
app.get("/doacoes/receber", autenticar, autorizar(["admin", "gerente", "voluntario"]), (req, res) => {
  const { doador_id, tipo_doacao } = req.query;
  let query = "SELECT * FROM receber_doacao WHERE 1=1";
  const values = [];

  if (doador_id) {
    query += " AND doador_id = ?";
    values.push(doador_id);
  }
  if (tipo_doacao) {
    query += " AND tipo_doacao LIKE ?";
    values.push(`%${tipo_doacao}%`);
  }

  executeQuery(query, values, res);
});

// ---------- ROTAS DE ATIVIDADES ----------

// Iniciar Atividade (apenas admin e gerente)
app.post("/atividades/iniciar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, atividade, responsavel, descricao, voluntarios, status } = req.body;
  if (!data || !atividade || !responsavel || !status) {
    return res.status(400).json({ error: "Campos obrigatórios: data, atividade, responsavel, status" });
  }

  const query =
    "INSERT INTO iniciar_atividade (data_inicio, atividade_id, responsavel_id, descricao, voluntarios, status) VALUES (?, ?, ?, ?, ?, ?)";
  executeQuery(query, [data, atividade, responsavel, descricao, voluntarios, status], res, "insert", "iniciar_atividade");
});

// Concluir Atividade (apenas admin e gerente)
app.post("/atividades/concluir", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, atividade, responsavel, resultado, feedback } = req.body;
  if (!data || !atividade || !responsavel || !resultado) {
    return res.status(400).json({ error: "Campos obrigatórios: data, atividade, responsavel, resultado" });
  }

  const query =
    "INSERT INTO concluir_atividade (data_conclusao, atividade_id, responsavel_id, resultado, feedback) VALUES (?, ?, ?, ?, ?)";
  executeQuery(query, [data, atividade, responsavel, resultado, feedback], res, "insert", "concluir_atividade");
});

// Atualizar Atividade Iniciada (apenas admin e gerente)
app.put("/atividades/iniciar/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, atividade, responsavel, descricao, voluntarios, status } = req.body;

  const camposPermitidos = ["data", "atividade", "responsavel", "descricao", "voluntarios", "status"];
  const dados = { data, atividade, responsavel, descricao, voluntarios, status };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const valores = [];
  const setClause = camposFiltrados.map(campo => {
    if (campo === "data") return "data_inicio = ?";
    if (campo === "atividade") return "atividade_id = ?";
    if (campo === "responsavel") return "responsavel_id = ?";
    return `${campo} = ?`;
  }).join(", ");

  camposFiltrados.forEach(campo => valores.push(dados[campo]));
  valores.push(id);

  const query = `UPDATE iniciar_atividade SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Atualizar Atividade Concluída (apenas admin e gerente)
app.put("/atividades/concluir/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, atividade, responsavel, resultado, feedback } = req.body;

  const camposPermitidos = ["data", "atividade", "responsavel", "resultado", "feedback"];
  const dados = { data, atividade, responsavel, resultado, feedback };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const valores = [];
  const setClause = camposFiltrados.map(campo => {
    if (campo === "data") return "data_conclusao = ?";
    if (campo === "atividade") return "atividade_id = ?";
    if (campo === "responsavel") return "responsavel_id = ?";
    return `${campo} = ?`;
  }).join(", ");

  camposFiltrados.forEach(campo => valores.push(dados[campo]));
  valores.push(id);

  const query = `UPDATE concluir_atividade SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Excluir Atividade Iniciada (apenas admin)
app.delete("/atividades/iniciar/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM iniciar_atividade WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// Excluir Atividade Concluída (apenas admin)
app.delete("/atividades/concluir/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM concluir_atividade WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// Pesquisar Atividade Iniciada (apenas admin e gerente)
app.get("/atividades/iniciar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { status, responsavel_id } = req.query;
  let query = "SELECT * FROM iniciar_atividade WHERE 1=1";
  const values = [];

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }
  if (responsavel_id) {
    query += " AND responsavel_id = ?";
    values.push(responsavel_id);
  }

  executeQuery(query, values, res);
});

// Pesquisar Atividade Concluída (apenas admin e gerente)
app.get("/atividades/concluir", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { responsavel_id, resultado } = req.query;
  let query = "SELECT * FROM concluir_atividade WHERE 1=1";
  const values = [];

  if (responsavel_id) {
    query += " AND responsavel_id = ?";
    values.push(responsavel_id);
  }
  if (resultado) {
    query += " AND resultado LIKE ?";
    values.push(`%${resultado}%`);
  }

  executeQuery(query, values, res);
});
//-- Iniciar Projeto e Listar Projetos Iniciados --\\

// Criar Projeto
app.post("/projetos/iniciar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { nome_projeto, data_inicio, responsavel_id, descricao, status } = req.body;

  if (!nome_projeto || !data_inicio || !responsavel_id || !status) {
    return res.status(400).json({ error: "Campos obrigatórios: nome_projeto, data_inicio, responsavel_id, status" });
  }

  const query = `INSERT INTO iniciar_projeto (nome_projeto, data_inicio, responsavel_id, descricao, status) VALUES (?, ?, ?, ?, ?)`;

  // ✅ Adicionamos o nome da tabela aqui no insert
  executeQuery(query, [nome_projeto, data_inicio, responsavel_id, descricao, status], res, "insert", "iniciar_projeto");
});

// Listar Projetos
app.get("/projetos/iniciar", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM iniciar_projeto WHERE 1=1";
  const values = [];

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }

  executeQuery(query, values, res); // 🔎 aqui não precisa do nome da tabela
});

// Atualizar Projeto
app.put("/projetos/iniciar/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { nome_projeto, data_inicio, responsavel_id, descricao, status } = req.body;

  const camposPermitidos = ["nome_projeto", "data_inicio", "responsavel_id", "descricao", "status"];
  const dados = { nome_projeto, data_inicio, responsavel_id, descricao, status };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const setClause = camposFiltrados.map(campo => `${campo} = ?`).join(", ");
  const valores = camposFiltrados.map(campo => dados[campo]);
  valores.push(id);

  const query = `UPDATE iniciar_projeto SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Deletar Projeto
app.delete("/projetos/iniciar/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM iniciar_projeto WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// ---------------- ROTAS DE CONCLUSÃO DE PROJETOS ----------------

// Criar projeto concluído
app.post("/projetos/concluir", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { nome_projeto, data_inicio, data_conclusao, responsavel_id, descricao, status } = req.body;

  if (!nome_projeto || !data_inicio || !data_conclusao || !responsavel_id || !status) {
    return res.status(400).json({ error: "Campos obrigatórios: nome_projeto, data_inicio, data_conclusao, responsavel_id, status" });
  }

  const query = `
    INSERT INTO concluir_projeto (nome_projeto, data_inicio, data_conclusao, responsavel_id, descricao, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  executeQuery(query, [nome_projeto, data_inicio, data_conclusao, responsavel_id, descricao, status], res, "insert", "concluir_projeto");
});

// Listar projetos concluídos
app.get("/projetos/concluir", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM concluir_projeto WHERE 1=1";
  const values = [];

  if (status) {
    query += " AND status = ?";
    values.push(status);
  }

  executeQuery(query, values, res);
});

// Atualizar projeto concluído
app.put("/projetos/concluir/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { nome_projeto, data_inicio, data_conclusao, responsavel_id, descricao, status } = req.body;

  const camposPermitidos = ["nome_projeto", "data_inicio", "data_conclusao", "responsavel_id", "descricao", "status"];
  const dados = { nome_projeto, data_inicio, data_conclusao, responsavel_id, descricao, status };
  const camposFiltrados = Object.keys(dados).filter(campo => camposPermitidos.includes(campo) && dados[campo] !== undefined);

  if (camposFiltrados.length === 0) {
    return res.status(400).json({ error: "Nenhum campo válido fornecido para atualização" });
  }

  const setClause = camposFiltrados.map(campo => `${campo} = ?`).join(", ");
  const valores = camposFiltrados.map(campo => dados[campo]);
  valores.push(id);

  const query = `UPDATE concluir_projeto SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

// Deletar projeto concluído
app.delete("/projetos/concluir/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM concluir_projeto WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// ---------------- ROTAS DE ESTOQUE ----------------

app.post("/estoque", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { item, quantidade, tipo, observacoes } = req.body;

  if (!item || !quantidade || !tipo) {
    return res.status(400).json({ error: "Campos obrigatórios: item, quantidade, tipo" });
  }

  const query = `
    INSERT INTO estoque (item, quantidade, tipo, observacoes)
    VALUES (?, ?, ?, ?)
  `;
  executeQuery(query, [item, quantidade, tipo, observacoes], res, "insert", "estoque");
});

app.get("/estoque", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const query = "SELECT * FROM estoque ORDER BY id DESC";
  executeQuery(query, [], res);
});

app.put("/estoque/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { item, quantidade, tipo, observacoes } = req.body;

  const campos = { item, quantidade, tipo, observacoes };
  const camposValidos = Object.keys(campos).filter(c => campos[c] !== undefined);

  if (camposValidos.length === 0) {
    return res.status(400).json({ error: "Nenhum campo fornecido para atualização" });
  }

  const setClause = camposValidos.map(campo => `${campo} = ?`).join(", ");
  const valores = camposValidos.map(campo => campos[campo]);
  valores.push(id);

  const query = `UPDATE estoque SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

app.delete("/estoque/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM estoque WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// ---------------- FINAL ROTAS DE ESTOQUE ---------------- \\
// ---------------- ROTAS DE CAIXA ----------------

app.post("/caixa", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, tipo, valor, descricao } = req.body;
  if (!data || !tipo || !valor) {
    return res.status(400).json({ error: "Campos obrigatórios: data, tipo, valor" });
  }

  const query = "INSERT INTO caixa (data, tipo, valor, descricao) VALUES (?, ?, ?, ?)";
  executeQuery(query, [data, tipo, valor, descricao], res, "insert", "caixa");
});

app.get("/caixa", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const query = "SELECT * FROM caixa ORDER BY data DESC";
  executeQuery(query, [], res);
});

app.put("/caixa/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, tipo, valor, descricao } = req.body;

  const campos = { data, tipo, valor, descricao };
  const camposValidos = Object.keys(campos).filter(c => campos[c] !== undefined);

  if (camposValidos.length === 0) {
    return res.status(400).json({ error: "Nenhum campo fornecido para atualização" });
  }

  const setClause = camposValidos.map(campo => `${campo} = ?`).join(", ");
  const valores = camposValidos.map(campo => campos[campo]);
  valores.push(id);

  const query = `UPDATE caixa SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

app.delete("/caixa/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM caixa WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});
// ---------------- FINAL ROTAS DE CAIXA ----------------

// ---------------- ROTAS DE PEDIDOS ----------------

app.post("/pedidos", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, item, quantidade, solicitante, status, observacoes } = req.body;
  if (!data || !item || !quantidade || !solicitante || !status) {
    return res.status(400).json({ error: "Campos obrigatórios: data, item, quantidade, solicitante, status" });
  }

  const query = `
    INSERT INTO pedidos (data, item, quantidade, solicitante, status, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  executeQuery(query, [data, item, quantidade, solicitante, status, observacoes], res, "insert", "pedidos");
});

app.get("/pedidos", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const query = "SELECT * FROM pedidos ORDER BY data DESC";
  executeQuery(query, [], res);
});

app.put("/pedidos/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, item, quantidade, solicitante, status, observacoes } = req.body;

  const campos = { data, item, quantidade, solicitante, status, observacoes };
  const camposValidos = Object.keys(campos).filter(c => campos[c] !== undefined);

  if (camposValidos.length === 0) {
    return res.status(400).json({ error: "Nenhum campo fornecido para atualização" });
  }

  const setClause = camposValidos.map(campo => `${campo} = ?`).join(", ");
  const valores = camposValidos.map(campo => campos[campo]);
  valores.push(id);

  const query = `UPDATE pedidos SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

app.delete("/pedidos/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM pedidos WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// ---------------- FINAL ROTAS DE PEDIDOS ----------------
// ---------------- ROTAS DE DESPESAS ----------------

app.post("/despesas", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { data, categoria, valor, descricao } = req.body;
  if (!data || !categoria || !valor) {
    return res.status(400).json({ error: "Campos obrigatórios: data, categoria, valor" });
  }

  const query = `
    INSERT INTO despesas (data, categoria, valor, descricao)
    VALUES (?, ?, ?, ?)
  `;
  executeQuery(query, [data, categoria, valor, descricao], res, "insert", "despesas");
});

app.get("/despesas", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const query = "SELECT * FROM despesas ORDER BY data DESC";
  executeQuery(query, [], res);
});

app.put("/despesas/:id", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { id } = req.params;
  const { data, categoria, valor, descricao } = req.body;

  const campos = { data, categoria, valor, descricao };
  const camposValidos = Object.keys(campos).filter(c => campos[c] !== undefined);

  if (camposValidos.length === 0) {
    return res.status(400).json({ error: "Nenhum campo fornecido para atualização" });
  }

  const setClause = camposValidos.map(campo => `${campo} = ?`).join(", ");
  const valores = camposValidos.map(campo => campos[campo]);
  valores.push(id);

  const query = `UPDATE despesas SET ${setClause} WHERE id = ?`;
  executeQuery(query, valores, res, "update");
});

app.delete("/despesas/:id", autenticar, autorizar(["admin"]), (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM despesas WHERE id = ?";
  executeQuery(query, [id], res, "delete");
});

// ---------------- FINAL ROTAS DE DESPESAS ----------------
// ----------------  ROTAS DASHBORD ----------------

app.get("/dashboard", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const { periodo } = req.query; // Ex.: ultimo_mes, ultimo_trimestre, ultimo_ano
  const result = {
    kpis: {},
    graficos: {
      doacoes_mensais: [],
      despesas_por_categoria: [],
    },
    atividades_recentes: [],
  };

  // Definir intervalo de tempo com base no período
  const getFiltroPorCampo = (campoData) => {
    if (periodo === "ultimo_mes") {
      return `AND DATE(${campoData}) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`;
    } else if (periodo === "ultimo_trimestre") {
      return `AND DATE(${campoData}) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`;
    } else if (periodo === "ultimo_ano") {
      return `AND DATE(${campoData}) >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`;
    }
    return ""; // sem filtro
  };

  // KPIs (contagens)
  const queries = {
    agendar_doacao: `SELECT COUNT(*) AS total FROM agendar_doacao WHERE 1=1 ${getFiltroPorCampo('data_agendamento')}`,
    receber_doacao: `SELECT COUNT(*) AS total FROM receber_doacao WHERE 1=1 ${getFiltroPorCampo('data_recebimento')}`,
    pedidos: `SELECT COUNT(*) AS total FROM pedidos WHERE 1=1 ${getFiltroPorCampo('data')}`,
    pedidos_pendentes: `SELECT COUNT(*) AS total FROM pedidos WHERE status = 'Pendente' ${getFiltroPorCampo('data')}`,
    estoque: `SELECT COUNT(*) AS total FROM estoque WHERE 1=1 ${getFiltroPorCampo('data_registro')}`,
    iniciar_projeto: `SELECT COUNT(*) AS total FROM iniciar_projeto WHERE 1=1 ${getFiltroPorCampo('data_inicio')}`,
    concluir_projeto: `SELECT COUNT(*) AS total FROM concluir_projeto WHERE 1=1 ${getFiltroPorCampo('data_conclusao')}`,
    iniciar_atividade: `SELECT COUNT(*) AS total FROM iniciar_atividade WHERE 1=1 ${getFiltroPorCampo('data_inicio')}`,
    concluir_atividade: `SELECT COUNT(*) AS total FROM concluir_atividade WHERE 1=1 ${getFiltroPorCampo('data_conclusao')}`,
    despesas: `SELECT COUNT(*) AS total FROM despesas WHERE 1=1 ${getFiltroPorCampo('data')}`,
    caixa: `SELECT COUNT(*) AS total FROM caixa WHERE 1=1 ${getFiltroPorCampo('data')}`,
  };
  

  // Gráficos
  const graficoQueries = {
    doacoes_mensais: `
      SELECT DATE_FORMAT(data_recebimento, '%Y-%m') AS mes, COUNT(*) AS total
      FROM receber_doacao
      WHERE 1=1 ${getFiltroPorCampo('data_recebimento')}
      GROUP BY DATE_FORMAT(data_recebimento, '%Y-%m')
      ORDER BY mes
    `,
    despesas_por_categoria: `
      SELECT categoria, SUM(valor) AS total
      FROM despesas
      WHERE 1=1 ${getFiltroPorCampo('data')}
      GROUP BY categoria
    `
  };

  // Atividades recentes (últimas 5 movimentações)
  const atividadesRecentesQuery = `
    (
      SELECT 'Doação Recebida' AS tipo, data_recebimento AS data, 
            CONCAT('Doação: ', tipo_doacao, ' (Qtd: ', quantidade, ')') AS descricao
      FROM receber_doacao
      WHERE 1=1 ${getFiltroPorCampo('data_recebimento')}
    )
    UNION
    (
      SELECT 'Projeto Iniciado' AS tipo, data_inicio AS data, 
            CONCAT('Projeto: ', nome_projeto) AS descricao
      FROM iniciar_projeto
      WHERE 1=1 ${getFiltroPorCampo('data_inicio')}
    )
    UNION
    (
      SELECT 'Projeto Concluído' AS tipo, data_conclusao AS data, 
            CONCAT('Projeto: ', nome_projeto) AS descricao
      FROM concluir_projeto
      WHERE 1=1 ${getFiltroPorCampo('data_conclusao')}
    )
    UNION
    (
      SELECT 'Despesa' AS tipo, data, 
            CONCAT('Despesa: ', categoria, ' (R$ ', valor, ')') AS descricao
      FROM despesas
      WHERE 1=1 ${getFiltroPorCampo('data')}
    )
    ORDER BY data DESC
    LIMIT 5
  `;
  let completed = 0;
  const totalQueries = Object.keys(queries).length + Object.keys(graficoQueries).length + 1; // +1 = atividades recentes
  let respondeu = false;
  
  const tentarResponder = () => {
    if (!respondeu && completed === totalQueries) {
      respondeu = true;
      res.json(result);
    }
  };
  
  // Executar queries de KPIs
  for (const [key, sql] of Object.entries(queries)) {
    db.query(sql, (err, rows) => {
      if (err) {
        if (!respondeu) {
          respondeu = true;
          return res.status(500).json({ error: `Erro ao buscar ${key}` });
        }
      }
      result.kpis[key] = rows[0]?.total ?? 0;
      completed++;
      tentarResponder();
    });
  }
  
  // Executar queries de gráficos
  for (const [key, sql] of Object.entries(graficoQueries)) {
    db.query(sql, (err, rows) => {
      if (err) {
        if (!respondeu) {
          respondeu = true;
          return res.status(500).json({ error: `Erro ao buscar ${key}` });
        }
      }
      result.graficos[key] = rows;
      completed++;
      tentarResponder();
    });
  }
  
  // Executar query de atividades recentes
  db.query(atividadesRecentesQuery, (err, rows) => {
    if (err) {
      if (!respondeu) {
        respondeu = true;
        return res.status(500).json({ error: "Erro ao buscar atividades recentes" });
      }
    }
    result.atividades_recentes = rows;
    completed++;
    tentarResponder();
  });
});

// Rota para listar voluntários (apenas admin e gerente)
app.get("/voluntarios", autenticar, autorizar(["admin", "gerente"]), (req, res) => {
  const query = "SELECT id, nome, email, nivel_acesso FROM usuarios WHERE nivel_acesso = 'voluntario'";
  executeQuery(query, [], res);
});

// Iniciar o servidor
app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});