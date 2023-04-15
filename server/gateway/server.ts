import { Server } from "https://deno.land/std@0.183.0/http/server.ts";
import iro, { gray, yellow } from 'https://deno.land/x/iro/mod.ts';
import { HttpRequestPayload, StandardHeaders } from "../../std-payloads.ts";
import { keepAlive, nexus, signOn } from "../../std-procedures.ts";
import { serializeRequest, toFormBody } from "../../utils.ts";

const headers = {
    "X-Constellation-Source": 'Gateway',
    "X-Constellation-Source-Path": 'x-gateway',
    "X-Constellation-Source-Address": 'http://0.0.0.0:5501'
} satisfies StandardHeaders

const port = 5501;
console.log(`Starting gateway server, port ${port}`);
signOn(headers)

const PASSTHROUGH_ROUTE = new URLPattern({ pathname: "/:service/:etc+" });

const handler = async (request: Request) => {
    // take all requests, figure out what service they're going to by their pathname, and reroute using a HTTP_REQUEST payload
    if (PASSTHROUGH_ROUTE.exec(request.url)) {
        const match = PASSTHROUGH_ROUTE.exec(request.url)
        const destination = match?.pathname.groups.service ?? '??'
        console.log(iro('Routing request', gray), request.url, ' -> ', iro(destination, yellow))

        const res = await fetch(`${nexus()}/http`, { 
            body: toFormBody({
                    i: 'HTTP_REQUEST',
                    destination,
                    path: match?.pathname.groups.etc,
                    request: serializeRequest(request)
                } as HttpRequestPayload ),
            method: 'post'
        })

        return res
    }

    return new Response('Not Found', { status: 404 });
};

const server = new Server({ port, handler });
setInterval(() => {
    keepAlive(headers)
}, 10000);
await server.listenAndServe();