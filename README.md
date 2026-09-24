# RPi Hub

A small FastAPI application which serves the existing RPi Hub frontend and reads application definitions from a configured directory.

## Configuration

The server accepts an optional INI path as its first command-line argument. If omitted, `config.ini` in the current working directory is used.

```ini
[server]
listen=0.0.0.0
port=8080

[hub]
root=path/to/directory
nested=true
```

`hub.root` may be absolute or relative to the current working directory. When `nested` is enabled, JSON files are searched recursively.

## Running

```bash
python main.py
```

or:

```bash
python main.py /path/to/config.ini
```

The project requires Python 3.11+ and the packages in `requirements.txt`.

## Application definitions

Each `.json` file represents one application. `name` and `description` are language dictionaries. `_` is the fallback language value.

Application icons can be paths inside the configured hub root. Relative icon paths are resolved relative to the directory containing the JSON definition.

## API

- `GET /api/applications` — application definitions
- `GET /api/languages` — supported languages and language-base version
- `GET /api/languages/{code}` — language phrases
- `GET /api/assets/{path}` — application assets inside the configured hub root
