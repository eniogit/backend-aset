const jose = require("jose");

const verifyJwt = async (token) => {
  const secret = new TextEncoder().encode(process.env.SECRET);

  return await jose.jwtVerify(token, secret);
};

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("Unauthorized");
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }
  try {
    const payload = await verifyJwt(token);
    req.user = payload.payload;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};
