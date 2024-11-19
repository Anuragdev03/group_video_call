import { useState, useRef, createContext, ReactNode, useEffect } from "react";
import { io } from "socket.io-client";


const socket = io("http://localhost:8000");

const SocketContext = createContext({});

const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" }
];


const ContextProvider = ({ children }: { children: ReactNode }) => {
    const [stream, setStream] = useState<MediaStream | null>();
    const [name, setName] = useState("");
    const [call, setCall] = useState<any>({});
    const [me, setMe] = useState("");

    const [peers,setPeers] = useState<any[]>([]);

    const myVideo = useRef<any>();
    const peersRef = useRef<any[]>([]);

    async function initialiseRtc(roomName: string, userName: string) {
       await navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo?.current) {
                    myVideo.current.srcObject = currentStream
                }
                joinRoom(roomName, userName, currentStream)
            })
    }

    function stopCamera() {
        if (stream)
            stream.getTracks().forEach(function (track) {
                track.stop();
            });
        setStream(null)
    }

    function joinRoom(roomName: string, userName: string, stream: MediaStream) {
        try {
            socket.emit("join-room", roomName, userName);
            console.log(roomName, userName)
            socket.on("all users", (users:any[]) => {
                const peers:any = [];
                console.log(users, "users")
                users.forEach((obj:{id:string, userName: string}) => {
                    const peer = createPeer(obj.id, socket.id, stream)
                    console.log(peer, "peer")

                    peersRef.current.push({
                        peerId: obj.id,
                        peer
                    })
                    peers.push(peer)
                })
                setPeers(peers)
            })

            socket.on("user joined", ({signal, callerId}) => {
                console.log("user joined")
                const peer = addPeer(signal, callerId, stream);
                peersRef.current.push({
                    peerId: callerId,
                    peer
                })
                setPeers((users:any) => [...users, peer])
            })

            socket.on("returned signal", ({signal, id}) => {
                console.log("Returned signal")
                const item = peersRef.current.find(p => p.peerId === id);
                item.peer.signal(signal)
            })

            

        } catch (err) {
            console.log(err)
        }
    }

    function createPeer(userToSignal:string, callerId:string | undefined, stream: MediaStream | null | undefined) {
        if(!stream) return;
        if(!userToSignal) return;
        if(!callerId) return;
        const peer = new window.SimplePeer({
            initiator: true,
            trickle: false,
            stream,
            config: {
                iceServers: [...iceServers]
            },
        })


        peer.on("signal", (signal:any) => {
            socket.emit("sending signal", {userToSignal, callerId, signal})
        })

        return peer;
    }

    function addPeer(inCommingSignal: any, callerId: string, stream: MediaStream | null | undefined) {
        console.log("Add pear")
        if(!stream) return;
        if(!inCommingSignal) return;
        if(!callerId) return;

        const peer = new window.SimplePeer({
            initiator: false,
            trickle: false,
            stream,
            config: {
                iceServers: [...iceServers]
            },
        })

        peer.on("signal", (signal:any) => {
            socket.emit("incomming signal", {signal, callerId})
        })

        peer.signal(inCommingSignal);

        return peer;
    }

    useEffect(() => {
        signalingFunction()
    }, [peers.length])

    function signalingFunction() {
        peers.forEach((peer, i) => {
            peer.on("stream", (stream:any) => {
                addRemoteStream(stream, i)
            })
        })
    }


    function addRemoteStream(stream: MediaStream, index: number) {
        console.log(stream, " ====== abcd")
        const videoGrid = document.getElementById('video-grid')
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.className= "video"
        videoElement.id = index.toString()

        videoGrid?.append(videoElement);
    }


    function leaveCall() {
        // setCallEnded(true)
    }

    return (
        <SocketContext.Provider value={{
            call,
            myVideo,
            stream,
            name,
            setName,
            me,
            initialiseRtc,
            joinRoom,
            leaveCall,
            stopCamera,
            peers
        }
        }>
            {children}
        </SocketContext.Provider>
    )

}
export { ContextProvider, SocketContext };