import { useEffect, useContext, useRef } from "react"
import { useParams } from "react-router-dom"
import { SocketContext } from "../../context";
import "./index.css"

export default function Call() {
    const {  initialiseRtc, myVideo, peers } = useContext<any>(SocketContext)
    const params = useParams();

    useEffect(() => {
        connect();
    }, [])

    async function connect() {
        const name = localStorage.getItem("name") ?? "John doe";
        await initialiseRtc(params.id, name);
    }
    console.log(peers, "peers list")

    return (
        <div className="video-grid" id="video-grid">
           <video playsInline ref={myVideo} autoPlay muted className="video" key={"my-video"}  />
           {/* {peers.map((peer:any, index: number) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })} */}
        </div>
    )
}

// const Video = (props:any) => {
//     const ref:any = useRef();
//     console.log(props)

//     useEffect(() => {
//         props.peer.on("stream", (stream:any) => {
//             console.log(stream, "stream")
//             ref.current.srcObject = stream;
//         })
//     }, []);

//     return (
//         <video  playsInline ref={ref} autoPlay className="video"  />
//     );
// }