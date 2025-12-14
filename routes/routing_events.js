const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/new", (req, res) => {
  res.render("new");
});

router.get("/events", (req, res) => {
  res.render("events");
});

router.get("/clear", (req, res) => {
  res.render("clear");
});

module.exports = router;
