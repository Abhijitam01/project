export const getRoom = async (roomName : string, invite?: string) => {
    const params = new URLSearchParams()
    if (invite) {
        params.set("invite", invite)
    }

    const query = params.toString()
    const url = `${process.env.NEXT_PUBLIC_HTTP_URL}/room/${roomName}${query ? `?${query}` : ""}`
    const res = await fetch(url, {
        method: "GET"
    })

    if (res.status === 200) {
        const data = await res.json()
        return data.room
    }

    const data = await res.json().catch(() => null)
    throw new Error(data?.error || "Something went wrong")
}
