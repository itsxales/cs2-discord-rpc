const http = require("http");
const EventEmitter = require("events");

class CSGOGSI extends EventEmitter {
    constructor(port = 3000, authToken = []) {
        super();

        this.authToken = Array.isArray(authToken) ? authToken : [];
        this.app = this.createServer();
        this.app.listen({ port }, () => {
            const addr = this.app.address();
            console.info(
                `[@] CS2 GSI server listening on ${addr.address}:${addr.port}`
            );
        });
    }

    createServer() {
        return http.createServer((req, res) => {
            if (req.method !== "POST") {
                return res.writeHead(405).end();
            }

            let body = "";
            req.on("data", (data) => {
                body += data;
            });

            req.on("end", () => {
                try {
                    this.processJson(body);
                    res.writeHead(200).end();
                } catch (e) {
                    console.error("Error processing JSON:", e);
                    res.writeHead(500).end();
                }
            });
        });
    }

    processJson(json) {
        const data = JSON.parse(json);
        if (!this.isAuthenticated(data)) return;
        this.process(data);
    }

    isAuthenticated(data) {
        return (
            this.authToken.length < 1 ||
            (data["auth"]["token"] &&
                this.authToken.length > 0 &&
                this.authToken.includes(data["auth"]["token"]))
        );
    }

    process(data) {
        if (!data["round"]) {
            this.emit("gameState");
        } else if (data["map"]) {
            this.emit("gameUpdate", data["map"]);
        }
    }
}

module.exports = CSGOGSI;