import { Server } from "https://deno.land/std@0.183.0/http/server.ts";
import { dateToString } from "https://deno.land/x/date_format_deno/mod.ts";
import iro, { bold, gray, red, white, yellow } from 'https://deno.land/x/iro/mod.ts';
import * as tty from "https://deno.land/x/tty/mod.ts";
import { SignOnResponsePayload } from "../../std-payloads.ts";

const port = 5500;
let logs: Array<string> = []
const connectedClients: Record<string, {lastSeen: Date, address: string, path: string}> = {}
let longestClient = 0


const SIGN_ON_ROUTE = new URLPattern({ pathname: "/sign-on" });
const PING_ROUTE = new URLPattern({ pathname: "/ping" });
const HTTP_ROUTE = new URLPattern({ pathname: "/http" });

const handler = async (request: Request) => {

    if(SIGN_ON_ROUTE.exec(request.url)) {

        const src = signOn(request)
        if(src){
            log(`Sign-on from ${src}.`)
            return Response.json({
                i: 'SIGN_ON',
                response: 'Welcome aboard.'
            } satisfies SignOnResponsePayload, { status: 200 })
        }

        log(`Warning: received sign-on from unknown source.`)
        return Response.json({
            i: 'SIGN_ON',
            response: 'Warning: unrecognized client'
        } satisfies SignOnResponsePayload, { status: 200 })
    }

    if(PING_ROUTE.exec(request.url)) {

        const source = request.headers.get('X-Constellation-Source') ?? ''
        if (!Object.keys(connectedClients).includes(source)) {
            signOn(request)
            log(`Auto sign-on by ${source} from ping.`)
        } else {
            refresh(source)
        }

        return Response.json({})
    }

    if(HTTP_ROUTE.exec(request.url)) {
        // this is an http request trying to get to a service, so find the service and forward it
        
        const formData = await request.formData()

        if (!formData.has('destination') || !formData.has('path')) {
            return new Response('Missing routing information', { status: 500 });
        }

        const targetConfig = Object.values(connectedClients).find((c) => c.path === formData.get('destination') as string)
        if (!targetConfig) {
            log('Inbound HTTP request has no matching destination service')
            return new Response('Unable to find destination service', { status: 500 });
        }

        // contact the service
        const target = targetConfig.address + '/' + formData.get('path') as string
        log(`Forwarding HTTP request to ${target}.`)
        const response = await fetch(target)

        if (response.status !== 200) {
            log(`Bad response from ${target}: ${await response.text()}`)
            return new Response(`Bad response from handler: ${await response.text()}`, { status: 500 });
        }

        const output = await response.json()

        return Response.json({ data: output })
    }

    return new Response('Not Found', { status: 404 });
};

await tty.hideCursor();

setInterval(() => {
  tty.clearScreenSync();
  tty.goHomeSync();

  console.log('----------')
  console.log(iro('Nexus console', bold, red), `0.0.0.0:${port}`);
  console.log('----------')
  console.log('Active clients:')
  Object.entries(connectedClients).forEach(([client, data]) => {
        console.log('  ', iro(`${client} (${data.path})`.padEnd(longestClient), yellow), '  ', iro(data.address, white), '  ', iro(dateToString('TIME', data.lastSeen), gray))
    })
  console.log('----------')
  console.log('Log events:')
  logs.forEach(e => {
    console.log('  ', iro(e, gray))
  })


}, 1000);

const server = new Server({ port, handler });
await server.listenAndServe();

function log(msg: string) {
    logs.push(msg)
    logs = logs.slice(-20)
}

function signOn (request: Request) {

    const source = request.headers.get('X-Constellation-Source')
    const address = request.headers.get('X-Constellation-Source-Address')
    const path = request.headers.get('X-Constellation-Source-Path')

    if (source && address && path) {
        connectedClients[source] = {lastSeen: new Date(), address, path }
        longestClient = Object.keys(connectedClients).reduce((prev, cur) =>  cur.length > prev ? (`${cur} (${connectedClients[cur].path})`).length : prev, 0)

        return source
    }
    return false
}

function refresh(source: string) {
    if (Object.keys(connectedClients).includes(source)) {
        connectedClients[source].lastSeen = new Date()
    }
}