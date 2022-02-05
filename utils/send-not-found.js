//
const itemNotFound = (res, type, id) =>
  res.status(400).json({ msg: `${type} doesn't exist with id '${id}'.` });

module.exports = itemNotFound;
