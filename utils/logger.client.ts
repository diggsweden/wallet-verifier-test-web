// SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

export interface ClientLogger {
  info: (message: string, data?: Record<string, any>) => void;
  debug: (message: string, data?: Record<string, any>) => void;
  warn: (message: string, data?: Record<string, any>) => void;
  error: (message: string, data?: Record<string, any>) => void;
}

export function createLogger(tag: string): ClientLogger {
  return {
    info: (message: string, data?: Record<string, any>) => {
      const output = { tag, level: "INFO", message, ...data };
      console.log(JSON.stringify(output));
    },
    debug: (message: string, data?: Record<string, any>) => {
      const output = { tag, level: "DEBUG", message, ...data };
      console.log(JSON.stringify(output));
    },
    warn: (message: string, data?: Record<string, any>) => {
      const output = { tag, level: "WARN", message, ...data };
      console.log(JSON.stringify(output));
    },
    error: (message: string, data?: Record<string, any>) => {
      const output = { tag, level: "ERROR", message, ...data };
      console.error(JSON.stringify(output));
    },
  };
}
