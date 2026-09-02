/** All of FinClaimContract's query/submit responses are JSON strings encoded as bytes;
 * this decodes them back into the value the contract actually returned. */
export function decodeJson<T = unknown>(bytes: Uint8Array): T {
    return JSON.parse(Buffer.from(bytes).toString('utf8')) as T;
}
