"""
sheet_logger.py
---------------
Optional logging to a Google Sheet, so museum staff can review what visitors
are asking (Q&A tab) and which answers visitors flagged as wrong (Feedback
tab). This is best-effort: if the Sheet isn't configured (or a write fails),
the chatbot still works normally and just skips logging.
"""

import logging
import os
from datetime import datetime, timezone

import gspread

logger = logging.getLogger(__name__)

CREDENTIALS_PATH = os.getenv("GOOGLE_SHEETS_CREDENTIALS_PATH")
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
QA_WORKSHEET_NAME = os.getenv("GOOGLE_SHEET_WORKSHEET_NAME", "Sheet1")
FEEDBACK_WORKSHEET_NAME = os.getenv("GOOGLE_SHEET_FEEDBACK_WORKSHEET_NAME", "Feedback")

_spreadsheet = None
_connect_failed = False
_worksheets = {}  # worksheet name -> worksheet handle (or None if it failed)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _get_spreadsheet():
    """Connect to the spreadsheet once; cache the result (success or failure)."""
    global _spreadsheet, _connect_failed
    if _spreadsheet is not None:
        return _spreadsheet
    if _connect_failed:
        return None

    if not CREDENTIALS_PATH or not SHEET_ID:
        logger.info("Google Sheets logging is not configured (env vars missing); skipping.")
        _connect_failed = True
        return None

    try:
        client = gspread.service_account(filename=CREDENTIALS_PATH)
        _spreadsheet = client.open_by_key(SHEET_ID)
    except Exception:
        logger.exception("Could not connect to Google Sheets; logging disabled for this run.")
        _connect_failed = True
        return None

    return _spreadsheet


def _get_worksheet(name: str, headers: list[str]):
    """Return the named worksheet, creating it (with headers) if needed. Cached."""
    if name in _worksheets:
        return _worksheets[name]

    spreadsheet = _get_spreadsheet()
    if spreadsheet is None:
        _worksheets[name] = None
        return None

    try:
        try:
            worksheet = spreadsheet.worksheet(name)
        except gspread.WorksheetNotFound:
            worksheet = spreadsheet.add_worksheet(name, rows=1000, cols=len(headers))
        if not any(row for row in worksheet.get_all_values()):
            worksheet.append_row(headers)
        _worksheets[name] = worksheet
    except Exception:
        logger.exception("Could not open worksheet '%s'; logging to it is disabled.", name)
        _worksheets[name] = None

    return _worksheets[name]


def log_qa(question: str, answer: str, language: str) -> None:
    """Best-effort append of one Q&A row. Never raises."""
    worksheet = _get_worksheet(QA_WORKSHEET_NAME, ["Timestamp (UTC)", "Language", "Question", "Answer"])
    if worksheet is None:
        return
    try:
        worksheet.append_row([_now(), language, question, answer])
    except Exception:
        logger.exception("Failed to log Q&A to Google Sheets")


def log_feedback(question: str, answer: str, language: str) -> None:
    """Best-effort append of one flagged answer to the Feedback tab. Never raises."""
    worksheet = _get_worksheet(
        FEEDBACK_WORKSHEET_NAME, ["Timestamp (UTC)", "Language", "Question", "Flagged answer"]
    )
    if worksheet is None:
        return
    try:
        worksheet.append_row([_now(), language, question, answer])
    except Exception:
        logger.exception("Failed to log feedback to Google Sheets")
