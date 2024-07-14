const express = require("express");
const router = express.Router();
const mysql = require("../mysql").pool;
const bcrypt = require("bcrypt");

router.post("/cadastro", (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query('SELECT * FROM usuarios WHERE email = ?', [req.body.email], (err,results) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (results.length > 0) {
            // 409 CONFLICT
            res.status(409).send({mensage: 'Alredy registered users '})
        }else {
            bcrypt.hash(req.body.senha, 10, (errB, hash) => {
                if (errB) {
                  return res.status(500).send({ error: errB });
                }
                conn.query(
                  `INSERT INTO usuarios (email,senha) VALUES (?,?)`,
                  [req.body.email, hash],
                  (error, results) => {
                      conn.release()
                      if (error) {
                          return res.status(500).send({ error: error });
                      }
                      const response = {
                          mensagem: 'User created',
                          usuarioCriado: {
                              id_usuarios: results.insertId,
                              email: req.body.email
                          }
                      }
                      return res.status(201).send(response)
                  }
                );
              });
        }
    })
  
  });
});

module.exports = router;
