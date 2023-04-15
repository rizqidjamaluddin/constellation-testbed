

export function toFormBody<K extends Record<string, string>>(data: K) {
    const res = new FormData()
    Object.entries(data).forEach(([key, val]) => {
        res.set(key, val)
    })
    return res
}

export type SerializableRequest = {
    headers: Record<string, string>
}

export function serializeRequest(req: Request): string {
    return JSON.stringify({
        headers: Object.fromEntries(req.headers)
    } satisfies SerializableRequest)
}

export function unserializeRequest(req: string): SerializableRequest {
    return JSON.parse(req)
}