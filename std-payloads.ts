

export type SignOnResponsePayload = {
    i: 'SIGN_ON',
    response: string
}

export type HttpRequestPayload = {
    i: 'HTTP_REQUEST',
    destination: string,
    path: string,
    request: string
}

export type StandardHeaders = {
    'X-Constellation-Source': string,
    'X-Constellation-Source-Address': string,
    'X-Constellation-Source-Path': string
}