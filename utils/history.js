const fs = require("fs");
const path = require("path");

const historyPath = path.join(__dirname, "..", "data", "history.json");

function init() {

    if (!fs.existsSync(historyPath)) {

        fs.mkdirSync(path.dirname(historyPath), {
            recursive: true
        });

        fs.writeFileSync(historyPath, "{}");
    }

}

function load() {

    init();

    return JSON.parse(
        fs.readFileSync(historyPath, "utf8")
    );

}

function save(data) {

    fs.writeFileSync(
        historyPath,
        JSON.stringify(data, null, 4)
    );

}

function getUserHistory(guildId, userId) {

    const data = load();

    return data[guildId]?.[userId] || [];

}

function addMessage(guildId, userId, role, text) {

    const data = load();

    if (!data[guildId])
        data[guildId] = {};

    if (!data[guildId][userId])
        data[guildId][userId] = [];

    data[guildId][userId].push({
        role,
        text,
        timestamp: Date.now()
    });

    while (data[guildId][userId].length > 20) {
        data[guildId][userId].shift();
    }

    save(data);

}

function clearHistory(guildId, userId) {

    const data = load();

    if (data[guildId]?.[userId]) {

        delete data[guildId][userId];

        save(data);

    }

}

module.exports = {

    getUserHistory,
    addMessage,
    clearHistory

};