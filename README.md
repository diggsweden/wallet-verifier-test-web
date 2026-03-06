# wallet-verifier-test-web

[![REUSE](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.reuse.software%2Fstatus%2Fgithub.com%2Fdiggsweden%2Fwallet-verifier-test-web&query=status&style=for-the-badge&label=REUSE)](https://api.reuse.software/info/github.com/diggsweden/wallet-verifier-test-web)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/diggsweden/wallet-verifier-test-web/badge?style=for-the-badge)](https://scorecard.dev/viewer/?uri=github.com/diggsweden/wallet-verifier-test-web)
![Standard for Public Code Commitment](https://img.shields.io/badge/Standard%20for%20Public%20Code%20Commitment-green?style=for-the-badge)

Demo application demonstrating how a relying party may implement authentication using EUDI wallet verification.

## Quick Start

### Development

```bash
npm run dev
```

### Testing

```bash
npm run test        # watch mode
npm run test:once   # single run
```

### Docker Setup

```bash
./docker/run-ngrok.sh
```

Access the verifier at the ngrok URL displayed by the script.

## Architecture

```mermaid
graph TB
    subgraph "User's Browser"
        Frontend[Nuxt Frontend<br/>Port 3002]
    end
    
    subgraph "Server (Nuxt)"
        ServerAPI[Server API<br/>Nitro Endpoints]
        Memory[(In-Memory<br/>Storage)]
    end
    
    subgraph "External Services"
        Backend[EUDI Backend<br/>Port 8080]
        Wallet[Digital Wallet<br/>Port 3000]
    end
    
    Frontend <--> ServerAPI
    ServerAPI <--> Backend
    ServerAPI <--> Memory
    Wallet --> ServerAPI
    Wallet <--> Backend
    Frontend -.->|Redirect| Wallet
```

### Verification Flow

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
    Frontend->>Wallet: Redirect to http://localhost:3000/cb<br/>with client_id & request_uri
    
    Note over Frontend: Start 90-second timer<br/>Start polling after 5s
    
    Wallet->>Backend: GET /wallet/request.jwt/{requestId}
    Backend-->>Wallet: Signed JWT with presentation definition
    
    Wallet->>User: Request approval
    User->>Wallet: Approve/Reject
    
    alt User Approves
        Wallet->>ServerAPI: POST /api/verifier-callback<br/>(vp_token, state)
        ServerAPI->>Memory: Store verification result
        ServerAPI-->>Wallet: Success
    else User Rejects
        Note over Wallet: No callback sent
    end
    
    loop Every 2 seconds (max 90 seconds)
        Frontend->>ServerAPI: GET /api/verifier-status/democentralen/{id}
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
## Demo websites

This app contains multiple demo-pages to illustrate different scenarios
of claimed attributes from a wallet. Each web page are represented as a
*.vue file in the "pages" folder.

### Components

#### Start page

```
pages/index.vue
```

The index page is the default start page of the app. It contains links to
the sub-pages representing each relaying party web page used for demo .

#### Relaying party demo page

```
pages/vaccincentralen.vue
```

This web page represents the relaying party, designed to claim specific
attributes from the wallet for demo purposes.

#### Request attributes from wallet

```
server/api/verifier-status/vaccincentralen-request.post.ts
```

This file handles the claims request initiated by the relaying party demo page.

#### Poll for result

```
server/api/verifier-status/[site]/[id].ts
```

This is a generic handler for poll requests called by the relaying party
web page when waiting for the wallet request to be completed.

Path variables:
* site = name of the relaying party demo. Ex. "vaccincentralen"
* id = id of the claims request

### Add new relaying party demo page

Any number of new relaying party demo pages can be added to this web app.
Two files are specific for each demo page. For convenience, make a copy
of these existing files for vaccincentralen in the same location:

```
pages/vaccincentralen.vue
server/api/verifier-status/vaccincentralen-request.post.ts
```

Consider a preferable name of the new demo site. This name must be reflected in
file names and url references.

New files result example:

```
pages/<new-demo-site-name>.vue
server/api/verifier-status/<new-demo-site-name>-request.post.ts
```

Update title, content and url references in the new xxx.vue file appropriate
to the new-demo-site-name.

Update the set of attributes to be claimed by changing the request object in the
xxx-request.post.ts file. Expose/display the claimed attributes by add/edit
the on the
xxx.vue page.

Add a reference link from the start page to the new demo site page by modifying
index.vue. Just make a copy of an existing link section and change
the name and url reference accordingly.