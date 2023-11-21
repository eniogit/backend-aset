const Joi = require("joi");
const mongoose = require("mongoose");
const Trip = require("./models/trip");
const Ticket = require("./models/ticket");
const isUser = require("./middlewares/isUser");

module.exports = (router) => {
  // Get user's tickets
  router.get("/", isUser, async (req, res, next) => {
    try {
      res.json(await Ticket.find({ passenger: req.user.id }));
    } catch (error) {
      next(error);
    }
  });

  // Create ticket
  router.post("/", isUser, async (req, res, next) => {
    try {
      const schema = Joi.object({
        trip: Joi.string().required(),
      }).required();
      const { trip: tripId } = await schema.validateAsync(req.body);
      const trips = await Trip.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(tripId),
            departure: {
              $gte: new Date(),
            },
          },
        },
        {
          $lookup: {
            from: "tickets",
            localField: "_id",
            foreignField: "trip",
            as: "tickets",
          },
        },
        {
          $project: {
            _id: 1,
            seats: 1,
            tickets: 1,
            availableSeats: {
              $subtract: ["$seats", { $size: "$tickets" }],
            },
          },
        },
        {
          $match: {
            availableSeats: { $gt: 0 },
          },
        },
      ]);
      if (trips.length === 0) {
        res.status(404).send("Trip not found");
        return;
      }
      if (trips[0].availableSeats === 0) {
        res.status(400).send("No seats available");
        return;
      }
      res.json(await Ticket.create({ trip: tripId, passenger: req.user.id, seat: trips[0].availableSeats }));
    } catch (error) {
      next(error);
    }
  });

  return router;
};
