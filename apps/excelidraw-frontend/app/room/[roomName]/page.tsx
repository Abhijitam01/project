import { getRoom } from "@/actions/getRoom"
import { RoomCanvas } from "@/canvas/RoomCanvas"

interface PageProps {
    params: {
        roomName: string
    }
    searchParams: {
        invite?: string
    }
}

const page = async ({params, searchParams}: PageProps) => {
    const { roomName } = params
    try {
        const room = await getRoom(roomName, searchParams?.invite)

        if(!room){
            return <p>The room doesn&apos;t exist</p>
        }

        const inviteToken = searchParams?.invite || room.inviteCode || null
        return <RoomCanvas roomId={String(room.id)} room={room} inviteCode={inviteToken} />
    } catch (error) {
        return <p>Error loading room: {(error as Error).message}</p>
    }
}

export default page
