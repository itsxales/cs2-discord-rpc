const client = require('discord-rich-presence')('1155259326554980473');
const fs = require("fs");
const CSGOGSI = require("./index");
let gsi = new CSGOGSI({
    port: 3000,
    authToken: []
});

let presence = {
    details: 'Waiting for game to start',
    state: '...',
    largeImageKey: 'csgo',
    largeImageText: 'CS:GO',
    startTimestamp: Date.now(),
}
client.updatePresence(presence);

gsi.on("gameMap", (map) => {
    presence = {
        ...presence,
        details: 'Playing on ' + map + ` (${gsi.gameMode})`,
        state: `CT 0 | 0 T`,
        largeImageKey: map,
        largeImageText: map,
    };
    client.updatePresence(presence);
});

gsi.on("gamePhase", (phase) => {
    if (phase === "live") {
        presence = {
            ...presence,
            state: `CT ${gsi.ctScore} | ${gsi.tScore} T (${gsi.gameRounds} Round${gsi.gameRounds === 1 ? '' : 's'})`,
        };
        client.updatePresence(presence);
    }
});

let phaseTimer;
const resetGamePhaseTimer = () => {
    clearTimeout(phaseTimer);
    phaseTimer = setTimeout(() => {
        presence = {
            details: 'Waiting for game to start',
            state: '...',
            largeImageKey: 'csgo',
            largeImageText: 'CS:GO',
            startTimestamp: Date.now(),
        }
        client.updatePresence(presence);
    }, 3000);
};

gsi.on("gamePhase", (phase) => {
    resetGamePhaseTimer();
});
resetGamePhaseTimer();
