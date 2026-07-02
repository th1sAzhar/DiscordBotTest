require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    PermissionFlagsBits
} = require("discord.js");

const {
    askAI
} = require("./utils/ai");

const {
    getGuild,
    setGuildChannel
} = require("./utils/guildConfig");

const {
    getUserHistory,
    addMessage,
    clearHistory
} = require("./utils/history");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log(`✅ Login sebagai ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    // ==========================
    // Setup AI Channel
    // ==========================

    if (message.content === "!setup-ai") {

        if (
            !message.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return message.reply(
                "❌ Hanya Administrator yang dapat menggunakan command ini."
            );
        }

        setGuildChannel(
            message.guild.id,
            message.channel.id
        );

        return message.reply(
            `✅ AI Channel berhasil disimpan.\nSekarang aku hanya akan merespon di ${message.channel}.`
        );
    }

    // ==========================
    // Reset History
    // ==========================

    if (message.content === "!reset-ai") {

        clearHistory(
            message.guild.id,
            message.author.id
        );

        return message.reply(
            "🧹 Riwayat percakapan kamu berhasil dihapus."
        );
    }

    // ==========================
    // Cek Channel AI
    // ==========================

    const guildConfig = getGuild(message.guild.id);

    if (!guildConfig) return;

    if (guildConfig.channelId !== message.channel.id)
        return;

    // ==========================
    // Harus Mention Bot
    // ==========================

    if (!message.mentions.has(client.user))
        return;

    const prompt = message.content
        .replace(`<@${client.user.id}>`, "")
        .replace(`<@!${client.user.id}>`, "")
        .trim();

    if (!prompt) {

        return message.reply(
            "Halo 👋 Ada yang ingin ditanyakan?"
        );

    }

    try {

        await message.channel.sendTyping();

        const history = getUserHistory(
            message.guild.id,
            message.author.id
        );

        // Simpan pesan user
        addMessage(
            message.guild.id,
            message.author.id,
            "user",
            prompt
        );

        // Tanya AI
        const reply = await askAI(
            prompt,
            history
        );

        // Simpan jawaban AI
        addMessage(
            message.guild.id,
            message.author.id,
            "assistant",
            reply
        );

        await message.reply(reply);

    } catch (err) {

        console.error(err);

        message.reply(
            "⚠️ Terjadi kesalahan saat menghubungi AI."
        );

    }

});

client.login(process.env.DISCORD_TOKEN);