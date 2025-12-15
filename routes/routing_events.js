const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  date: { type: Date, required: true}
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

router.get("/", async(req, res) => {
  res.render("index");
});

router.get("/new", (req, res) => {
  res.render("new");
});

router.post("/new", async (req, res) => {
  try {
    const { name, date } = req.body;
    const newEvent = new Event({ name, date });
    await newEvent.save();
  } catch {
    res.status(400).send(err.message);
  }
});

router.get("/events", async(req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.render("events", { events });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post("/clear", async (req, res) => {
  res.render("clear");
  try {
    await Event.deleteMany({});res
  } catch {
    res.status(500).send(err.message);
  }
});

module.exports = router;
