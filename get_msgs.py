import json

with open("/Users/greg/.gemini/antigravity/brain/2b88df18-8de0-4690-8f2f-cc2ed92c4238/.system_generated/logs/transcript_full.jsonl") as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "USER_INPUT":
                content = data.get("content", "").replace("\n", " ")
                print(content)
        except json.JSONDecodeError:
            pass
