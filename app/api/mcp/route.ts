import { NextRequest } from"next/server";

const KAPRUKA_MCP_ENDPOINT ="https://mcp.kapruka.com/mcp";

export const runtime ="nodejs";
export const dynamic ="force-dynamic";

export async function OPTIONS() {
 return new Response(null, {
 status: 204,
 headers: {
"Access-Control-Allow-Origin":"*",
"Access-Control-Allow-Methods":"POST, OPTIONS",
"Access-Control-Allow-Headers":"content-type, mcp-session-id"
 }
 });
}

export async function POST(request: NextRequest) {
 const body = await request.text();
 const sessionId = request.headers.get("mcp-session-id");

 try {
 const upstream = await fetch(KAPRUKA_MCP_ENDPOINT, {
 method:"POST",
 headers: {
"content-type":"application/json",
"accept":"application/json, text/event-stream",
 ...(sessionId ? {"mcp-session-id": sessionId } : {})
 },
 body,
 cache:"no-store"
 });

 const text = await upstream.text();
 const headers = new Headers({
"content-type": upstream.headers.get("content-type") ??"application/json",
"cache-control":"no-store",
"Access-Control-Allow-Origin":"*"
 });
 const nextSessionId = upstream.headers.get("mcp-session-id");
 if (nextSessionId) headers.set("mcp-session-id", nextSessionId);

 return new Response(text, { status: upstream.status, headers });
 } catch {
 return Response.json(
 { jsonrpc:"2.0", error: { code: -32098, message:"Kapruka MCP is temporarily unreachable" } },
 { status: 200, headers: {"cache-control":"no-store" } }
 );
 }
}
