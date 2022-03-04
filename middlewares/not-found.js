const notFound = (req, res) => {
  return res.status(404).json({ msg: "The requested page does not exist." });
};

module.exports = notFound;
