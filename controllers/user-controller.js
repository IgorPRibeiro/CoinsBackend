const mysql = require("../mysql").pool;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.signUp = (req, res, next) => {
    mysql.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({ error: error });
      }
      conn.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [req.body.email],
        (err, results) => {
          if (err) {
            return res.status(500).send({ error: err });
          }
          if (results.length > 0) {
            // 409 CONFLICT
            res.status(409).send({ mensage: "Alredy registered users " });
          } else {
            bcrypt.hash(req.body.senha, 10, (errB, hash) => {
              if (errB) {
                return res.status(500).send({ error: errB });
              }
              conn.query(
                `INSERT INTO usuarios (email,senha) VALUES (?,?)`,
                [req.body.email, hash],
                (error, results) => {
                  conn.release();
                  if (error) {
                    return res.status(500).send({ error: error });
                  }
                  const response = {
                    mensagem: "User created",
                    usuarioCriado: {
                      id_usuarios: results.insertId,
                      email: req.body.email,
                    },
                  };
                  return res.status(201).send(response);
                }
              );
            });
          }
        }
      );
    });
}

exports.login = (req, res, next) => {
    mysql.getConnection((err, conn) => {
      if (err) {
        return res.status(500).send({ error: err });
      }
  
      const query = `SELECT * FROM usuarios WHERE email = ?`;
      conn.query(query, [req.body.email], (error, results, fields) => {
        conn.release();
        if (error) {
          return res.status(500).send({ error: error });
        }
        // nao atorizado
        if (results.length < 1) {
          return res.status(401).send("Authentication failure");
        }
        bcrypt.compare(req.body.senha, results[0].senha, (errb, result) => {
          if (errb) {
            return res.status(500).send({ error: errb });
          }
          if (result) {
            const token = jwt.sign(
              {
                id_user: results[0].id_usuario,
                email: results[0].email,
              },
              process.env.JWT_KEY,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).send({ mensage: "Authentication succes", token: token});
          }
          return res.status(401).send({ mensage: "Authentication failure" });
        });
      });
    });
  }