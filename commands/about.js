const { Client, SlashCommandBuilder, Collection, ChannelType, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();


module.exports = {
    data: new SlashCommandBuilder()
      .setName("about")
      .setDescription("About the bot"),
    async execute(interaction) {
      const dc_channel = "<#" + process.env.ABOUT_CHANNEL + ">";
      if (!interaction.isChatInputCommand()) return;
  
      let row;
      if (interaction.commandName === "about") {
        row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("link")
              .setLabel("GitHub link")
              .setStyle(ButtonStyle.Link)
          );
      }
  
      const aboutme_embed = {
        color: 16711680,
        timestamp: new Date(),
        footer: {
          text: "osu!dnp"
        },
        author: {
          name: "Hi, I'm osu!dnp, the osu! Discord Now Playing bot!"
        },
        fields: [
          {
            name: "What is osu!dnp",
            value:
              "I was created by <@399633180661121034> to help you share your osu! gameplay with your friends on Discord.\n" +
              "I'm currently in development, so please be patient with me! :)"
          },
          {
            name: '"How do I use osu!dnp?"',
            value:
              "Simply head into " + dc_channel + " and type `/watch <osu! user ID>` to start watching a user's gameplay!"
          },
          {
            name: "Contributing",
            value:
              "If you have any suggestions, or bug reports, you can report them directly by clicking the button below!\n" +
              "Pull requests are also welcome!"
          }
        ]
      };
  
      await interaction.reply({ embeds: [aboutme_embed], components: [row] });
    }
  };
