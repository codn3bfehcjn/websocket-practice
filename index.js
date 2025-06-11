import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });


const rooms = {};

wss.on("connection", function (socket) {
    let currentroom = null;

    socket.on("message", (data) => {
        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            console.error("Invalid JSON:", data);
            return;
        }


        if (parsed.type === "join") {
            const { roomid } = parsed;
            currentroom = roomid;

            if (!rooms[roomid]) {
                rooms[roomid] = [];
            }
            rooms[roomid].push(socket)
        }

        if (parsed.type === "chat") {
            if (!currentroom || !rooms[currentroom]) return;
            rooms[currentroom].forEach(s => {
                if (s !== socket && s.readyState === s.OPEN) {
                    s.send(JSON.stringify({
                        type: "chat",
                        msg: parsed.message,
                        name:parsed.username
                    }));
                }
            });
        }
    });

    socket.on("close", () => {
        if (currentroom && rooms[currentroom]) {
            rooms[currentroom] = rooms[currentroom].filter(s => s !== socket);
            console.log(`Socket disconnected from room ${currentroom}`);
        }
    });
});
