const Joi = require("joi");
const City = require("./models/city");
const isAdmin = require("./middlewares/isAdmin");

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).required();

module.exports = (router) => {
  // Create a city
  router.post("/", isAdmin, async (req, res, next) => {
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        country: Joi.string().required(),
      }).required();
      const { name, country } = await schema.validateAsync(req.body);
      if (await City.exists({ name, country })) {
        next(new Error("City already exists"));
        return;
      }
      const newCity = await City.create({
        name,
        country,
      });
      res.status(201).send(newCity);
    } catch (error) {
      next(error);
    }
  });

  // Get all cities
  router.get("/", async (req, res, next) => {
    try {
      if (req.query.name) {
        const cities = await City.find({
          $or: [
            { name: { $regex: req.query.name, $options: "i" } },
            { country: { $regex: req.query.name, $options: "i" } },
          ],
        });
        res.send(cities);
        return;
      }
      const cities = await City.find();
      res.send(cities);
    } catch (error) {
      next(error);
    }
  });

  // Get a city by id
  router.get("/:id", async (req, res, next) => {
    try {
      res.send(await City.findById(req.params.id).lean());
    } catch (error) {
      next(error);
    }
  });

  return router;
};
