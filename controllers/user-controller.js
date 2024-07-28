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
            bcrypt.hash(req.body.password, 10, (errB, hash) => {
              if (errB) {
                return res.status(500).send({ error: errB });
              }
              conn.query(
                `INSERT INTO usuarios (email,nome,password) VALUES (?,?,?)`,
                [req.body.email,req.body.name,hash],
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
                      name: req.body.nome,
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
        bcrypt.compare(req.body.password, results[0].password, (errb, result) => {
          if (errb) {
            return res.status(500).send({ error: errb });
          }
          if (result) {
            const token = jwt.sign(
              {
                id_user: results[0].id_usuario,
                email: results[0].email,
                name: results[0].nome,
              },
              process.env.JWT_KEY,
              {
                expiresIn: "1h",
              }
            );
            return res.status(200).send({ mensage: "Authentication succes", token: token,});
          }
          return res.status(401).send({ mensage: "Authentication failure" });
        });
      });
    });
  }

exports.getUserProfile = (req, res, next) => {
  mysql.getConnection((err, conn) => {
    if (err) {
      return res.status(500).send({ error: err });
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const userId = decoded.id_user;
      const query = `SELECT id_usuario, email, nome FROM usuarios WHERE id_usuario = ?`;
      conn.query(query, [userId], (error, results, fields) => {
        conn.release();
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (results.length < 1) {
          return res.status(404).send({ message: "User not found" });
        }
        return res.status(200).send({
          id: results[0].id_usuario,
          email: results[0].email,
          name: results[0].nome
        });
      });
    } catch (error) {
      return res.status(401).send({ message: "Invalid token" });
    }
  });
}

  