<div align="center">
<a href="https://www.exxahub.com/">
  <img src="assets/images/exxa-logo-2x.png" height="60"/>
</a>

### ExxaHub Backtest API - Open-source Stock Trading Backtest API. 

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![License](https://img.shields.io/badge/website-exxahub.com-orange.svg)](https://www.exxahub.com/)

An open-source backtest API server to test and validate trading algorithms using historical stock market data. 

</div>

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Market Data Providers](#market-data-providers)
- [API Collection](#api-collection)
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
git clone git@github.com:ExxaHub/exxahub-backtest-api.git
cd exxahub-backtest-api
```

Create a local .env file from the example

```bash
cp .env.example .env
```

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

### Additional Commands
You can find other useful commands in the Makefile, such as:

`make destroy` - Remove Docker volumes and resources (including the database)

---

## Usage

After running the `make up` command, the backtest server will be accessible at http://localhost:3000

### Running backtests

The backtest endpoint is located at `POST /api/v1/backtests`. 

The payload for the request must match the following format:

```json
{
  "starting_balance": 10000,
  "start_date": "2024-01-02",
  "end_date": "2025-01-02",
  "trading_bot": { /* trading bot JSON */ }
}
```

### Symphony Adapter

The ExxaHub Backtest API provides an API endpoint to convert Composer Symphonies to the ExxaHub Trading Bot algorithm format. The symphony adapter endpoint is located at `POST /api/v1/adapters/symphony`. The endpoint will accept a Composer Symphony JSON payload and convert it to the ExxaHub Trading Bot JSON format, which is compatible with the backtest endpoint.

The following Symphony node types are supported:
- Asset
- Group
- Weight (Allocation)
- If/Else (Conditional)

⚠️ Note: The Filter node type is not supported by ExxaHub at this time because some of the functions that Composer allows you to sort on are not normalized, so it would be impossible to build an apples-to-apples comparison when sorting on certain sub-symphonies.

## Market Data Providers

The ExxaHub Backtest API supports the following providers

- [x] Alpaca
- [x] Tiingo
- [x] Polygon.io

You can configure which data provider to load market data from by configuring the `MARKET_DATA_PROVIDER` env variable in your `.env` file.

Depending on which Market Data Provider you have configured, you'll also need to set your API key credentials specific to that provider.

```bash
# Available values: alpaca | tiingo | polygon
MARKET_DATA_PROVIDER=alpaca

# Required if MARKET_DATA_PROVIDER=alpaca
ALPACA_API_KEY_ID=
ALPACA_API_SECRET_KEY=

# Required if MARKET_DATA_PROVIDER=tiingo
TIINGO_API_KEY=

# Required if MARKET_DATA_PROVIDER=polygon
POLYGON_API_KEY=
```

## API Collection

This project uses [Bruno](https://www.usebruno.com/), an open source API Client to document the API endpoints. 

Once you have downloaded Bruno, you can open the API collection which is located at `src/api/collection/exxa` (you'll see a `bruno.json` file)

---

## License
This project is licensed under the [AGPL-3.0](./LICENSE) License.
Feel free to use, modify, and distribute this project as per the license terms.

## Support
If you have any questions, feel free to open an issue or contact the maintainers.

