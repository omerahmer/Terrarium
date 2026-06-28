import anthropic

MODEL = "claude-sonnet-4-6"

# Single shared Anthropic client, reused by the generation and review agents.
client = anthropic.Anthropic()


def extract_tool_input(message: anthropic.types.Message, tool_name: str) -> dict:
    """Return the input of the first tool_use block matching tool_name.

    Both agents force a specific tool via tool_choice, so the model's structured
    output always arrives as a tool_use block rather than prose.
    """
    for block in message.content:
        if block.type == "tool_use" and block.name == tool_name:
            return block.input
    raise ValueError(f"Claude response did not include a {tool_name} tool call")
