"""
rpihub - simple RaspberryPi hub for other programs.
Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
from configparser import ConfigParser
from pathlib import Path
from typing import Any
from urllib.parse import quote

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DEFAULT_CONFIG = Path.cwd() / "config.ini"


def load_config(path: Path) -> ConfigParser:
    """Load the application configuration from an INI file."""
    config = ConfigParser()
    if not path.is_file():
        raise FileNotFoundError(f"Configuration file does not exist: {path}")
    config.read(path, encoding="utf-8")
    return config


def parse_bool(value: str, option: str) -> bool:
    """Parse a boolean configuration value."""
    normalized = value.strip().lower()
    if normalized in {"true", "yes", "1", "on"}:
        return True
    if normalized in {"false", "no", "0", "off"}:
        return False
    raise ValueError(f"Invalid boolean value for {option}: {value}")


def resolve_root(value: str) -> Path:
    """Resolve the configured application root path."""
    root = Path(value).expanduser()
    if not root.is_absolute():
        root = Path.cwd() / root
    return root.resolve()


def read_application_file(path: Path, root: Path) -> dict[str, Any]:
    """Read and validate one application JSON file."""
    try:
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot read application file {path}: {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError(f"Application file must contain a JSON object: {path}")

    for key in ("name", "description", "target"):
        if key not in data:
            raise ValueError(f"Application file {path} is missing '{key}'")

    data["name"] = normalize_translations(data["name"])
    data["description"] = normalize_translations(data["description"])
    data["icon"] = resolve_asset(data.get("icon", ""), path.parent, root)
    data["target"] = str(data["target"])
    data["accentColor"] = str(data.get("accentColor", "#808080"))
    return data


def normalize_translations(value: Any) -> dict[str, str]:
    """Normalize a translation object into a string dictionary."""
    if isinstance(value, str):
        return {"_": value}
    if not isinstance(value, dict):
        return {"_": str(value)}
    return {str(key): str(item) for key, item in value.items()}


def resolve_asset(value: str, base: Path, root: Path) -> str:
    """Convert a local application asset path into an API URL."""
    if not value:
        return ""
    if value.startswith(("http://", "https://", "/")):
        return value

    relative = value[2:] if value.startswith("./") else value
    candidate = (base / relative).resolve()
    try:
        relative_to_root = candidate.relative_to(root)
    except ValueError:
        raise ValueError(f"Application asset is outside configured root: {value}")
    return "/api/assets/" + quote(relative_to_root.as_posix(), safe="/")


def find_application_files(root: Path, nested: bool) -> list[Path]:
    """Find JSON application definition files."""
    pattern = "**/*.json" if nested else "*.json"
    return sorted(path for path in root.glob(pattern) if path.is_file())


def language_version(language_dir: Path) -> str:
    """Calculate a stable version from all language files."""
    digest = hashlib.sha256()
    for path in sorted(language_dir.glob("*.json")):
        digest.update(path.name.encode("utf-8"))
        digest.update(str(path.stat().st_mtime_ns).encode("ascii"))
        digest.update(path.read_bytes())
    return digest.hexdigest()[:16]


def load_languages(language_dir: Path) -> dict[str, dict[str, Any]]:
    """Load all language metadata and phrase dictionaries."""
    languages: dict[str, dict[str, Any]] = {}
    if not language_dir.is_dir():
        return languages
    for path in sorted(language_dir.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            code = str(data.get("code", path.stem))
            languages[code] = {
                "code": code,
                "name": str(data.get("name", code)),
                "nativeName": str(data.get("nativeName", data.get("name", code))),
                "flag": str(data.get("flag", code)),
                "phrases": data.get("phrases", {}),
            }
        except (OSError, json.JSONDecodeError):
            continue
    return languages


def create_app(config: ConfigParser) -> FastAPI:
    """Create and configure the FastAPI application."""
    listen = config.get("server", "listen", fallback="0.0.0.0")
    port = config.getint("server", "port", fallback=8080)
    root = resolve_root(config.get("hub", "root", fallback="."))
    nested = parse_bool(config.get("hub", "nested", fallback="true"), "hub.nested")

    if not root.is_dir():
        raise NotADirectoryError(f"Configured hub root does not exist: {root}")

    language_dir = BASE_DIR / "languages"
    app = FastAPI(title="RPi Hub")
    app.state.root = root
    app.state.nested = nested
    app.state.listen = listen
    app.state.port = port
    app.state.language_dir = language_dir
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    app.mount("/flags", StaticFiles(directory=BASE_DIR / "flags"), name="flags")

    @app.get("/", include_in_schema=False)
    async def index() -> FileResponse:
        """Return the frontend entry point."""
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/api/applications")
    async def applications() -> JSONResponse:
        """Return all application definitions found in the configured root."""
        result: list[dict[str, Any]] = []
        for path in find_application_files(app.state.root, app.state.nested):
            try:
                result.append(read_application_file(path, app.state.root))
            except ValueError:
                continue
        return JSONResponse(result, headers={"Cache-Control": "no-cache"})

    @app.get("/api/languages")
    async def languages() -> JSONResponse:
        """Return supported languages and the current language-base version."""
        loaded = load_languages(app.state.language_dir)
        metadata = [
            {
                "code": item["code"],
                "name": item["name"],
                "nativeName": item["nativeName"],
                "flag": item["flag"],
            }
            for item in loaded.values()
        ]
        return JSONResponse(
            {"version": language_version(app.state.language_dir), "languages": metadata},
            headers={"Cache-Control": "no-cache"},
        )

    @app.get("/api/languages/{language}")
    async def language(language: str) -> JSONResponse:
        """Return one complete language base."""
        loaded = load_languages(app.state.language_dir)
        if language not in loaded:
            raise HTTPException(status_code=404, detail="Language not found")
        item = loaded[language]
        return JSONResponse(
            {"code": language, "version": language_version(app.state.language_dir), "phrases": item["phrases"]},
            headers={"Cache-Control": "no-cache"},
        )

    @app.get("/api/assets/{asset_path:path}")
    async def asset(asset_path: str) -> FileResponse:
        """Serve an application asset while keeping access inside the hub root."""
        candidate = (app.state.root / asset_path).resolve()
        try:
            candidate.relative_to(app.state.root)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail="Asset not found") from exc
        if not candidate.is_file():
            raise HTTPException(status_code=404, detail="Asset not found")
        media_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        return FileResponse(candidate, media_type=media_type)

    app.state.server_config = (listen, port)
    return app


def main() -> None:
    """Load configuration and start the HTTP server."""
    parser = argparse.ArgumentParser(description="RPi Hub")
    parser.add_argument("config", nargs="?", type=Path, default=DEFAULT_CONFIG, help="Path to INI configuration")
    args = parser.parse_args()
    config = load_config(args.config.resolve())
    application = create_app(config)
    listen, port = application.state.server_config
    uvicorn.run(application, host=listen, port=port)


if __name__ == "__main__":
    main()
