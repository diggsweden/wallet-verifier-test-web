# wallet-verifier-test-web

[![Version](https://img.shields.io/github/v/tag/diggsweden/open-source-project-template?style=for-the-badge&color=green&label=Version)](https://github.com/diggswedenn/open-source-project-template/tags])
[![REUSE](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.reuse.software%2Fstatus%2Fgithub.com%2Fdiggsweden%2Fopen-source-project-template&query=status&style=for-the-badge&label=REUSE)](https://api.reuse.software/info/github.com/diggsweden/open-source-project-template)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jahwag/wallet-verifier-test-web/badge?style=for-the-badge)](https://scorecard.dev/viewer/?uri=github.com/diggsweden/wallet-verifier-test-web)
![Standard for Public Code Commitment](https://img.shields.io/badge/Standard%20for%20Public%20Code%20Commitment-green?style=for-the-badge)

## Quick Start

### Docker
```bash
npm install
npm run generate
docker compose -f ./docker/docker-compose.yml up -d
```
Open [http://localhost:3002](http://localhost:3002)

### Development
```bash
npm run dev
```

### Testing
```bash
npm run test        # watch mode
npm run test:once   # single run
```

### Full Wallet Ecosystem
See [docker/README.md](./docker/README.md) for running complete wallet ecosystem with issuer.

## Architecture

### Overview

Wallet verification system built with Nuxt.js 3 that bridges users and the EUDI verifier backend for credential verification.

### System Architecture

```mermaid
graph TB
    subgraph "Browser"
        UI[Web Interface<br/>Port 3002]
    end
    
    subgraph "Nuxt Application"
        Frontend[Frontend Pages<br/>Vue Components]
        ServerAPI[Server API<br/>Nitro Endpoints]
        Memory[(In-Memory<br/>Storage)]
    end
    
    subgraph "External Services"
        Backend[EUDI Backend<br/>Port 8080]
        Wallet[User's Digital<br/>Wallet<br/>Port 3000]
    end
    
    UI --> Frontend
    Frontend --> ServerAPI
    ServerAPI --> Backend
    ServerAPI --> Memory
    Wallet --> ServerAPI
    Backend --> Wallet
```

### Components

- **Frontend**: Vue pages (`pages/`) on port 3002
- **Server API**: Nitro endpoints (`/server/api/`) for backend communication
- **EUDI Backend**: External verifier service on port 8080

### Complete Verification Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ServerAPI
    participant Backend
    participant Wallet
    participant Memory

    User->>Frontend: Click "Login with wallet"
    Frontend->>ServerAPI: POST /api/verifier-request<br/>(presentation_definition)
    ServerAPI->>Backend: POST /ui/presentations<br/>(type, nonce, presentation_definition)
    Backend-->>ServerAPI: Response:<br/>transaction_id, request_uri, client_id
    ServerAPI-->>Frontend: Normalized response
    
    Frontend->>User: Show "Open wallet" button
    User->>Frontend: Click "Open wallet"
    Frontend->>Wallet: Redirect to http://localhost:3000/cb<br/>(wallet on port 3000)
    
    Note over Frontend: Start 90-second timer<br/>Start polling after 5s
    
    Wallet->>User: Request approval
    User->>Wallet: Approve/Reject
    
    alt User Approves
        Wallet->>ServerAPI: POST /api/verifier-callback<br/>(vp_token, state)
        ServerAPI->>Memory: Store verification result
        ServerAPI-->>Wallet: Success
    else User Rejects
        Note over Wallet: No callback sent
    end
    
    loop Every 2 seconds (max 45 times)
        Frontend->>ServerAPI: GET /api/verifier-status/{id}
        ServerAPI->>Backend: GET /ui/presentations/{id}
        
        alt Backend has result
            Backend-->>ServerAPI: vp_token (SD-JWT format)
            ServerAPI->>ServerAPI: Parse SD-JWT claims
        else Backend returns error/empty
            ServerAPI->>Memory: Check fallback storage
            alt Memory has result
                Memory-->>ServerAPI: Stored verification
            else No result yet
                ServerAPI-->>Frontend: {status: "pending"}
            end
        end
        
        ServerAPI-->>Frontend: Status + credentials
    end
    
    alt Success
        Frontend->>User: Show verified credentials
    else Timeout (90 seconds)
        Frontend->>User: Show timeout error
    else Verification Failed
        Frontend->>User: Show error message
    end
```



