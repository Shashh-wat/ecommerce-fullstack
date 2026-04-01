#!/usr/bin/env python3
"""
MCP Orchestrator - Powered by Google Gemini (google-genai SDK, REST API)
"""
import asyncio
import os
import json
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
from google import genai
from google.genai import types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not set. Run: export GEMINI_API_KEY='your-key'")

client_gemini = genai.Client(api_key=GEMINI_API_KEY)


def mcp_tool_to_gemini_declaration(tool) -> dict:
    """Convert MCP tool schema → Gemini FunctionDeclaration dict."""
    schema = tool.inputSchema or {}
    properties = schema.get("properties", {})
    required = schema.get("required", [])

    type_map = {
        "string": "STRING", "number": "NUMBER",
        "integer": "INTEGER", "boolean": "BOOLEAN",
        "array": "ARRAY", "object": "OBJECT",
    }

    gemini_props = {}
    for name, defn in properties.items():
        gemini_props[name] = {
            "type": type_map.get(defn.get("type", "string"), "STRING"),
            "description": defn.get("description", ""),
        }

    fn_decl = types.FunctionDeclaration(
        name=tool.name,
        description=tool.description or "",
        parameters=types.Schema(
            type="OBJECT",
            properties={k: types.Schema(**v) for k, v in gemini_props.items()},
            required=required,
        ),
    )
    return fn_decl


async def main():
    print("\n" + "=" * 70)
    print("  ECOMMERCE CHATBOT - Gemini 2.0 Flash + MCP")
    print("=" * 70 + "\n")

    server_params = StdioServerParameters(
        command="python3", args=["mcp_server_official.py"]
    )

    async with stdio_client(server_params) as streams:
        read_stream, write_stream = streams
        async with ClientSession(read_stream, write_stream) as mcp_client:
            await mcp_client.initialize()
            print("[✓] MCP Server connected via stdio")

            # Build Gemini tools from MCP definitions
            tools_response = await mcp_client.list_tools()
            fn_declarations = [mcp_tool_to_gemini_declaration(t) for t in tools_response.tools]
            gemini_tools = [types.Tool(function_declarations=fn_declarations)]

            config = types.GenerateContentConfig(
                tools=gemini_tools,
                system_instruction=(
                    "You are a helpful e-commerce shopping assistant. "
                    "Use the available tools to search products, manage carts, and place orders. "
                    "Always be concise and format responses clearly with emojis."
                ),
            )

            print(f"[✓] Gemini ready with {len(fn_declarations)} MCP tools!")
            print("Tools:", [t.name for t in tools_response.tools])
            print("\nType 'exit' to quit.\n")

            # Maintain conversation history manually
            conversation: list[types.Content] = []

            while True:
                try:
                    user_input = input("[You] ").strip()
                    if user_input.lower() == "exit":
                        print("\nGoodbye!")
                        break
                    if not user_input:
                        continue

                    print("[🤖 Gemini] Thinking...")

                    # Add user message to history
                    conversation.append(
                        types.Content(role="user", parts=[types.Part(text=user_input)])
                    )

                    # Agentic loop
                    while True:
                        response = await asyncio.to_thread(
                            client_gemini.models.generate_content,
                            model="gemini-2.0-flash",
                            contents=conversation,
                            config=config,
                        )

                        candidate = response.candidates[0]
                        model_content = candidate.content

                        # Add model response to history
                        conversation.append(model_content)

                        # Check for function calls
                        fn_calls = [
                            p.function_call
                            for p in model_content.parts
                            if p.function_call is not None
                        ]

                        if not fn_calls:
                            # Final text response
                            text = "".join(
                                p.text for p in model_content.parts if hasattr(p, "text") and p.text
                            )
                            print(f"\n[🤖 ASSISTANT]\n{text}\n")
                            break

                        # Execute tools
                        tool_response_parts = []
                        for fn_call in fn_calls:
                            tool_name = fn_call.name
                            tool_args = dict(fn_call.args) if fn_call.args else {}
                            print(f"[🔧 CALLING] {tool_name}({tool_args})")

                            try:
                                result = await mcp_client.call_tool(tool_name, tool_args)
                                result_text = result.content[0].text if result.content else "{}"
                                try:
                                    result_data = json.loads(result_text)
                                except Exception:
                                    result_data = {"result": result_text}
                                print(f"[✓] {tool_name} → {str(result_data)[:120]}")
                            except Exception as e:
                                result_data = {"error": str(e)}
                                print(f"[✗] {tool_name}: {e}")

                            tool_response_parts.append(
                                types.Part(
                                    function_response=types.FunctionResponse(
                                        name=tool_name,
                                        response={"result": result_data},
                                    )
                                )
                            )

                        # Add tool results to history and loop back
                        conversation.append(
                            types.Content(role="user", parts=tool_response_parts)
                        )

                except KeyboardInterrupt:
                    print("\n\nGoodbye!")
                    break
                except Exception as e:
                    print(f"Error: {e}")
                    import traceback
                    traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())