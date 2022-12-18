const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const watchSchema = new Schema({
  osu_id: String,
  watch_channel: String,
  osu_score: String,
});

const watchModel = model("Watch", watchSchema);

module.exports = { watchModel };
