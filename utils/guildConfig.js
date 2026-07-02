const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "config", "guilds.json");

function init() {

    if (!fs.existsSync(configPath)) {

        fs.mkdirSync(path.dirname(configPath), {
            recursive: true
        });

        fs.writeFileSync(configPath, "{}");

    }

}

function load() {

    init();

    return JSON.parse(
        fs.readFileSync(configPath, "utf8")
    );

}

function save(data) {

    fs.writeFileSync(
        configPath,
        JSON.stringify(data, null, 4)
    );

}

function setGuildChannel(guildId, channelId) {

    const data = load();

    data[guildId] = {
        channelId
    };

    save(data);

}

function getGuild(guildId) {

    const data = load();

    return data[guildId] || null;

}

function removeGuild(guildId) {

    const data = load();

    delete data[guildId];

    save(data);

}

module.exports = {

    getGuild,
    setGuildChannel,
    removeGuild

};