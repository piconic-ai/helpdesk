import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { Context, Scope } from './catalog-usecase'
import { invoke, describe } from './runtime-usecase'
import {
  machineResult,
  responseSchema,
  toolInstruction,
} from './machine-result'
import { machineError } from './machine-errors'

export async function serveMcp(
  request: Request,
  ctx: Context,
  scopes: ReadonlySet<Scope>,
) {
  if (request.method !== 'POST')
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  const server = new Server(
    { name: 'helpdesk', version: '1.0.0' },
    { capabilities: { tools: {} }, instructions: toolInstruction },
  )
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: (await describe(ctx, scopes)).map((op) => ({
      name: op.name,
      description: op.description + ' ' + toolInstruction,
      inputSchema: { ...op.inputSchema, type: 'object' as const },
      outputSchema: responseSchema(op.outputSchema),
    })),
  }))
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    try {
      const result = machineResult(
        await invoke(ctx, scopes, req.params.name, req.params.arguments ?? {}),
      )
      return {
        structuredContent: result,
        content: [{ type: 'text', text: JSON.stringify(result) }],
      }
    } catch (e) {
      return {
        isError: true,
        content: [{ type: 'text', text: machineError(e).message }],
      }
    }
  })
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}
