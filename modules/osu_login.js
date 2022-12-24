const axios = require("axios");
const fs = require('fs');
const dotenv = require("dotenv");
dotenv.config();
const osuid = process.env.OSU_CLIENT_ID;
const osusecret = process.env.OSU_CLIENT_SECRET;

async function osu_authorize() {
    console.log("osu! API authorization started.");
    try {
        const response = await axios.post("https://osu.ppy.sh/oauth/token", {
            client_id: osuid,
            client_secret: osusecret,
            grant_type: "client_credentials",
            scope: "public",
        });
        console.log("osu! API authorization successful.");
        process.env.OSU_ACCESS_TOKEN = response.data.access_token;
    } catch (error) {
        if (error.response.status === 401) {
            console.log("osu! API authorization failed.");
        } else if (error.response.status === 429) {
            console.log("Too many requests, blame osu!");
        } else if (error.response.status === 500) {
            console.log("Internal server error on osu!");
        } else {
            console.log("Unknown error, osu!dnp osu_authorize", error);
        }
    }
}

module.exports = { osu_authorize };
