import { StandardHeaders } from "./std-payloads.ts";

export function nexus() {
    return 'http://0.0.0.0:5500'
}

export async function signOn(headers: StandardHeaders) {
    try {
        const ping = await fetch(`${nexus()}/sign-on`, { headers })
        if (ping.status !== 200) { console.warn('Unable to contact nexus.') }
    } catch {
        console.warn('Unable to contact nexus.')
    }
}

export async function keepAlive(headers: StandardHeaders) {
    try {
        const ping = await fetch(`${nexus()}/ping`, { headers })
        if (ping.status !== 200) { console.warn('Unable to contact nexus.') }
    } catch {
        console.warn('Unable to contact nexus.')
    }
}