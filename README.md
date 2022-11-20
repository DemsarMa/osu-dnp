
# osu! Now Playing bot - osu!dnp

This tool allows you to track maps that you've played them during your osu! session! It's made purely with osu! API v2!

## Perequisites

- <kbd>Node</kbd> (required, obtain it here: https://nodejs.org/en/)
- <kbd>git</kbd> (optional)

## Installation

1. To get started, clone this project:

in CMD
```bash
  git clone https://github.com/DemsarMa/osu-dnp.git
```
or download it directly by clicking "Code" and then "Download ZIP"

2. Head over to https://osu.ppy.sh/home/account/edit and click "New OAuth application". Enter the name of the app whatever you like, "Application Callback URL" should be "http://localhost", then click "Register application".
This will create a new application for your bot to access your profile. Take notes of your Client ID and Client Secret (while not sharing it).

**DISCLAIMER**:
The bot will **NEVER** collect any of your data, the app is only required for the bot to read the profile and recent activity (such as your recent plays), nothing else!

3. Head over to https://discord.com/developers/applications and register a new application. You can follow this guide on how to create and invite the bot: https://discordpy.readthedocs.io/en/stable/discord.html

4. Enable Developer options in Discord settings (under Advanced) and copy the channel ID of your channel where you intend the bot to send your plays

5. Open the bot folder and create a new notepad file and enter the required credentials:

```
DISCORD_TOKEN=<token from step 3>
OSU_CLIENT_ID=<Client ID from step 2>
OSU_CLIENT_SECRET=<Client Secret from step 2>
OSU_USER_ID=<your user ID (https://osu.ppy.sh/users/<ID>
DISCORD_CHANNEL_ID=<channel ID from step 4>
```
Save the file as <kbd>.env</kbd>, type of the file should be All files (so Windows doesn't save it as .txt).

That's all, your bot should work now!

## Usage

Simply run <kbd>run.bat</kbd> to start the bot!

## Feedback

Have you found an issue? Report it by DMing me on Discord: `MtkoGaming_TW#0001`

## Contributing

All contributions are more than welcome. To get started, open a Pull request.

## Authors

- [@DemsarMa](https://github.com/DemsarMa)
