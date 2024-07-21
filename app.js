
const cors = require('cors');
const express = require("express");
const app = express();
app.use(cors()); 
const morgan = require("morgan");
const bodyParser = require("body-parser");
app.use(express.json());

const rotaProdutos = require("./routes/produtos");
const rotaPedidos = require("./routes/pedidos");
const rotaUser = require("./routes/usuarios");

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Header",
    "Content-Type",
    "Origin",
    "X-Requested-With",
    "Accept",
    "Authorization"
  );

  if (req.method == "Option") {
    res.header('Access-Control-Allow-Methods', 'POST', 'GET', 'PUT','PATCH','DELETE', 'GET')
    return res.status(200).send({})
  }
  next()
});

app.use("/produtos", rotaProdutos);
app.use("/pedidos", rotaPedidos);
app.use("/users", rotaUser);


app.use((req, res, next) => {
  const erro = new Error("Not fount");
  erro.status = 404;
  next(erro);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  return res.send({
    erro: {
      mensagem: error.message,
    },
  });
});

module.exports = app;
