# Express Server Proxy

This project is an Express server that acts as a proxy to fetch data from a specified target URL. It is built using TypeScript and includes CORS support.

## Project Structure

```
express-server
├── src
│   └── index.ts        # Main code for the Express server
├── package.json        # npm configuration file
├── tsconfig.json       # TypeScript configuration file
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (version 12 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd express-server
   ```

2. Install the dependencies:

   ```
   npm install
   ```

### Running the Server

To start the server, run the following command:

```
npm start
```

The server will be running on `http://localhost:3000`. You can make requests to the API using the `/api/*` endpoint, which will proxy requests to the target URL.

### API Usage

To use the proxy, send a GET request to:

```
http://localhost:3000/api/<your-endpoint>
```

This will fetch data from `http://157.230.240.97:9999/<your-endpoint>`.

### License

This project is licensed under the MIT License.