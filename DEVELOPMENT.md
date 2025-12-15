# Development Guide

## Table of Contents

- [Setup and Configuration](#setup-and-configuration)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
  - [Available Commands](#available-commands)
  - [Code Quality](#code-quality)

## Setup and Configuration

### Prerequisites - Linux

1. Install [mise](https://mise.jdx.dev/) (manages linting tools):

   ```bash
   curl https://mise.run | sh
   ```

2. Activate mise in your shell:

   ```bash
   # For bash - add to ~/.bashrc
   eval "$(mise activate bash)"

   # For zsh - add to ~/.zshrc
   eval "$(mise activate zsh)"

   # For fish - add to ~/.config/fish/config.fish
   mise activate fish | source
   ```

   Then restart your terminal.

3. Install pipx (needed for reuse license linting):

   ```bash
   # Debian/Ubuntu
   sudo apt install pipx
   ```

4. Install project tools:

   ```bash
   mise install
   ```

### Prerequisites - macOS

1. Install [mise](https://mise.jdx.dev/) (manages linting tools):

   ```bash
   brew install mise
   ```

2. Activate mise in your shell:

   ```bash
   # For zsh - add to ~/.zshrc
   eval "$(mise activate zsh)"

   # For bash - add to ~/.bashrc
   eval "$(mise activate bash)"

   # For fish - add to ~/.config/fish/config.fish
   mise activate fish | source
   ```

   Then restart your terminal.

3. Install newer bash than macOS default:

   ```bash
   brew install bash
   ```

4. Install pipx (needed for reuse license linting):

   ```bash
   brew install pipx
   ```

5. Install project tools:

   ```bash
   mise install
   ```

### Quick Start

```shell
# Install all development tools
mise install

# Show all just tasks
just

# Setup shared linting tools
just setup-devtools

# Run all quality checks
just verify
```

## Development Workflow

### Available Commands

Run `just` to see all available commands. Key commands:

| Command | Description |
|---------|-------------|
| `just verify` | Run all checks (lint + test) |
| `just lint-all` | Run all linters |
| `just lint-fix` | Auto-fix linting issues |
| `just test` | Run tests |
| `just build` | Build project |
| `just clean` | Clean build artifacts |

#### Linting Commands

| Command | Tool | Description |
|---------|------|-------------|
| `just lint-commits` | conform | Validate commit messages |
| `just lint-secrets` | gitleaks | Scan for secrets |
| `just lint-yaml` | yamlfmt | Lint YAML files |
| `just lint-markdown` | rumdl | Lint markdown files |
| `just lint-shell` | shellcheck | Lint shell scripts |
| `just lint-shell-fmt` | shfmt | Check shell formatting |
| `just lint-actions` | actionlint | Lint GitHub Actions |
| `just lint-license` | reuse | Check license compliance |

#### Fix Commands

| Command | Description |
|---------|-------------|
| `just lint-yaml-fix` | Fix YAML formatting |
| `just lint-markdown-fix` | Fix markdown formatting |
| `just lint-shell-fmt-fix` | Fix shell formatting |

### Code Quality

Run all quality checks before submitting a PR:

```shell
# Run all checks
just verify

# Or run linting only
just lint-all

# Auto-fix where possible
just lint-fix
```

#### Quality Check Details

- **General Linting**: Shell, YAML, Markdown, GitHub Actions
- **Security**: Secret scanning with gitleaks
- **License Compliance**: REUSE tool ensures proper copyright information
- **Commit Structure**: Conform checks commit messages for changelog generation

#### Handling Failed Checks

If any checks fail in the CI pipeline:

1. Review the CI error logs
2. Run `just verify` locally to reproduce the issues
3. Make necessary fixes in your local environment
4. Update your Pull Request
5. Verify all checks pass in the updated PR
