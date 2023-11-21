const Joi = require("joi");
const Trip = require("./models/trip");
const isAdmin = require("./middlewares/isAdmin");
const { default: mongoose } = require("mongoose");

module.exports = (router) => {
  // Create trip
  router.post("/", isAdmin, async (req, res, next) => {
    try {
      const schema = Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        departure: Joi.date().required(),
        arrival: Joi.date().required(),
        price: Joi.number().required(),
        seats: Joi.number().required(),
      }).required();
      const trip = await schema.validateAsync(req.body);
      res.json(await Trip.create(trip));
    } catch (error) {
      next(error);
    }
  });

  // Get all trips
  router.get("/", async (req, res, next) => {
    try {
      const query = [];
      if (req.query.from) {
        query.push({
          $match: {
            from: new mongoose.Types.ObjectId(req.query.from),
          },
        });
      }
      if (req.query.to) {
        query.push({
          $match: {
            to: new mongoose.Types.ObjectId(req.query.to),
          },
        });
      }
      if (req.query.departure) {
        query.push({
          $match: {
            departure: {
              $gte: new Date(req.query.departure),
            },
          },
        });
      }
      const trips = await Trip.aggregate(
        query.concat([
          {
            $lookup: {
              from: "cities",
              localField: "from",
              foreignField: "_id",
              as: "from",
            },
          },
          {
            $unwind: {
              path: "$from",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $lookup: {
              from: "cities",
              localField: "to",
              foreignField: "_id",
              as: "to",
            },
          },
          {
            $unwind: {
              path: "$to",
              preserveNullAndEmptyArrays: false,
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
            $addFields: {
              seatsLeft: { $subtract: ["$seats", { $size: "$tickets" }] },
            },
          },
          {
            $match: {
              seatsLeft: { $gt: 0 },
            },
          },
        ])
      );
      res.json(trips);
    } catch (error) {
      next(error);
    }
  });

  // Get trip by id
  router.get("/:id", async (req, res, next) => {
    try {
      const trip = await Trip.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        {
          $lookup: {
            from: "cities",
            localField: "from",
            foreignField: "_id",
            as: "from",
          },
        },
        {
          $unwind: {
            path: "$from",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "cities",
            localField: "to",
            foreignField: "_id",
            as: "to",
          },
        },
        {
          $unwind: {
            path: "$to",
            preserveNullAndEmptyArrays: false,
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
          $addFields: {
            seatsLeft: { $subtract: ["$seats", { $size: "$tickets" }] },
          },
        },
      ]);
      res.json(trip[0]);
    } catch (error) {
      next(error);
    }
  });

  // Search trips
  router.get("/search/:from/:to/:departure", async (req, res, next) => {
    try {
      const trips = await Trip.aggregate([
        {
          $match: {
            from: new mongoose.Types.ObjectId(req.params.from),
            to: new mongoose.Types.ObjectId(req.params.to),
            departure: new Date(req.params.departure),
          },
        },
        {
          $lookup: {
            from: "cities",
            localField: "from",
            foreignField: "_id",
            as: "from",
          },
        },
        {
          $unwind: {
            path: "$from",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "cities",
            localField: "to",
            foreignField: "_id",
            as: "to",
          },
        },
        {
          $unwind: {
            path: "$to",
            preserveNullAndEmptyArrays: false,
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
          $addFields: {
            seatsLeft: { $subtract: ["$seats", { $size: "$tickets" }] },
          },
        },
      ]);
      res.json(trips);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
