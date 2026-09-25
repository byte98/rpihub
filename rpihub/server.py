"""FastAPI application construction for RPi Hub."""

# rpihub - simple RaspberryPi hub for other programs
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

from __future__ import annotations

import mimetypes
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .applications import ApplicationService
from .config import HubConfiguration
from .languages import LanguageService


class RPiHubServer:
    """Creates the HTTP application and exposes all RPi Hub endpoints."""

    def __init__(self, configuration: HubConfiguration):
        """Initialize the server from the supplied configuration.

        :param configuration: Validated RPi Hub configuration.
        """
        self.configuration = configuration
        self.base_directory = Path(__file__).resolve().parent
        self.static_directory = self.base_directory / "static"
        self.flags_directory = self.base_directory / "flags"
        self.application_service = ApplicationService(configuration.root, configuration.nested)
        self.language_service = LanguageService(self.base_directory / "languages")
        self.app = self._create_app()

    def _create_app(self) -> FastAPI:
        """Create routes and static-resource mounts.

        :returns: Configured FastAPI application instance.
        """
        # OpenAPI and the automatically generated documentation pages are
        # deliberately disabled. RPi Hub exposes its API only to its own UI.
        app = FastAPI(
            title="RPi Hub",
            docs_url=None,
            redoc_url=None,
            openapi_url=None,
        )
        app.mount("/static", StaticFiles(directory=self.static_directory), name="static")
        app.mount("/flags", StaticFiles(directory=self.flags_directory), name="flags")

        @app.get("/", include_in_schema=False)
        async def index() -> FileResponse:
            """Return the RPi Hub frontend."""
            return FileResponse(self.static_directory / "index.html")

        @app.get("/service-worker.js", include_in_schema=False)
        async def service_worker() -> FileResponse:
            """Return the PWA service worker from the application root.

            The service worker is intentionally served from ``/`` rather than
            ``/static/`` so that its default scope covers the complete RPi Hub
            application.

            :returns: JavaScript service-worker resource.
            """
            return FileResponse(
                self.static_directory / "service-worker.js",
                media_type="application/javascript",
                headers={"Cache-Control": "no-cache"},
            )

        @app.get("/api/applications", include_in_schema=False)
        async def applications() -> JSONResponse:
            """Return all valid application definitions."""
            return JSONResponse(
                self.application_service.get_applications(),
                headers={"Cache-Control": "no-cache"},
            )

        @app.get("/api/languages", include_in_schema=False)
        async def languages() -> JSONResponse:
            """Return language metadata and the current language-base version."""
            return JSONResponse(
                self.language_service.get_metadata(),
                headers={"Cache-Control": "no-cache"},
            )

        @app.get("/api/languages/{language}", include_in_schema=False)
        async def language(language: str) -> JSONResponse:
            """Return one complete language base."""
            data = self.language_service.get_language(language)
            if data is None:
                raise HTTPException(status_code=404, detail="Language not found")
            return JSONResponse(data, headers={"Cache-Control": "no-cache"})

        @app.get("/api/assets/{asset_path:path}", include_in_schema=False)
        async def asset(asset_path: str) -> FileResponse:
            """Return an application asset from inside the configured hub root."""
            asset_path_object = self.application_service.get_asset(asset_path)
            if asset_path_object is None:
                raise HTTPException(status_code=404, detail="Asset not found")
            media_type = mimetypes.guess_type(asset_path_object.name)[0] or "application/octet-stream"
            return FileResponse(asset_path_object, media_type=media_type)

        return app

    def run(self) -> None:
        """Start the configured Uvicorn HTTP server.

        :returns: ``None`` after the server stops.
        """
        import uvicorn

        uvicorn.run(
            self.app,
            host=self.configuration.listen,
            port=self.configuration.port,
        )
