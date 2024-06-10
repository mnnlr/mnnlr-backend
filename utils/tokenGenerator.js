import jwt from "jsonwebtoken";

export const createToken = async (id, email) => {
  let payload = {
    id,
    email,
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};
