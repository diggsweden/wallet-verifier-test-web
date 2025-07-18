# wallet-verifier-test-web

[![Version](https://img.shields.io/github/v/tag/diggsweden/open-source-project-template?style=for-the-badge&color=green&label=Version)](https://github.com/diggswedenn/open-source-project-template/tags])
[![REUSE](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.reuse.software%2Fstatus%2Fgithub.com%2Fdiggsweden%2Fopen-source-project-template&query=status&style=for-the-badge&label=REUSE)](https://api.reuse.software/info/github.com/diggsweden/open-source-project-template)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jahwag/wallet-verifier-test-web/badge?style=for-the-badge)](https://scorecard.dev/viewer/?uri=github.com/diggsweden/wallet-verifier-test-web)
![Standard for Public Code Commitment](https://img.shields.io/badge/Standard%20for%20Public%20Code%20Commitment-green?style=for-the-badge)

## Run with Docker

```bash
npm install
npm run generate
docker compose  -f ./docker/docker-compose.yml up -d
```

Then open [http://localhost:3002](http://localhost:3002) in your browser.

**Note:** If you see file access errors when running the `npm` commands,
please try changing the owner of those files.

```bash
sudo chown -R $USER:$USER node_modules/ megalinter-reports/
```

## Wallet ecosystem

In order to test the verifier with a complete environment
including a wallet and an issuer, we provide
[a script that runs the wwWallet ecosystem locally](
    ./docker/scripts/wallet-ecosystem-http.sh
).
Please see [the readme in the docker directory](./docker/README.md)
for details.

## Live Development

After starting Docker (see above), run:

```bash
npm run dev
```

Visit [http://localhost:3002](http://localhost:3002) in your browser.

**Note:** If you ran the docker compose command [above](#run-with-docker)
or bootstrapped your you development environment using
[the Wallet ecosystem script](./docker/scripts/wallet-ecosystem-http.sh),
there will probably already be a service running on port 3002.
Pay attention to the build output for the actual port used.

**Note:** If you are running the environment in WSL
but access the frontends using a web browser directly on your Windows host,
you may need to modify the location of the backend.

```bash
env HOST_API=http://localhost:8080 npm run dev
```

## Running tests

To run the automated test suite, run:

```bash
npm run test
```

**Note:** On a development machine,
the above will start the tests in watch mode.
That is, the tests will rerun automatically on any file change.

To run the test suite only once, run:

```bash
npm run test:once
```
