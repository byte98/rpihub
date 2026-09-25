"""Application discovery and application-definition handling."""

# rpihub - simple RaspberryPi hub for other programs
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from urllib.parse import quote


class ApplicationService:
    """Finds application definitions and converts them into API data."""

    def __init__(self, root: Path, nested: bool):
        """Create an application service.

        :param root: Directory containing application definitions.
        :param nested: Whether subdirectories should also be searched.
        """
        self.root = root
        self.nested = nested

    def get_applications(self) -> list[dict[str, Any]]:
        """Return all valid application definitions in the configured root.

        :returns: List of normalized application definitions.
        """
        applications = []
        for path in self._find_files():
            try:
                applications.append(self._read_file(path))
            except (OSError, ValueError, json.JSONDecodeError):
                # One malformed definition must not prevent the other applications
                # from being displayed.
                continue
        return applications

    def get_asset(self, asset_path: str) -> Path | None:
        """Resolve an application asset while preventing path traversal.

        :param asset_path: Asset path relative to the configured hub root.
        :returns: Existing file path or ``None`` when the asset is invalid.
        """
        candidate = (self.root / asset_path).resolve()
        try:
            candidate.relative_to(self.root)
        except ValueError:
            return None
        result = candidate if candidate.is_file() else None
        return result

    def _find_files(self) -> list[Path]:
        """Find JSON files according to the configured nesting mode.

        :returns: Sorted paths to discovered JSON files.
        """
        pattern = "**/*.json" if self.nested else "*.json"
        return sorted(path for path in self.root.glob(pattern) if path.is_file())

    def _read_file(self, path: Path) -> dict[str, Any]:
        """Read and normalize one JSON application definition.

        :param path: Path to the application JSON file.
        :returns: Normalized application definition.
        :raises OSError: If the file cannot be read.
        :raises ValueError: If the JSON structure is invalid.
        """
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
        if not isinstance(data, dict):
            raise ValueError(f"Application file must contain a JSON object: {path}")

        for key in ("name", "description", "target"):
            if key not in data:
                raise ValueError(f"Application file {path} is missing '{key}'")

        data["name"] = self._normalize_translations(data["name"])
        data["description"] = self._normalize_translations(data["description"])
        data["icon"] = self._resolve_icon(data.get("icon", ""), path.parent)
        data["target"] = str(data["target"])
        data["accentColor"] = str(data.get("accentColor", "#808080"))
        return data

    @staticmethod
    def _normalize_translations(value: Any) -> dict[str, str]:
        """Normalize a translation value into a string dictionary.

        :param value: Original translation value.
        :returns: Mapping of language codes to translated strings.
        """
        if isinstance(value, str):
            return {"_": value}
        if not isinstance(value, dict):
            return {"_": str(value)}
        return {str(key): str(item) for key, item in value.items()}

    def _resolve_icon(self, value: str, base: Path) -> str:
        """Convert a local icon path into a safe asset API URL.

        :param value: Icon path from the application definition.
        :param base: Directory containing the application definition.
        :returns: URL usable by the frontend.
        :raises ValueError: If a local icon resolves outside the hub root.
        """
        if not value:
            return ""
        if value.startswith(("http://", "https://", "/")):
            return value

        relative = value[2:] if value.startswith("./") else value
        candidate = (base / relative).resolve()
        try:
            relative_to_root = candidate.relative_to(self.root)
        except ValueError as exc:
            raise ValueError(f"Application asset is outside configured root: {value}") from exc
        return "/api/assets/" + quote(relative_to_root.as_posix(), safe="/")
