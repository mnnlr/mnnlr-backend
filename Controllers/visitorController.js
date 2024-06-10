import Visitor from "../Models/visitorSchema.js";

export const createVisitor = async (req, res) => {
  try {
    const { ip, city, region, country_name } = req.body;

    const visitor = await Visitor.create({
      ip,
      city,
      region,
      country_name,
    });

    res.status(201).json({
      success: true,
      visitor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getuserDatails = async (req, res) => {
  try {
    const ipResponse = await axios.get("https://ipapi.co/json");
    res.json(ipResponse.data);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
