#!/bin/bash
# ------------------------------------------------------------------------------
# NON-DESTRUCTIVE TEST SUITE FOR pre-commit.sh
# ------------------------------------------------------------------------------
# Ensures that pre-commit.sh runs on an existing repo structure
# without modifying tracked files or committing changes.
# ------------------------------------------------------------------------------

set -e  # Exit on first failure (for debugging, remove if needed)

# Load pre-commit script
PRE_COMMIT_SCRIPT="./pre-commit.sh"
CONFIG_FILE=".git/pre_commit_config.json"

# Test Counters
TOTAL_TESTS=0
SUCCESS_COUNT=0
FAIL_COUNT=0
TEST_RESULTS=()

# ---------- Function: Run Test and Capture Output ----------
runTest()
{ local TEST_NAME="$1"
  shift
  ((TOTAL_TESTS++))
  echo "-- Test #$TOTAL_TESTS: $TEST_NAME"
  echo "   Running: $PRE_COMMIT_SCRIPT $@"

  if bash "$PRE_COMMIT_SCRIPT" "$@" &> "test_output.log"; then
    TEST_RESULTS+=("✅ Test #$TOTAL_TESTS: $TEST_NAME PASSED")
    ((SUCCESS_COUNT++))
  else
    TEST_RESULTS+=("❌ Test #$TOTAL_TESTS: $TEST_NAME FAILED")
    ((FAIL_COUNT++))
    cat test_output.log  # Show failure details
  fi
} # End function runTest

# ---------- Function: Ensure Safe Test Environment ----------
ensureSafeTesting()
{ if [ ! -d ".git" ]; then
    echo "❌ ERROR: This test must be run inside a Git repository!"
    exit 1
  fi

  # Check if pre-commit script exists
  if [ ! -x "$PRE_COMMIT_SCRIPT" ]; then
    echo "❌ ERROR: pre-commit.sh is missing or not executable!"
    exit 1
  fi

  echo "-- SAFE TEST ENVIRONMENT DETECTED --"
} # End function ensureSafeTesting

# ---------- Function: Run All Tests Non-Destructively ----------
runAllTests()
{ runTest "Help Message (-h)" -h
  runTest "Display Config (-d)" -d
  runTest "Validate Commit Message (-c)" -c
  runTest "Run Metadata Checks (-m)" -m
  runTest "Run Security Checks (-s)" -s
  runTest "Run Automated Checks (-t)" -t
  runTest "Run All Checks (-a)" -a
} # End function runAllTests

# ---------- Function: Display Test Results ----------
displayResults()
{ echo -e "\n-- TEST SUMMARY --"
  echo "Total Tests Run    : $TOTAL_TESTS"
  echo "Successful Tests   : $SUCCESS_COUNT"
  echo "Failed Tests       : $FAIL_COUNT"
  echo "----------------------------------"
  for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
  done
  echo "-- END OF TESTS --"
} # End function displayResults

# ---------- MAIN: Run Tests in a Non-Destructive Manner ----------
ensureSafeTesting
runAllTests
displayResults
