import os
import base64
import sys
from flask import Flask, request, jsonify
from groq import Groq
from dotenv import load_dotenv

# 1. Configuración inicial
load_dotenv()

# Verificación de seguridad
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("❌ ERROR CRÍTICO: No se encontró GROQ_API_KEY en el archivo .env", file=sys.stderr)
    # No detenemos el script para que el contenedor no se reinicie en bucle, pero fallará al llamar a la API.

# Inicializar cliente Groq y servidor Flask
client = Groq(api_key=api_key)
app = Flask(__name__)

# -------------------------------------------------------------------
# PROMPT DEL SISTEMA (El "Cerebro" de las reglas)
# -------------------------------------------------------------------
SYSTEM_PROMPT = """
Eres un Arquitecto de Base de Datos Senior experto en MySQL y Laravel.
Tu tarea es analizar un diagrama visual y correcciones verbales para generar código SQL DDL (CREATE TABLE).

REGLAS CRÍTICAS:
1. ANÁLISIS VISUAL: Extrae tablas, columnas y relaciones del diagrama.
2. AUDIO vs IMAGEN: El contexto de audio tiene PRIORIDAD TOTAL. Si el audio dice "borra la tabla usuarios", hazlo aunque aparezca en el dibujo.
3. INFERENCIA: Si faltan tipos de datos, infiérelos lógicamente (ej: 'email' -> VARCHAR(255), 'created_at' -> TIMESTAMP).
4. CLAVES FORÁNEAS: Si hay líneas conectando tablas, crea las FOREIGN KEYs correspondientes.
5. FORMATO DE SALIDA:
   - Devuelve EXCLUSIVAMENTE el código SQL puro.
   - NO uses bloques de markdown (```sql).
   - NO escribas explicaciones ni introducciones.
"""

# -------------------------------------------------------------------
# FUNCIONES AUXILIARES
# -------------------------------------------------------------------
def encode_image(image_path):
    """Convierte la imagen a base6