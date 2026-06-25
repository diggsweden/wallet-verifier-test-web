// SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
//
// SPDX-License-Identifier: EUPL-1.2

import { createConsola, type ConsolaInstance, type LogObject } from "consola";

const OTEL_SEVERITY: Record<string, { number: number; text: string }> = {
  trace: { number: 1, text: "TRACE" },
  debug: { number: 5, text: "DEBUG" },
  verbose: { number: 5, text: "DEBUG" },
  log: { number: 9, text: "INFO" },
  info: { number: 9, text: "INFO" },
  success: { number: 9, text: "INFO" },
  start: { number: 9, text: "INFO" },
  ready: { number: 9, text: "INFO" },
  box: { number: 9, text: "INFO" },
  warn: { number: 13, text: "WARN" },
  error: { number: 17, text: "ERROR" },
  fail: { number: 17, text: "ERROR" },
  fatal: { number: 21, text: "FATAL" },
};

const otelJsonReporter = {
  log: (logObj: LogObject) => {
    const severity = OTEL_SEVERITY[logObj.type] ?? { number: 9, text: "INFO" };
    
    const timestamp = BigInt(new Date().getTime()) * BigInt(1_000_000);
    
    const message = logObj.message || (logObj.args?.[0] && typeof logObj.args[0] === 'string' ? logObj.args[0] : null) || '';
    const additionalArgs = logObj.args?.[1] && typeof logObj.args[1] === 'object' ? logObj.args[1] : {};
    
    const output = {
      timestamp: timestamp.toString(),
      severity_number: severity.number,
      severity_text: severity.text,
      body: message,
      resource: {
        service: {
          name: "wallet-verifier-test-web"
        }
      },
      attributes: {
        logger: logObj.tag,
        ...additionalArgs,
      },
    };
    
    console.log(JSON.stringify(output, null, 2));
  }
};

export function createLogger(tag: string): ConsolaInstance {
  return createConsola({
    level: process.env.LOG_LEVEL as any,
    reporters: [otelJsonReporter],
    formatOptions: {
      colors: false,
    },
  }).withTag(tag);
}
