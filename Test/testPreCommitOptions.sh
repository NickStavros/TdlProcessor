#!/bin/bash
# ------------------------------------------------------------------------------
# PUBLIC
# ------------------------------------------------------------------------------
# ==============================================================
# Script: testPreCommitOptions.sh
# Description: This script tests pre-commit hooks by running
#              `pre-commit.sh` with different options and
#              logging the results.
# Author: R. W. "Nick" Stavros, Ph.D.
# ==============================================================

# ------------------------------------------------------
# Function: displayResults
# Description: Displays a summary of all test results.
# Output: Prints test statistics and results to the log.
# ------------------------------------------------------
# ------------------------------------------------------
# Function: setupEnvironment
# Description: Ensures the script is running in a Git repository.
# Output: Logs information about the repository setup.
# ------------------------------------------------------
setupEnvironment()
{ # Initialize and export Counters for test results
  export TOTAL_TESTS=0
  export SUCCESS_COUNT=0
  export FAIL_COUNT=0
  TEST_RESULTS=()
  # Define script name and pre-commit script location
  SCRIPT_NAME=$(basename "$0" .sh)
  PRE_COMMIT_SCRIPT_NAME="pre-commit.sh"
  # Ensure we are inside a Git repository before proceeding
  if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Not inside a Git repository. Exiting."
    exit 1
  fi
  # Find pre-commit.sh within the Git repository
  PRE_COMMIT_SCRIPT="$(find "$(git rev-parse --show-toplevel)" -type f -name "$PRE_COMMIT_SCRIPT_NAME" | head -n 1)"
  # Define log file and output directory (placing Output one level up from the test script)
  OUTPUT_DIR="$(dirname "$0")/../Output"
  mkdir -p "$OUTPUT_DIR"  # Ensure Output directory exists
  LOG_FILE="$OUTPUT_DIR/$SCRIPT_NAME.log"

  # Reset log file at the beginning of execution
  echo "-- Running $SCRIPT_NAME on $(date) -- Log File: $LOG_FILE" > "$LOG_FILE"
  echo "-- LOG_FILE set to: $LOG_FILE" | tee -a "$LOG_FILE"

} # End Function setupEnvironment

# ------------------------------------------------------
# Function: runTest
# Description: Runs a test case against the pre-commit hook.
# Parameters: 
#   $1 - Test name
#   $@ - Arguments passed to `pre-commit.sh`
# Output: Captures and logs the output, updates result counters.
# ------------------------------------------------------
runTest()
{ 
  local TEST_NAME="$1"
  shift
  ((TOTAL_TESTS++))

  # Define test-specific log file
  local TEST_LOG_FILE="$OUTPUT_DIR/test_${TOTAL_TESTS}_$(echo "$TEST_NAME" | tr ' ' '_').log"

  # Print test start information
  {
    echo "=========================================="
    echo "-- Starting Test #$TOTAL_TESTS: $TEST_NAME"
    echo "   Running: bash \"$PRE_COMMIT_SCRIPT\" $@"
  } | tee -a "$LOG_FILE"

  # Run the test and capture output in a temporary log
  {
    bash "$PRE_COMMIT_SCRIPT" "$@" 2>&1 
  } | tee "$TEST_LOG_FILE"

  EXIT_CODE=${PIPESTATUS[0]}  # Capture the actual exit code of pre-commit.sh

  # Evaluate test results and log appropriately
  if [[ $EXIT_CODE -eq 0 ]]; then
    TEST_STATUS="✅ Test #$TOTAL_TESTS: $TEST_NAME PASSED"
    ((SUCCESS_COUNT++))
  else
    TEST_STATUS="❌ Test #$TOTAL_TESTS: $TEST_NAME FAILED (EXIT_CODE=$EXIT_CODE)"
    ((FAIL_COUNT++))
  fi
  TEST_RESULTS+=("$TEST_STATUS")

  # Merge the test output into the main log
  {
    echo "$TEST_STATUS"
    cat "$TEST_LOG_FILE"
    echo "-- finishing Test #$TOTAL_TESTS: $TEST_NAME"
    echo "<Results of Running Individual Test #$TOTAL_TESTS>"
  } | tee -a "$LOG_FILE"

  # Clean up the temporary log
  rm -f "$TEST_LOG_FILE"

} # End Function runTest


displayResults()
{ echo -e "\n-- TEST SUMMARY --"             | tee -a "$LOG_FILE"
  echo "Total Tests Run    : $TOTAL_TESTS"   | tee -a "$LOG_FILE"
  echo "Successful Tests   : $SUCCESS_COUNT" | tee -a "$LOG_FILE"
  echo "Failed Tests       : $FAIL_COUNT"    | tee -a "$LOG_FILE"
  echo "----------------------------------"  | tee -a "$LOG_FILE"
  for result in "${TEST_RESULTS[@]}"; do
    echo "$result" | tee -a "$LOG_FILE"
  done
  echo "-- END OF TESTS --" | tee -a "$LOG_FILE"
} # End Function displayResults

runTests()
{ runTest "Help Message (-h)"                   -h
  runTest "Verbose Mode (-v)"                   -v
  runTest "Verbose Mode (-v)"                   -v false
  runTest "Display Config (-d)"                 -d
  runTest "Check Commit Message (-c)"           -c "commit-message.txt"
  runTest "Validate Metadata (-m)"              -m
  runTest "Specify Path for Validation (-p)"    -p "./"
  runTest "Perform Security Checks (-s)"        -s
  runTest "Run Specific Tool (-t shellcheck)"   -t "shellcheck"
  runTest "Combination: Verbose + Security (-v -s)" -v -s
  runTest "Combination: All Validations + Verbose (-a -v)" -a -v
  runTest "Invalid Option (--invalid)"         --invalid
  runTest "Run All Validations (-a)"           -a
} # End Function runTests

# =================================================================
# ---------- MAIN: Run Tests in a Non-Destructive Manner ----------
setupEnvironment
runTests
displayResults
