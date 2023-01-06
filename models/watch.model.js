const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const model = mongoose.model;

const watchSchema = new Schema({
  osu_id: String,
  watch_channel: String,
  osu_score_db: String,
  osu_user: String,
  discord_user: String,
});

const watchModel = model("Watch", watchSchema);

module.exports = { watchModel };
