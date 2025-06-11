import React, { useEffect, useRef, useState } from "react";


export default function App() {
    const [roomid, setroomid] = useState()
    const [ws, setws] = useState()
    const [f, setf] = useState(true)
    const roomidref = useRef()
    const [name,setname] = useState()

    function catchname(e){
        setname(e.target.value)
    }
    function createroom() {
        let str = "3reh2338482bg54893gtbgf201r9h75hfb4gw8q38942r4hf"
        let id = "";
        for (let index = 0; index < 5; index++) {
            id += str[Math.floor(Math.random() * str.length)]
        }
        setroomid(id)
        roomidref.current.value = id
    }

    function joinroom() {
        setf(false)
        let enteredroomid = roomidref.current.value
        const roominfo = {
            type: "join",
            username: name,
            roomid: enteredroomid
        }

        if (!name) {
            alert("please enter your name")
            return
        }
        const ws = new WebSocket("ws://localhost:8080")
        setws(ws)
        ws.onopen = () => {
            ws.send(JSON.stringify(roominfo))
        }
        ws.onerror = (e) => {
            console.log("error", e);
        }
        ws.onmessage = (e) => {
            console.log("messgae from server", e.data);

        }
    }
    return (
        <>
            {f ? (<div>
                <input type="text" placeholder="enter name" onChange={catchname} />
                <button onClick={createroom}>create room</button><br />
                <input type="text" placeholder="enter room id" ref={roomidref} />
                <button onClick={joinroom}>join room</button>
            </div>) : <Room ws={ws} name={name} />}
        </>
    )
}


function Room({ws}) {
    const msgref = useRef()
    const [message, setmessages] = useState([])
    function sendmessage() {
        let msg = msgref.current.value
        const chatinfo = {
            type: "chat",
            message: msg
        }
        ws.send(JSON.stringify(chatinfo))
        setmessages((prev) => [...prev, `you:-${msg}`])
        msgref.current.value = ""
    }
    useEffect(() => {
        if (!ws) return;

        const handler = (e) => {
            const parsed = JSON.parse(e.data);
            if (parsed.type === "chat") {
                setmessages(prev => [...prev, parsed.msg]);
            }
        };

        ws.addEventListener("message", handler);

        return () => ws.removeEventListener("message", handler);
    }, [ws]);

    return (
        <>
            <div>
                <input type="text" placeholder="enter your message" ref={msgref} />
                <button onClick={sendmessage} >send</button>
                <div>
                    {message.map((m, i) =>
                        <p key={i}>{m}</p>
                    )}
                </div>
            </div>
        </>
    )
}