# ![logo of RPi Hub](https://github.com/byte98/rpihub/blob/master/rpihub/static/rpihub.png)RPi Hub

RPi Hub is a small FastAPI application serving the existing web interface and reading application definitions from a configured directory. The whole application is intended to be installed on Raspberry Pi.

| Table of contents                                              |
| ---------------------------------------------------------------|
| [1. Installation](#installation)                               |
| [1.1. Project download](#1-project-download)                   |
| [1.2. Dependencies installation](#2-dependencies-installation) |
| [2. Configuration](#configuration)                             |
| [3. Application start](#application-start)                     |
| [4. Subapplication syntax](#subapplication-syntax)             |
| [5. Additional notes](#additional-notes)                       |

## Installation
Application needs Python 3 to run. This comes ussualy preinstalled on most distributions of operating systems for Raspberry Pi. Following steps assumes, that you have Python 3 installed on your system.

### 1. Project download
The easiest way for getting the project to your device is clonning the whole repository.
```bash
mkdir /path/to/the/project
cd /path/to/the/project
git clone https://github.com/byte98/rpihub.git
```
Instead of `/path/to/the/project`, use any path, from where you want to project to run.

### 2. Dependencies installation
The project relies on some external dependencies. The complete list is provided in [`requirements.txt`](https://github.com/byte98/rpihub/blob/master/requirements.txt). To install all of those, the tool **`pip`** can be used.
```bash
pip install -r requirements.txt
```

Now, the project is ready to run.

## Configuration
All of the configuration is expected in `.ini` file. This file can be located anywhere. Following table contains all possible configuration options.
| Section     | Name      | Description                                                                                                                                                                                                                                      |
|-------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `[server]`  | `listen`  | Address, from which application will accept requests (*for example - value `0.0.0.0` means, that application will accept requests from any address; value `127.0.0.1` means, that application will accept requests from the local machine only*) |
| `[server]`  | `port`    | Port, on which application will listen for requests. On this port, no other application must run.                                                                                                                                                |
| `[hub]`     | `root`    | Path to directory, where application will browse for `.json` files.                                                                                                                                                                              |
| `[hub]`     | `nested`  | Flag, whether application should look for `.json` files also in all nested directories (`true`) or only in directory set as `root` directory (`false`).                                                                                          |

Example of the configuration `.ini` file is provided below.
```ini
[server]
listen=0.0.0.0
port=8080

[hub]
root=/home
nested=true
```
This example configuration will make application to accept requests from all addresses (`listen=0.0.0.0`) on port `8080` (`port=8080`). Application will browse home directory (`root=/home`) including all nested directories(`nested=true`).

## Application start
With existing `.ini` configuration file, application can be started. Application can be started without any paarameter using following command.
```bash
python /path/to/the/project/rpihub/main.py
```
Instead of `/path/to/the/project`, please use your actual directory, where you have downloaded the project.
 > Start without any parameter expects `.ini` configuration file to be located in **`/path/to/the/project/rpihub/config.ini`**.

 Another option is to start the application with provided path to the configuration `.ini`file.
 ```bash
 python /path/to/the/project/rpihub/main.py /path/to/the/configuration/my.ini
 ```
 Where `/path/to/the/project` is your directory, where you ave downloaded ther project and `/path/to/the/configuration/my.ini` is actual path to the configuration file.

 ## Subapplication syntax
 The whole purpose of this application is to provide menu with subapplications. Those subapplications are gathered from configured directory `.json` files (*see [configuration](#configuration)*). Syntax of this `.json` file can be found below.
 ```json
 {
    "name": {
        "_default": "Default name of the subapplication",
        "en": "English name of the subapplication",
        "es": "Nombre en español de la subaplicación",
        "fr": "Nom de l'sous-application française",
        "pl": "Polska nazwa subaplikacji",
        "de": "Name der deutschen Sub-App",
        "cs": "Český název subaplikace",
        ...
    },
    "description": {
        "_default": "Default description of the subapplication.",
        "en": "English description of the subapplication.",
        "es": "Descripción de la subaplicación en español.",
        "fr": "Description française de la sous-application.",
        "de": "Deutsche Beschreibung der Sub-App.",
        "pl": "Polski opis subaplikacji.",
        "cs": "Český popis subaplikace."
        ...
    },
    "target": "/myapp",
    "icon": "./icon.png",
    "accentColor": "#700478"
}
 ```

 ## Additional notes
The application supports PWA, although this needs to hide application behin web-server and enabling SSL. This is not explained here, as it is well out of scope of this documentation. 
Also, it is worth to make this application as a service for automatic start after device start. This is also out of scope of this documentation.


---
Made with ❤️ in 🇪🇺 by [Jiri Skoda](mailto:developer@skodaj.cz).