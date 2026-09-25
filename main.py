"""RPi Hub application entry point."""

# rpihub - simple RaspberryPi hub for other programs
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

from __future__ import annotations

import argparse
from pathlib import Path

from rpihub.config import HubConfiguration
from rpihub.server import RPiHubServer


class RPiHub:
    """Coordinates command-line parsing, configuration and server startup."""

    DEFAULT_CONFIG = Path.cwd() / "config.ini"

    @staticmethod
    def parse_arguments() -> argparse.Namespace:
        """Parse command-line arguments.

        :returns: Parsed command-line arguments.
        """
        parser = argparse.ArgumentParser(description="RPi Hub")
        parser.add_argument(
            "config",
            nargs="?",
            type=Path,
            default=RPiHub.DEFAULT_CONFIG,
            help="Path to INI configuration",
        )
        return parser.parse_args()

    @staticmethod
    def start() -> None:
        """Load the configuration and start RPi Hub.

        :returns: ``None`` after the server stops.
        """
        arguments = RPiHub.parse_arguments()
        configuration = HubConfiguration(arguments.config)
        server = RPiHubServer(configuration)
        server.run()


if __name__ == "__main__":
    RPiHub.start()
