const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const login = require("../middleware/login")

const ProdutosController = require("../controllers/produtos-controller")



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const sanitizedFileName =
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname;
    cb(null, sanitizedFileName);
  },
});

const fileFiler = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFiler,
});

router.get("/",ProdutosController.getProdutos);

router.post("/",login.obrigatorio, upload.single("product_image"), ProdutosController.postProduto);

router.get("/:id_produto", ProdutosController.getByIdProduct);

router.patch("/",login.obrigatorio,  ProdutosController.updateProduct);

router.delete("/", login.obrigatorio , ProdutosController.deleteProduct);

module.exports = router;
