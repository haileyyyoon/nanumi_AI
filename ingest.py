"""
ingest.py
---------
Builds (or refreshes) the Pinecone index used by the chatbot from
data/comfortwomen_text.txt.

Run this once before starting the chatbot for the first time, and again
any time you edit data/comfortwomen_text.txt to add or update information:

    python ingest.py

This is intentionally a separate, manual step rather than something that
happens automatically on every chat request — re-uploading the whole
knowledge base on every single question (as the old code did) is slow,
wastes API quota, and risks duplicate/stale records.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from pinecone import Pinecone

load_dotenv()

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "comfort-women-rag")
NAMESPACE = os.getenv("PINECONE_NAMESPACE", "ns1")
DATA_FILE = Path(__file__).parent / "data" / "comfortwomen_text.txt"


def load_paragraphs():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Could not find source text file at {DATA_FILE}")
    raw = DATA_FILE.read_text(encoding="utf-8")
    return [p.strip() for p in raw.split("\n\n") if p.strip()]


def main():
    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key:
        raise SystemExit("PINECONE_API_KEY is not set. Copy .env.example to .env and fill it in.")

    pc = Pinecone(api_key=api_key)

    if not pc.has_index(INDEX_NAME):
        print(f"Creating Pinecone index '{INDEX_NAME}'...")
        pc.create_index_for_model(
            name=INDEX_NAME,
            cloud="aws",
            region="us-east-1",
            embed={
                "model": "llama-text-embed-v2",
                "field_map": {"text": "chunk_text"},
            },
        )
    else:
        print(f"Index '{INDEX_NAME}' already exists; upserting fresh records.")

    index = pc.Index(INDEX_NAME)

    paragraphs = load_paragraphs()
    records = [
        {"_id": f"rec{i}", "chunk_text": para}
        for i, para in enumerate(paragraphs, start=1)
    ]

    print(f"Upserting {len(records)} chunks from {DATA_FILE.name}...")
    # Pinecone's upsert_records has a request size limit, so send in batches.
    batch_size = 90
    for start in range(0, len(records), batch_size):
        batch = records[start:start + batch_size]
        index.upsert_records(NAMESPACE, batch)
        print(f"  upserted {start + len(batch)}/{len(records)}")

    print("Done. The chatbot can now query this index.")


if __name__ == "__main__":
    main()
