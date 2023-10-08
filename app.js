const client = require("discord-rich-presence")("1155259326554980473");
const CSGOGSI = require("./index");

let gameStateTimer;
let presence;

const resetGameStateTimer = () => {
    clearTimeout(gameStateTimer);
    gameStateTimer = setTimeout(() => {
        presence = {
            details: "Waiting for game to start...",
            largeImageKey: "csgo",
            largeImageText: "CS:GO",
            startTimestamp: Date.now(),
        };
        client.updatePresence(presence);
    }, 3000);
};

const setMapInfo = (map) => {
    const gameMap = data["name"];
    const gameMode = data["mode"];
    const gamePhase = data["phase"];
    const gameRounds = data["round"] || 1;
    const ctScore = data["team_ct"]["score"] || 0;
    const tScore = data["team_t"]["score"] || 0;

    const details = `Playing on ${gameMap} (${gameMode})`;
    const state =
        gamePhase == "live"
            ? `CT ${ctScore} | ${tScore} T (${gameRounds} Round${
                  gameRounds === 1 ? "" : "s"
              })`
            : "CT 0 | 0 T";

    presence = {
        ...presence,
        details: details,
        state: state,
        largeImageKey: map,
        largeImageText: map,
    };
    client.updatePresence(presence);
};

client.on("connected", () => {
    resetGameStateTimer();
    new CSGOGSI()
        .on("gameUpdate", (map) => setMapInfo(map))
        .on("gameState", () => resetGameStateTimer());
});
