const express = require("express");
const mysql = require("../mysql").pool;
exports.getProdutos = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query("SELECT * FROM produtos;", (error, result, fields) => {
      if (error) {
        return res.status(500).send({ error: error });
      }
      const response = {
        quantidade: result.length,
        produtos: result.map((prod) => ({
          id_produto: prod.id_produto,
          nome: prod.nome,
          preco: prod.preco,
          imagem_produto: prod.imagem_produto,
          request: {
            type: "GET",
            description: "Product details",
            url: "http://localhost:3000/produtos/" + prod.id_produto,
          },
        })),
      };
      return res.status(200).send(response);
    });
  });
};

exports.postProduto = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      console.log(error);
      return res.status(500).send({ error: error });
    }
  
    conn.query(
      "INSERT INTO produtos (nome,preco,image_product,quantidade) VALUES (?,?,?,?);",
      [req.body.name, req.body.price, req.file.path,req.body.quantity],
      (error, result, field) => {
        // liberar connection
        conn.release();

        if (error) {
          console.log(error);

          return res.status(500).send({ error: error });
        }

        const response = {
          mensage: "Produto inserido com sucesso",
          createdProduct: {
            id_product: result.id_produto,
            name: req.body.name,
            price:  req.body.price,
            image_produto: req.file.path,
            quantity: req.body.quantity,
            request: {
              type: "POST",
              description: "Create a new product",
              url: "http://localhost:3000/produtos/",
            },
          },
        };

        res.status(201).send(response);
      }
    );
  });
};

exports.getByIdProduct = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM produtos WHERE id_produto = ?;",
      [req.params.id_produto],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }

        if (result.length == 0) {
          return res.status(404).send({
            mensagem: "Not find a product with this ID",
          });
        }

        const response = {
          mensage: "Produto regastado com sucesso",
          product: {
            id_product: result[0].id_produto,
            nome: result[0].nome,
            preco: result[0].preco,
            imagem_produto: result[0].imagem_produto,
            request: {
              type: "GET",
              description: "Return all products",
              url: "http://localhost:3000/produtos/",
            },
          },
        };

        return res.status(200).send(response);
      }
    );
  });
};

exports.updateProduct = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      `UPDATE produtos
             SET nome = ?,
                 preco = ?,
                 imagem_produto = ?
             WHERE id_produto = ?`,
      [
        req.body.nome,
        req.body.preco,
        req.body.imagem_produto,
        req.body.id_produto,
      ],
      (error, result, field) => {
        // release connection
        conn.release();

        if (error) {
          return res.status(500).send({ error: error });
        }

        const response = {
          message: "Produto atualizado com sucesso",
          product: {
            id_product: req.body.id_produto,
            nome: req.body.nome,
            preco: req.body.preco,
            request: {
              type: "POST",
              description: "Update the product",
              url: "http://localhost:3000/produtos/" + req.body.id_produto,
            },
          },
        };

        res.status(202).send(response);
      }
    );
  });
};

exports.deleteProduct = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      `DELETE FROM produtos WHERE id_produto = ?`,
      [req.body.id_produto],
      (error, result, field) => {
        conn.release();

        if (error) {
          return res.status(500).send({ error: error });
        }

        const response = {
          mensage: "Product removed with succes!",
          product: {
            message: "Product removed",
            request: {
              type: "POST",
              description: "Create new product",
              url: "http://localhost:3000/produtos/",
              body: {
                nome: "String",
                preco: "number",
              },
            },
          },
        };

        res.status(202).send(response);
      }
    );
  });
};
