import { getRoom } from "@/actions/getRoom"
import { RoomCanvas } from "@/canvas/RoomCanvas"

interface PageProps {
    params: Promise<{
        roomName: string
    }>
}

const page = async ({params}: PageProps) => {
    const { roomName } = await params
    const room = await getRoom(roomName)

    if(!room){
        return <p>The room doesn&apos;t exist</p>
    }

    return <RoomCanvas roomId={room.id} room={room} />
}

export default page