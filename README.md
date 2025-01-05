<br />
<img src="assets/images/logo-4x.png" width="80"/>

### Exxa Backtest API - Open-source Stock Trading Backtest API. 

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

An open-source backtest API server to test and validate trading algorithms using historical stock market data. 

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started): For containerized application management.
- [Make](https://www.gnu.org/software/make/): To use the `Makefile` for streamlined commands.

---

## Getting Started

Clone the repository to your local machine:

```bash
git clone git@github.com:ExxaHub/exxa-backtest-api.git
cd exxa-backtest-api
```

## Usage
This project uses a Makefile to simplify running the application. Below are the available commands:

### Start the Application
To build and run the application in a Docker container, use the make up command:

```bash
make up
```

This will:

Build the necessary Docker images (if they do not exist).
Start the application in the appropriate Docker containers.

### Stop the Application
To stop the application and remove associated containers, use:

```bash
make down
```

Additional Commands
You can find other useful commands in the Makefile, such as:

## License
This project is licensed under the [AGPL-3.0](./LICENSE) License.
Feel free to use, modify, and distribute this project as per the license terms.

## Support
If you have any questions, feel free to open an issue or contact the maintainers.

