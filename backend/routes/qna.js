const express = require("express");
const router = express.Router();

const { createQuestion } = require("../controllers/qna");
const { auth } = require("../middleware/auth");

router.post("/", auth, createQuestion);

module.exports = router;

