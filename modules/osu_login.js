const axios = require("axios");
const fs = require('fs');
const jwt_decode = require('jwt-decode');
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
        return response.data.access_token;
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

async function is_token_valid(token) {
if (token.exp < Math.floor(Date.now() / 1000)) {
    console.log("Access token expired, refreshing...");
    access_token = await osu_authorize();
    return access_token;
} else {
    console.log("Access token valid, no need to refresh.");
    return access_token;
}
}

let access_token;

module.exports.getToken = async () => {
    if (access_token !== undefined) {
        const token_decoded = jwt_decode(access_token);
        const a_token = await is_token_valid(token_decoded);
        return a_token;
    } else {
        console.log("Access token doesn't exist, creating new one...");
        access_token = await osu_authorize();
        return access_token;
    }
};

