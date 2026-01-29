// import axios from "axios";
// import { BACKEND_URL } from "../../config";

// async function getRoomId(slug: string) {
//     const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
//     console.log(response.data);
//     return response.data.room.id;
// }

export default async function RoomPage(props: {
    params: Promise<{
        slug: string
    }>
}) {
    const params = await props.params;
    const { slug } = params;
    // const roomId = await getRoomId(slug);
    
    // return <ChatRoom id={roomId}></ChatRoom>
    return <div>
        Room: {slug}
    </div>

}