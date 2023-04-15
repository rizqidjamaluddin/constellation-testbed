import { Server } from "https://deno.land/std@0.183.0/http/server.ts";
import { StandardHeaders } from "../../std-payloads.ts";
import { keepAlive, signOn } from "../../std-procedures.ts";

const headers = {
    "X-Constellation-Source": 'Forms-Service',
    "X-Constellation-Source-Path": 'forms',
    "X-Constellation-Source-Address": 'http://0.0.0.0:5511'
} satisfies StandardHeaders

const port = 5511;
console.log(`Starting gateway server, port ${port}`);
signOn(headers)

const CLIENT_FORM_LIST_ROUTE = new URLPattern({ pathname: "/list" });

// todo: migration logic

const handler = (request: Request) => {
    if (CLIENT_FORM_LIST_ROUTE.exec(request.url)) {
        // todo: wire up to data source
        return Response.json({
            forms: ['a', 'b', 'c']
        }, {status: 200})
    }

    return new Response('Not Found', { status: 404 });
};

const server = new Server({ port, handler });
setInterval(() => {
    keepAlive(headers)
}, 10000);
await server.listenAndServe();