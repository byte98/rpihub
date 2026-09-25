"""Language metadata and translation-base handling for RPi Hub."""

# rpihub - simple RaspberryPi hub for other programs
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class LanguageService:
    """Loads and provides versioned language bases stored as JSON files."""

    def __init__(self, directory: Path):
        """Initialize the language service.

        :param directory: Directory containing the language JSON files.
        """
        self.directory = directory

    def get_metadata(self) -> dict[str, list[dict[str, str]]]:
        """Return metadata for every valid installed language.

        Each language has its own version. This allows clients to refresh only
        language bases whose versions have changed.

        :returns: Mapping containing the supported language metadata.
        """
        languages = self._load()
        metadata = [
            {
                "code": item["code"],
                "name": item["name"],
                "nativeName": item["nativeName"],
                "flag": item["flag"],
                "version": item["version"],
            }
            for item in languages.values()
        ]
        return {"languages": metadata}

    def get_language(self, language: str) -> dict[str, Any] | None:
        """Return one complete versioned language base.

        :param language: Language code to load.
        :returns: Language code, version and phrases, or ``None`` if unknown.
        """
        language_data = self._load().get(language)
        reti = None
        if language_data is not None:
            reti = {
                "code": language,
                "version": language_data["version"],
                "phrases": language_data["phrases"],
            }
        return reti

    def _load(self) -> dict[str, dict[str, Any]]:
        """Load all valid language files from the configured directory.

        :returns: Mapping from language code to normalized language data.
        """
        languages: dict[str, dict[str, Any]] = {}
        if not self.directory.is_dir():
            return languages

        for path in sorted(self.directory.glob("*.json")):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                code = str(data.get("code", path.stem))
                phrases = data.get("phrases", {})
                if not isinstance(phrases, dict):
                    continue
                languages[code] = {
                    "code": code,
                    "name": str(data.get("name", code)),
                    "nativeName": str(data.get("nativeName", data.get("name", code))),
                    "flag": str(data.get("flag", code)),
                    "version": str(data.get("version", "1.0.0")),
                    "phrases": {str(key): str(value) for key, value in phrases.items()},
                }
            except (OSError, json.JSONDecodeError):
                continue
        return languages
