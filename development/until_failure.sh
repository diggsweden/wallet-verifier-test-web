#!/bin/bash

# SPDX-FileCopyrightText: 2025 The Wallet Test Verifier Web Authors
#
# SPDX-License-Identifier: CC0-1.0

#
# This scripts provides a way to run the same command repeateadly until it
# fails. It can be used to check the stability of test suites or individual
# tests. By default the given command is repeated 100 times.
#
#	# Rerun 'npm run test:once' until it fails or maximum 100 times
# 	./development/until_failure.sh 'npm run test:once'
#
#	# Same as above, but stop after ten iterations
# 	./development/until_failure.sh 'npm run test:once' 10
#
readonly command="$1"
readonly max="${2:-100}"

echo "Running command '$command' $max times or until failure"
for n in $(seq 1 "$max"); do
  echo "Attempt $n of $max"

  if $command; then
    echo 'Success!'
  else
    echo "Failed on attempt $n!"
    exit 1
  fi
done
echo "Tried $max times without failure."
