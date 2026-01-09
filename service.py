#!/usr/bin/env python3
"""
Orchestrator as HTTP Service
Based on the working CLI version, converted to FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
import anthropic
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint - same logic as CLI orchestrator"""
    
    print(f"\n[You] {request.message}")
    print(f"[🤖 Claude] Processing...")
    
    server_params = StdioServerParameters(command="python3", args=["mcp_server_official.py"])
    
    async with stdio_client(server_params) as streams:
        read_stream, write_stream = streams
        async with ClientSession(read_stream, write_stream) as client:
            # Initialize client
            await client.initialize()
            
            # Get tools from MCP server
            tools_response = await client.list_tools()
            tool_defs = [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema,
                }
                for tool in tools_response.tools
            ]
            
            messages = [{"role": "user", "content": request.message}]
            
            # Keep looping while Claude wants to use tools
            while True:
                response = claude.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=1024,
                    tools=tool_defs,
                    messages=messages
                )
                
                if response.stop_reason == "end_turn":
                    # Claude is done - extract final text
                    text = next(
                        (block.text for block in response.content if hasattr(block, "text")),
                        None
                    )
                    if text:
                        print(f"\n[🤖 ASSISTANT]\n{text}\n")
                    
                    return ChatResponse(response=text or "No response generated")
                
                if response.stop_reason == "tool_use":
                    # Claude wants to use a tool
                    tool_uses = [b for b in response.content if b.type == "tool_use"]
                    
                    # Add assistant message to history
                    messages.append({"role": "assistant", "content": response.content})
                    
                    # Call each tool and collect results
                    tool_results = []
                    for tool_use in tool_uses:
                        print(f"[🔧 CALLING] {tool_use.name}")
                        try:
                            result = await client.call_tool(tool_use.name, tool_use.input)
                            # Parse the result
                            result_text = result.content[0].text if result.content else "{}"
                            
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_use.id,
                                "content": result_text,
                            })
                            print(f"[✓] {tool_use.name}")
                        except Exception as e:
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool_use.id,
                                "content": f"Error: {str(e)}",
                            })
                            print(f"[✗] {tool_use.name}: {e}")
                    
                    # Add tool results to messages
                    messages.append({"role": "user", "content": tool_results})
                else:
                    break
    
    return ChatResponse(response="Conversation ended unexpectedly")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*70)
    print("🚀 ORCHESTRATOR HTTP SERVICE")
    print("="*70)
    print("📡 Running on http://localhost:8002")
    print("="*70 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")