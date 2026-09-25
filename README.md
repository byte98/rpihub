# RPi Hub

RPi Hub is a small FastAPI application serving the existing web interface and reading application definitions from a configured directory.

## Configuration

```ini
[server]
listen=0.0.0.0
port=8080

[hub]
root=path/to/directory
nested=true
```

`hub.root` may be absolute or relative to the current working directory.

## Running

```bash
python main.py
```

or:

```bash
python main.py /path/to/config.ini
```
