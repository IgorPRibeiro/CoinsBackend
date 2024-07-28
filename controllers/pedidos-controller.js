const mysql = require("../mysql").pool;

exports.getPedidos = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      `SELECT 
          pedidos.id_pedido, pedidos.quantidade,produtos.id_produto, 
          produtos.nome, produtos.preco  
          FROM pedidos INNER JOIN produtos 
          ON produtos.id_produto = pedidos.id_produto
      `,
      (err, result, fields) => {
        if (err) {
          return res.status(500).send({ error: error });
        }
        const response = {
          pedido: result.map((order) => ({
            id_order: order.id_pedido,

            quantity: order.quantidade,
            product: {
              id_product: order.id_produto,
              name: order.nome,
              price: order.preco,
            },
            request: {
              type: "GET",
              description: "Order details",
              url: "http://localhost:3000/pedidos/" + order.id_pedido,
            },
          })),
        };

        return res.status(200).send(response);
      }
    );
  });
};

exports.postPedidos = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM produtos WHERE id_produto = ?",
      [req.body.id_produto],
      (err, result, field) => {
        if (result.length == 0) {
          return res.status(404).send({
            mensagem: "Not find a product with this ID",
          });
        }
        conn.query(
          "INSERT INTO pedidos (id_produto,quantidade) VALUES (?,?);",
          [req.body.id_produto, req.body.quantidade],
          (err, result, field) => {
            conn.release();
            if (err) {
              return res.status(500).send({ error: error });
            }
            const response = {
              mensage: "Order created with succes",
              createdProduct: {
                id_order: result.id_pedido,
                id_product: req.body.id_produto,
                quantity: req.body.quantidade,
                request: {
                  type: "POST",
                  description: "Consult all order",
                  url: "http://localhost:3000/pedidos/",
                },
              },
            };
            res.status(201).send(response);
          }
        );
      }
    );
  });
};

exports.getUmPedido = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(
      "SELECT * FROM pedidos WHERE id_pedido = ?",
      [req.params.id_pedido],
      (err, result, fields) => {
        if (error) {
          return res.status(500).send({ error: error });
        }
        if (result.length == 0) {
          return res.status(404).send({
            mensagem: "Not find a order with this ID",
          });
        }
        const response = {
          mensage: "Order",
          order: {
            id_product: result[0].id_produto,
            id_order: result[0].id_pedido,
            quantity: result[0].quantidade,
            request: {
              type: "GET",
              description: "Return all orders",
              url: "http://localhost:3000/pedidos/",
            },
          },
        };
        return res.status(200).send(response);
      }
    );
  });
};

exports.patchPedido = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      `UPDATE pedidos
          SET quantidade = ?,
              id_produto = ?
          WHERE id_pedido = ?
        `,
      [req.body.quantidade, req.body.id_produto, req.body.id_pedido],
      (error, result, field) => {
        // liberar connection
        conn.release();

        if (error) {
          return res.status(500).send({ error: error });
        }

        const response = {
          mensage: "Order update with succes",
          product: {
            id_product: req.body.id_produto,
            id_pedido: req.body.id_pedido,
            quantidade: req.body.quantidade,
            request: {
              type: "POST",
              description: "Get detail order",
              url: "http://localhost:3000/pedidos/" + req.body.id_pedido,
            },
          },
        };

        res.status(202).send(response);
      }
    );
  });
};

exports.deletePedido = (req, res, next) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "DELETE FROM pedidos WHERE id_pedido = ?",
      [req.body.id_pedido],
      (err, result, field) => {
        conn.release();
        if (err) {
          return res.status(500).send({ error: error });
        }

        const response = {
          mensage: "Order removed with succes",
          product: {
            message: "Order removed",
            request: {
              type: "POST",
              description: "Create new order",
              url: "http://localhost:3000/pedidos/",
              body: {
                id_product: "String",
                quantity: "number",
              },
            },
          },
        };
        res.status(202).send(response);
      }
    );
  });
};
