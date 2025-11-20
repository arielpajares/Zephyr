import os
import sys
import json
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq, BadRequestError
from dotenv import load_dotenv

# 1. Initial Configuration
load_dotenv()

# API Key Verification
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("❌ CRITICAL ERROR: GROQ_API_KEY not found in .env file", file=sys.stderr)

# Initialize Groq client
client = Groq(api_key=api_key)
app = Flask(__name__)
CORS(app) 

# -------------------------------------------------------------------
# CONFIGURATION
# -------------------------------------------------------------------
VISION_MODEL = os.getenv("GROQ_MODEL", "meta-llama/llama-4-maverick-17b-128e-instruct")
AUDIO_MODEL = "whisper-large-v3-turbo"

# -------------------------------------------------------------------
# SYSTEM PROMPT
# -------------------------------------------------------------------
SYSTEM_PROMPT = """
You are a Senior Database Architect expert in MySQL and Laravel.
Your task is to generate or MODIFY SQL DDL code (CREATE TABLE) based on instructions and the current schema state.

IMPORTANT CONTEXT:
You will receive the 'Current Schema' (if it exists).
- If instructions say "add a field", APPEND it to the existing schema.
- If instructions say "change X", MODIFY the existing table definition.
- If instructions say "create a new database/app", you can ignore the previous schema.

PRIORITIES:
1. INSTRUCTIONS (Text/Audio): Highest priority.
2. CURRENT SCHEMA: Use this as the base source of truth unless told otherwise.
3. IMAGES: Use for visual reference if provided.

OUTPUT RULES:
- Return the FULL VALID SQL schema (all tables), including your changes.
- DO NOT use markdown blocks.
- DO NOT include explanations.
- Always maintain Laravel standards (`id`, `created_at`, `updated_at`).
"""

# -------------------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------------------
def process_audio_data(base64_audio):
    try:
        if "base64," in base64_audio:
            base64_audio = base64_audio.split("base64,")[1]
            
        audio_bytes = base64.b64decode(base64_audio)
        
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio_file:
            temp_audio_file.write(audio_bytes)
            temp_audio_file.flush()
            temp_audio_file.seek(0)
            
            print("🎤 1. Transcribing Audio with Whisper...")
            transcription = client.audio.transcriptions.create(
                file=(temp_audio_file.name, open(temp_audio_file.name, "rb").read()),
                model=AUDIO_MODEL,
                response_format="text"
            )
            
            print(f"🗣️ User said: {transcription}")
            return transcription
            
    except Exception as e:
        print(f"⚠️ Audio transcription failed: {str(e)}", file=sys.stderr)
        return ""

@app.route('/generate-schema', methods=['POST'])
def generate_schema():
    try:
        data = request.json
        
        text_prompt = data.get('prompt', '')
        image_base64 = data.get('image', None)
        audio_base64 = data.get('audio', None)
        current_schema = data.get('currentSchema', '') # Receive current state

        if not text_prompt and not image_base64 and not audio_base64:
            return jsonify({"error": "At least text, audio, or an image is required"}), 400

        # --- STEP 1: PROCESS AUDIO ---
        audio_instruction = ""
        if audio_base64:
            audio_instruction = process_audio_data(audio_base64)

        final_instruction = f"{text_prompt}\n{audio_instruction}".strip()
        
        if not final_instruction and not image_base64:
             final_instruction = "Improve the current schema."

        # --- STEP 2: PREPARE PROMPT ---
        user_content = []

        # Construct the context-aware prompt
        prompt_text = f"INSTRUCTIONS: {final_instruction}"
        if current_schema and current_schema.strip() != "-- No tables defined":
            prompt_text = f"CURRENT SCHEMA:\n{current_schema}\n\n{prompt_text}"
        
        user_content.append({
            "type": "text", 
            "text": prompt_text
        })

        if image_base64:
            print("📷 2. Analyzing Diagram...")
            if "base64," in image_base64:
                image_base64 = image_base64.split("base64,")[1]
                
            user_content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_base64}" 
                }
            })

        # --- STEP 3: CALL LLAMA ---
        completion = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                { "role": "system", "content": SYSTEM_PROMPT },
                { "role": "user", "content": user_content }
            ],
            temperature=0.1, 
            max_tokens=2048, # Increased for full schema return
            top_p=1,
            stream=False,
            stop=None,
        )

        sql_result = completion.choices[0].message.content
        sql_result = sql_result.replace("```sql", "").replace("```", "").strip()

        return jsonify({
            "success": True, 
            "sql": sql_result,
            "transcription": audio_instruction
        })

    except BadRequestError as e:
        print(f"❌ Groq API Error: {e}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 400

    except Exception as e:
        print(f"❌ Server Error: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print(f"🚀 Zephyr AI Engine running on port 5000")
    print(f"🧠 Vision: {VISION_MODEL} | 👂 Audio: {AUDIO_MODEL}")
    app.run(host='0.0.0.0', port=5000, debug=True)