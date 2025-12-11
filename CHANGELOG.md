# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.7] - 2025-12-11

### Changed

- Update justfile and reuseableci
- Pin sha and version
- Trim renovate, openssf
- Adjust settings
- Use base renovate config
- Use reuseable-ci v2
- Use reusable-ci v1
- Update dependency tailwindcss to v4.1.14 (#92)
- Update dependency typescript to v5.9.3 (#91)
- Update docker/login-action action to v3.6.0 (#90)

## [0.0.6] - 2025-09-22

### Added

- Add arm64 image, closes #81
- Add missing license headers

### Changed

- Merge pull request #87 from danneleaf/main
- Update dependency nuxt to v3.19.2 (#86)
- Set license as precondition to test
- Change old spdx header to modern
- Replace obsolete ci jobs, governance
- Update step-security/harden-runner action to v2.13.1 (#84)
- Update dependency nuxt-qrcode to v0.4.8 (#83)
- Merge pull request #82 from diggsweden/chore/backport-bump-node-image
- Version control node version for nvm
- Version control node version for asdf
- Print node version in Docker build
- Update vue ecosystem (#77)

## [0.0.5] - 2025-09-10

### Changed

- Merge pull request #80 from danneleaf/main

### Fixed

- Resolve bug that creates error when publishing through tag, closes #79

## [0.0.4] - 2025-09-10

### Added

- Add script for repeating the same command until failure
- Add specific claims in vp_token request
- Support same device redirect from wallet to verifier
- Add qr-code for cross-device flow
- Add version convention (#36)
- Add renovate (#21)
- Add simple test runner for Gitleaks rules
- Add Gitleaks test file
- Add more characters to Gitleaks rules
- Add missing newline at end of file
- Add ability to skip megalinter output sanitization
- Add ability to run test suite once
- Add note about WSL usage
- Add note about potential port conflicts
- Add note about wallet ecosystem
- Add instructions for docker group
- Add instructions for using WSL as dev environment
- Add note about Podman incompatibility
- Add instruction to copy proxy cert to docker dir
- Add Nexus variables to example proxy configuration
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add missing newline at end of file
- Add login and pid presentation

### Changed

- Merge pull request #76 from diggsweden/bugfix/backport-revert-nuxt-v4
- Update dependency nuxt to v4.1.1 (#75)
- Update dependency tailwindcss to v4.1.13 (#73)
- Update vue ecosystem (#72)
- Update dependency @nuxtjs/tailwindcss to v7.0.0-beta.1 (#71)
- Update vue ecosystem (#50)
- Update dependency happy-dom to v18 (#45)
- Merge pull request #70 from diggsweden/feat/specify-claims2
- Merge pull request #69 from diggsweden/fix/same-device-redirect-base-url
- Merge pull request #67 from diggsweden/feat/wallet-redirect
- Pin dependency nuxt-qrcode to 0.4.6 (#65)
- Merge pull request #66 from danneleaf/main
- Merge pull request #64 from danneleaf/feat/qr-code
- Pin dependencies (#25)
- Merge pull request #61 from diggsweden/feat/stricter-linting
- Configure stricter linting
- Merge pull request #63 from diggsweden/feat/direct_post_jwt2
- Use DirectPostJwt
- Merge pull request #60 from diggsweden/style/auto-format
- Apply automatic formatting
- Merge pull request #57 from diggsweden/chore/backport-general-changes-from-gitlab
- Merge pull request #56 from diggsweden/fix/ignore-vscode
- Adopt openid4vp 1.0.0 in eudi-backend 0.6.0 requiring dcql query (#52)
- Merge pull request #54 from diggsweden/fix/bump-node-image
- Apply autoformatting to renovate.json
- Update dependency vue-tsc to v2.2.12 (#51)
- Update vue ecosystem (#44)
- Update github actions (#47)
- Update dependency jose to v6.1.0 (#46)
- Update gradle docker tag to v8.14 (#42)
- Update dependency typescript to v5.9.2 (#41)
- Migrate config renovate.json
- Pin dependencies
- Update testing dependencies (#40)
- Update eclipse-temurin docker tag to v21.0.8_9-jre-alpine (#39)
- Update dependency tailwindcss to v4.1.12 (#35)
- Update dependency postcss to v8.5.6 (#34)
- Update dependency jose to v6.0.13 (#32)
- Pin dependencies (#31)
- Pin dependencies (#30)
- Pin dependencies (#29)
- Merge pull request #24 from diggsweden/feat/allow-custom-commit-lint-baseline
- Allow customization of commit lint baseline
- Merge pull request #23 from diggsweden/fix/npmrc-copyright-owner
- Extend commitlint length
- Merge pull request #19 from eric-thelin/fix/fetch-before-checkout-wallet-ecosystem
- Improve readme.md
- Update readme.md with architecture description
- Merge pull request #16 from eric-thelin/test/automated-gitleaks-test
- Feat/logout (#15)
- Merge pull request #13 from eric-thelin/feat/detect-digg-hosts-leakage
- Relax match for DIGG host names
- Detect puntuated e-mail addresses
- Make Gitleaks allow list stricter
- Use GitHub version of Megalinter
- Allow mention of ospo@digg.se
- Detect leakage of DIGG hostnames
- Merge pull request #14 from eric-thelin/feat/skip-megalinter-output-sanitization
- Wrap long lines for readability
- Merge pull request #11 from eric-thelin/test/test-verifier-status-on-mount
- Merge pull request #10 from eric-thelin/test/support-running-tests-once
- Merge pull request #9 from eric-thelin/perf/ignore-irrelevant-changes
- Reduce files included in build of custom-verifier
- Merge pull request #8 from eric-thelin/fix/support-digg-computer
- Describe how to fix file access errors
- Use actual port in instructions
- Reference WSL instructions from README
- Make all commands relative to repository root
- Document option for running in WLS on Digg
- Auto format

### Fixed

- Revert "chore(deps): update vue ecosystem (#50)"
- Revert "chore(deps): update vue ecosystem (#72)"
- Revert "chore(deps): update dependency nuxt to v4.1.1 (#75)"
- Format changes
- Prepend app_base_url to same device redirect
- Ignore linting errors in CHANGELOG.md
- Sync table of contents and actual contents
- Megalinter error
- Npm and test (#59)
- Copy proxy certificate together with node package files
- Move Dockerfile to standard location
- Ingore Visual Studio Code directory
- Update URL for status indicator (#55)
- Bump node image versions to 20-bullseye-slim
- Refine pin convention
- Update renovate (#33)
- Change copyright owner of .npmrc
- Fetch wallet-ecosystem before checkout
- Update /ui/presentations response field parsing to match docs
- Ignore Gitleaks error in removed WSL instructions
- Define v8.20.1 compatible allowlist
- Kotlin issues in latest commit by pinning to stable commit (#12)
- Check mapping of verifier status API response to display
- Fix tests to match current UI
- Quote command line arguments
- Allow custom verifier to run behind Digg proxy
- Honor wallet-frontend .env file
- Exclusively use Nexus or direct access for walt.id dependencies
- Pass Nexus parameters to EUDI verifier build
- Exclude EUDI verifier proxy cert from version control
- Run wallet enterprise verifier on non-conflicting port

### Removed

- Remove curl from image
- Remove ineffective Gitleaks rule
- Remove instructions for using WSL as dev environment
- Remove unnecessary empty proxy configuration
- Remove trailing whitespace
- Remove trailing whitespace
- Remove trailing whitespace
- Remove trailing whitespace

## [0.0.3] - 2025-06-13

### Changed

- Release v0.0.3

### Fixed

- Update publishimage.yml

## [0.0.2] - 2025-06-13

### Changed

- Release v0.0.2

### Fixed

- Publishimage.yml

## [0.0.1] - 2025-06-13

### Added

- Add github workflows

### Changed

- Release v0.0.1
- Merge pull request #5 from jahwag/main
- Initial commit

### Fixed

- Exclude false positive gitleak (#6)

[0.0.7]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.6..v0.0.7
[0.0.6]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.5..v0.0.6
[0.0.5]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.4..v0.0.5
[0.0.4]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.3..v0.0.4
[0.0.3]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.2..v0.0.3
[0.0.2]: https://github.com/diggsweden/wallet-verifier-test-web/compare/v0.0.1..v0.0.2

<!-- generated by git-cliff -->
