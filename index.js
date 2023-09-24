const http = require("http");
const EventEmitter = require("events");

class CSGOGSI extends EventEmitter {
    constructor({ port = 3000, authToken = [] }) {
        super();
        let tokens = authToken;
        if (!Array.isArray(tokens)) {
            tokens = [];
        }

        this.authToken = tokens;
        this.app = http.createServer((req, res) => {
            if (req.method !== "POST") {
                res.writeHead(404, { "Content-Type": "text/plain" });
                return res.end("404 Not Found");
            }

            let body = "";
            req.on("data", data => {
                body += data;
            });

            req.on("end", () => {
                this.processJson(body);
                return res.writeHead(200).end();
            });
        });

        this.bombTime = 40;
        this.isBombPlanted = false;
        this.bombTimer = null;
        this.server = this.app.listen({ port }, () => {
            let addr = this.server.address();
            console.log(`[@] CSGO GSI server listening on ${addr.address}:${addr.port}`);
        });
    }

    processJson(json) {
        try {
            let data = JSON.parse(json);
            if (!this.isAuthenticated(data)) return;
            this.emit("all", data);
            this.process(data);
        } catch (error) { }
    }

    isAuthenticated(data) {
        return this.authToken.length < 1 || (data["auth"]["token"] && this.authToken.length > 0 && this.authToken.includes(data["auth"]["token"]))
    }



    process(data) {
        if (data["map"]) {
            this.emit("gameMap", data["map"]["name"]);
            this.emit("gameMode", data["map"]["mode"])
            this.emit("gamePhase", data["map"]["phase"]); //warmup etc
            this.emit("gameRounds", data["map"]["round"]);
            this.emit("gameCTscore", data["map"]["team_ct"]["score"]);
            this.emit("gameTscore", data["map"]["team_t"]["score"]);
            this.gameMap = data["map"]["name"];
            this.gameMode = data["map"]["mode"];
            this.gamePhase = data["map"]["phase"];
            this.gameRounds = data["map"]["round"];
            this.ctScore = data["map"]["team_ct"]["score"];
            this.tScore = data["map"]["team_t"]["score"];
        }

        if (data["round_wins"]) {
            this.emit("roundWins", data["round_wins"]);
        }

        if (data["player"]) {
            this.emit("player", data["player"]);
        }

        if (data["round"]) {
            this.emit("roundPhase", data["round"]["phase"]);
            switch (data["round"]["phase"]) {
                case "live":
                    break;
                case "freezetime":
                    break;
                case "over":
                    this.emit("roundWinTeam", data["round"]["win_team"]);
                    break;
            }

        }
    }
}

module.exports = CSGOGSI;