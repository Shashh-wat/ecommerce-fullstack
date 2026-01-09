#!/usr/bin/env python3
"""
Official MCP Client Pattern
Based on: https://github.com/modelcontextprotocol/python-sdk
"""
import asyncio
import os
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
import anthropic

claude = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

async def main():
    print("\n" + "="*70)
    print("ECOMMERCE CHATBOT - Claude + MCP")
    print("="*70 + "\n")
    
    # Create server parameters for stdio connection
    server_params = StdioServerParameters(command="python3", args=["mcp_server_official.py"])
    
    # Connect via stdio
    async with stdio_client(server_params) as streams:
        read_stream, write_stream = streams
        async with ClientSession(read_stream, write_stream) as client:
            await client.initialize()
            print("[✓] MCP Server connected via stdio")
            print("[✓ Ready for chat!]\n")
            
            while True:
                try:
                    user_input = input("[You] ").strip()
                    if user_input.lower() == 'exit':
                        print("\nGoodbye!")
                        break
                    if not user_input:
                        continue
                    
                    print("[🤖 Claude] Processing...")
                    
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
                    
                    messages = [{"role": "user", "content": user_input}]
                    
                    # Loop while Claude wants to use tools
                    while True:
                        response = claude.messages.create(
                            model="claude-haiku-4-5-20251001",
                            max_tokens=1024,
                            tools=tool_defs,
                            messages=messages
                        )
                        
                        if response.stop_reason == "end_turn":
                            # Claude is done
                            text = next(
                                (block.text for block in response.content if hasattr(block, "text")),
                                None
                            )
                            if text:
                                print(f"\n[🤖 ASSISTANT]\n{text}\n")
                            break
                        
                        if response.stop_reason == "tool_use":
                            # Claude wants to use tools
                            tool_uses = [b for b in response.content if b.type == "tool_use"]
                            messages.append({"role": "assistant", "content": response.content})
                            
                            tool_results = []
                            for tool_use in tool_uses:
                                print(f"[🔧 CALLING] {tool_use.name}")
                                try:
                                    result = await client.call_tool(tool_use.name, tool_use.input)
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
                            
                            messages.append({"role": "user", "content": tool_results})
                        else:
                            break
                            
                except KeyboardInterrupt:
                    print("\n\nGoodbye!")
                    break
                except Exception as e:
                    print(f"Error: {e}")
                    import traceback
                    traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())