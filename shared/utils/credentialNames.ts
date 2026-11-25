// SPDX-FileCopyrightText: 2026 Digg - Agency for Digital Government
//
// SPDX-License-Identifier: EUPL-1.2

interface NameClaims {
  family_name?: string;
  given_name?: string;
}

const normalise = (value: string | undefined): string =>
  (value ?? "").normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("sv");

/**
 * True when both credentials carry a name and the names are the same.
 *
 * Nothing in the protocol links an attestation to the PID it was issued for.
 * The relying party can only compare the claims they have in common, and names
 * are not unique, so a match is not proof that it is the same person.
 */
export function namesMatch(pid?: NameClaims, attestation?: NameClaims): boolean {
  const pidFamily = normalise(pid?.family_name);
  const pidGiven = normalise(pid?.given_name);
  if (!pidFamily || !pidGiven) return false;
  return (
    pidFamily === normalise(attestation?.family_name) &&
    pidGiven === normalise(attestation?.given_name)
  );
}
