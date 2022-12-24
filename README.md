
# osu! Now Playing bot - osu!dnp

This tool allows you to track maps that you've played them during your osu! session! It's made purely with osu! API v2!

So how does it work? It's simple, the bot will check your recent plays every 8 seconds and if it finds a new play, it will send it to your dedicated Discord channel!

Join the official Discord server if you want to watch your plays: https://discord.com/invite/APmh25WagY

## Usage

To start watching your recent plays, simply type `/watch` in #bot-commands (on my server above) and enter your ID beside the command (find the id here: https://osu.ppy.sh/users/<ID>). The bot will start watching your recent plays and will send them to your Discord channel.

**DISCLAIMER**:
The bot will **NEVER** collect any of your data, the app is only required for the bot to read the profile and recent activity (such as your recent plays), nothing else!
## Limitations

The bot is relatively new and it's still in development, so there are some limitations:

- The bot cannot remove your plays from the channel, so if you want to stop watching your plays, you have to ping me to remove it for you. That's because the bot doesn't yet have the ability to do that.

## Self-hosting

If you want to host the bot yourself, you can follow the instructions below. I don't recommend self-hosting the bot, because it's not stable yet and it's not optimized for self-hosting. Heads up, you will need to supply a temporary access token, otherwise the bot will not work.
## Perequisites

- <kbd>Node</kbd> (required, obtain it here: https://nodejs.org/en/, LTS works fine, but you can use the latest version if you want)
- MongoDB (required, obtain it here: https://www.mongodb.com/try/download/community)
- <kbd>git</kbd> (optional, required only if you want to clone the project, obtain it here: https://git-scm.com/downloads)

## Installation

1. To get started, clone this project:

in CMD
```bash
  git clone https://github.com/DemsarMa/osu-dnp.git
```
Assuming you have your own MongoDB server, osu! application credentials and Discord bot token already available.

Make a new .env file in the root directory of the project and paste the following code:

```
DISCORD_TOKEN=<token>
OSU_CLIENT_ID=<Client ID>
OSU_CLIENT_SECRET=<Client Secret>
DISCORD_CATEGORY_ID=<category ID where the bot can create channels>
GUILD_ID=<your server ID>
APP_ID=<App ID of your Discord application>
MONGO_URI=<URI>
OSU_ACCESS_TOKEN=<dummy token mentioned earlier>
```

That's all, your bot should work now!

## Feedback

Have you found an issue? Report it by joining the server above or DM me on Discord: `MtkoGaming_TW#0001`

## Contributing

All contributions are more than welcome. To get started, open a Pull request.

## Authors

- [@DemsarMa](https://github.com/DemsarMa)
