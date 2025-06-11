import { use } from "react";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });


const rooms = {};

wss.on("connection", function (socket) {
    let currentroom = null;

    socket.on("message", (data) => {
        let parsed;
        try {
            parsed = JSON.parse(data); //string to object change kar rahe hai
        } catch (e) {
            console.error("Invalid JSON:", data);
            return;
        }


        if (parsed.type === "join") {
            const {username, roomid } = parsed;
            currentroom = roomid;

            if (!rooms[roomid]) {  //iska matlab rooms object mein roomid ka current value ka koi key hai nahi hai to make a entry in room object with key as roomid and value as empty array
                rooms[roomid] = [];
            } 
            rooms[roomid].push(socket)//rooms obj mein roomid jo naya key ki entry hui hai us key ke value mein jo array hai usme push kar do current socket (meaning jo naya user connect hua hai)
            socket.send(JSON.stringify({type:"notification",notify:`${username} joined room ${roomid}`}))
        }

        if (parsed.type === "chat") {
            if (!currentroom || !rooms[currentroom]) return;
            rooms[currentroom].forEach(s => {
                if (s !== socket && s.readyState === s.OPEN) {  //same user ko msg nahi jaye 
                    s.send(JSON.stringify({ //object to string
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
