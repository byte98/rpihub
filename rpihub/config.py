"""Configuration handling for RPi Hub."""

# rpihub - simple RaspberryPi hub for other programs
# Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>

from __future__ import annotations

from configparser import ConfigParser
from pathlib import Path


class HubConfiguration:
    """Represents the complete RPi Hub configuration."""

    def __init__(self, path: Path):
        """Create a configuration from an INI file.

        :param path: Path to the configuration file.
        :raises FileNotFoundError: If the configuration file does not exist.
        :raises NotADirectoryError: If the configured hub root is not a directory.
        :raises ValueError: If a configuration value is invalid.
        """
        self.path = path.resolve()
        self.config = self._load(self.path)
        self.listen = self.config.get("server", "listen", fallback="0.0.0.0")
        self.port = self.config.getint("server", "port", fallback=8080)
        self.root = self._resolve_root(self.config.get("hub", "root", fallback="."))
        self.nested = self._parse_bool(
            self.config.get("hub", "nested", fallback="true"),
            "hub.nested",
        )
        if not self.root.is_dir():
            raise NotADirectoryError(f"Configured hub root does not exist: {self.root}")

    @staticmethod
    def _load(path: Path) -> ConfigParser:
        """Load an INI file using UTF-8 encoding.

        :param path: Path to the INI file.
        :returns: Parsed configuration object.
        :raises FileNotFoundError: If the configuration file does not exist.
        """
        config = ConfigParser()
        if not path.is_file():
            raise FileNotFoundError(f"Configuration file does not exist: {path}")
        config.read(path, encoding="utf-8")
        return config

    @staticmethod
    def _parse_bool(value: str, option: str) -> bool:
        """Convert a textual INI boolean into a Python boolean.

        :param value: Textual boolean value.
        :param option: Configuration option name used in error messages.
        :returns: Parsed boolean value.
        :raises ValueError: If the value is not a supported boolean literal.
        """
        normalized = value.strip().lower()
        if normalized in {"true", "yes", "1", "on"}:
            return True
        if normalized in {"false", "no", "0", "off"}:
            return False
        raise ValueError(f"Invalid boolean value for {option}: {value}")

    @staticmethod
    def _resolve_root(value: str) -> Path:
        """Resolve an absolute or working-directory-relative hub root.

        :param value: Configured root path.
        :returns: Absolute, normalized hub-root path.
        """
        root = Path(value).expanduser()
        if not root.is_absolute():
            root = Path.cwd() / root
        return root.resolve()
