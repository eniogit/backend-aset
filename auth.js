const Joi = require("joi");
const jose = require("jose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const signJwt = async (payload) => {
  const secret = new TextEncoder().encode(process.env.SECRET);
  const alg = "HS256";

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .sign(secret);
};

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).required();

module.exports = (router) => {
  router.post("/register", async (req, res, next) => {
    try {
      const { email, password } = await schema.validateAsync(req.body);
      if (await User.exists({ email })) {
        next(new Error("Email already exists"));
        return;
      }
      const newUser = await User.create({
        email,
        password: await hashPassword(password),
      });
      console.log("User created");

      res.status(201).send(
        await signJwt({
          email,
          id: newUser._id,
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = await schema.validateAsync(req.body);
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).send("Invalid email or password");
        return;
      }
      if (!(await comparePasswords(password, user.password))) {
        res.status(401).send("Invalid email or password");
        return;
      }
      res.send(
        await signJwt({
          email,
          id: user._id,
          isAdmin: user.isAdmin,
        })
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
};
