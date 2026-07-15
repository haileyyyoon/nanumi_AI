"""
app.py
------
Flask web server for the comfort women history chatbot.
"""

import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix

from rag import chatbot_response
from sheet_logger import log_feedback, log_qa

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# On Render (and most hosts) the app runs behind a proxy, so the real client
# IP is in the X-Forwarded-For header. This lets the rate limiter key on the
# actual visitor rather than the proxy.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)

SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
if not SECRET_KEY:
    logger.warning(
        "FLASK_SECRET_KEY is not set in the environment. Using a random key "
        "for this run, which means chat sessions will not persist across "
        "server restarts. Set FLASK_SECRET_KEY in your .env file for production."
    )
    SECRET_KEY = os.urandom(24).hex()
app.secret_key = SECRET_KEY

MAX_HISTORY = int(os.getenv("MAX_CHAT_HISTORY", "20"))
MAX_QUESTION_LEN = int(os.getenv("MAX_QUESTION_LENGTH", "500"))

# Rate limits protect the owner's OpenAI account from a public URL being
# hammered (or used as a free LLM proxy). Adjustable via env vars. These are
# per-visitor (per IP) limits; the hard ceiling on cost is the monthly budget
# limit you should also set in the OpenAI dashboard.
CHAT_RATE_LIMIT = os.getenv("CHAT_RATE_LIMIT", "20 per minute;200 per hour")
FEEDBACK_RATE_LIMIT = os.getenv("FEEDBACK_RATE_LIMIT", "30 per minute")

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    storage_uri="memory://",
    strategy="fixed-window",
)


@app.route("/")
def index():
    return render_template("chatbot.html")


@app.route("/chat", methods=["POST"])
@limiter.limit(CHAT_RATE_LIMIT)
def chat():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    language = (data.get("language") or "auto").strip() or "auto"

    if not question:
        return jsonify({"response": "Please enter a question."}), 400

    if len(question) > MAX_QUESTION_LEN:
        return jsonify({
            "response": "Your question is too long. Please shorten it and try again."
        }), 400

    chat_history = session.get("chat_history", [])
    chat_history.append({"role": "user", "content": question})

    try:
        response_text = chatbot_response(question, chat_history, language=language)
    except Exception:
        logger.exception("Unhandled error while generating chatbot response")
        return jsonify({
            "response": "Sorry, something went wrong on our end. Please try again in a moment."
        }), 500

    chat_history.append({"role": "assistant", "content": response_text})
    session["chat_history"] = chat_history[-MAX_HISTORY:]

    log_qa(question, response_text, language)

    return jsonify({"response": response_text})


@app.route("/feedback", methods=["POST"])
@limiter.limit(FEEDBACK_RATE_LIMIT)
def feedback():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()[:MAX_QUESTION_LEN]
    answer = (data.get("answer") or "").strip()[:4000]
    language = (data.get("language") or "auto").strip() or "auto"

    if not question and not answer:
        return jsonify({"status": "ignored"}), 400

    log_feedback(question, answer, language)
    return jsonify({"status": "ok"})


@app.route("/reset", methods=["POST"])
def reset():
    session.pop("chat_history", None)
    return jsonify({"status": "ok"})


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.getenv("PORT", "5000"))
    app.run(debug=debug, port=port)
