require('dotenv').config();
const mysql = require('mysql2');

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Erro de conexão com o banco de dados: ', err);
    return;
  }
  console.log('Conectado ao banco de dados');
});

module.exports = db;
