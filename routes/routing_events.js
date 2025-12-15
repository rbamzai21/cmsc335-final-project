const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const axios = require("axios");

const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String
});

const Event = mongoose.model("Event", eventSchema);

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/new", (req, res) => {
  res.render("new");
});

router.post("/new", async (req, res) => {
  try {
    const { title, date, location } = req.body;
    await Event.create({ title, date, location });
    res.redirect("/events");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    const now = Date.now();
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;

    for (let evt of events) {
      const eventTime = new Date(evt.date).getTime();

      if (eventTime - now > FIVE_DAYS) {
        evt.weather = {
          error: "Weather forecast unavailable (over 5 days away)"
        };
        continue;
      }

      try {
        const forecastResponse = await axios.get(
          "https://api.openweathermap.org/data/2.5/forecast",
          {
            params: {
              q: evt.location.split(",")[0],
              units: "imperial",
              appid: process.env.WEATHER_API_KEY
            }
          }
        );

        let closestForecast = null;
        let smallestDiff = Infinity;

        for (let entry of forecastResponse.data.list) {
          const diff = Math.abs(entry.dt * 1000 - eventTime);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestForecast = entry;
          }
        }

        if (closestForecast) {
          evt.weather = {
            temp: closestForecast.main.temp,
            description: closestForecast.weather[0].description,
            date: closestForecast.dt_txt
          };
        } else {
          evt.weather = {
            error: "Weather forecast unavailable"
          };
        }
      } catch {
        evt.weather = {
          error: "Weather forecast unavailable"
        };
      }
    }

    res.render("events", { events });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading events");
  }
});





router.get("/clear", async (req, res) => {
  try {
    await Event.deleteMany({});
    res.render("clear");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

module.exports = router;
