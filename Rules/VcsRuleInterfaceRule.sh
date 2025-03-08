#!/bin/bash

# ============================================================================
#  VcsRuleInterfaceRule.sh - Ensures VCS rule files conform to the required interface.
# ============================================================================
# This script verifies whether all VCS rules in the repository implement
# the expected interface functions.
#
# Functions checked:
#   - getRuleName
#   - getRuleTitle
#   - setupEnvironment
#   - processFile
#   - processStagedFiles
#   - processBuffer
#   - processOptions
#
# Usage:
#   ./VcsRuleInterfaceRule.sh --staged
#   ./VcsRuleInterfaceRule.sh --file <filename>
#
# Author: <Your Name / Company>
# License: MIT
# ============================================================================

# Set script and rules directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RULES_DIR="$PROJECT_ROOT/Rules"

# Load shared functions
source "$PROJECT_ROOT/common.sh" || { echo "Error: Failed to load common.sh"; exit 1; }

# Expected interface functions
EXPECTED_FUNCTIONS=(
  "getRuleName"
  "getRuleTitle"
  "setupEnvironment"
  "processFile"
  "processStagedFiles"
  "processBuffer"
  "processOptions"
)

# ---------- Function: showHelp
# Displays usage information for this rule.
function showHelp
{
  PostInfo "Starting showHelp"
  local localReturnCode=0
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -h, --help               Show this help message
  --setupEnvironment       Check for dependencies and provide installation steps
  -f, --file <filename>    Validate a specific rule file
  -s, --staged             Validate all staged VCS rule files

Validation Criteria:
  Each rule file **must** implement the following functions:
  - getRuleName          (Returns the full name of the rule)
  - getRuleTitle         (Returns the title/description of the rule)
  - setupEnvironment     (Handles initial setup for the rule)
  - processFile          (Processes a single file)
  - processStagedFiles   (Processes all staged files)
  - processBuffer        (Handles buffer input if applicable)
  - processOptions       (Handles command-line options)

Examples:
  Run validation on all staged VCS rules:
    $(basename "$0") --staged

  Validate a specific file:
    $(basename "$0") --file VcsSomeRule.sh
EOF
  PostInfo "Finishing showHelp ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function showHelp

# ---------- Function: setupEnvironment
# Ensures required dependencies are available.
function setupEnvironment
{
  PostInfo "Starting setupEnvironment"
  local localReturnCode=0
  if ! command -v grep &>/dev/null; then
    PostErr "grep is not installed or not available."
    localReturnCode=1
  fi
  PostInfo "Finishing setupEnvironment ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function setupEnvironment

# ---------- Function: validateRuleFile
# Checks if a given VCS rule file implements all expected functions.
# @param $1 The rule file to validate.
function validateRuleFile
{
  PostInfo "Starting validateRuleFile for $1"
  local localReturnCode=0
  local ruleFile="$1"

  # Ensure file exists
  if [[ ! -f "$ruleFile" ]]; then
    PostErr "Rule file $ruleFile not found."
    return 1
  fi

  # Check for required functions
  for functionName in "${EXPECTED_FUNCTIONS[@]}"; do
    if ! grep -q "function $functionName" "$ruleFile"; then
      PostErr "Error: Function '$functionName' is missing in $ruleFile"
      localReturnCode=1
    fi
  done

  PostInfo "Finishing validateRuleFile ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function validateRuleFile

# ---------- Function: validateStagedRules
# Checks all staged VCS rule files for compliance.
function validateStagedRules
{
  PostInfo "Starting validateStagedRules"
  local localReturnCode=0
  local stagedFiles

  # Get list of staged rule files
  stagedFiles=$(git diff --cached --name-only | grep -E "^Rules/Vcs.*Rule\.sh$" || true)

  if [[ -z "$stagedFiles" ]]; then
    PostInfo "No staged VCS rule files found."
    return 0
  fi

  # Validate each staged rule
  for ruleFile in $stagedFiles; do
    validateRuleFile "$PROJECT_ROOT/$ruleFile"
    localReturnCode=$(( localReturnCode || $? )) # Accumulate return codes
  done

  PostInfo "Finishing validateStagedRules ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function validateStagedRules

# ---------- Function: processOptions
# Processes command-line options and routes execution accordingly.
# @param $1 The first argument (option flag).
# @param $2 (optional) The second argument (filename if applicable).
function processOptions
{
  PostInfo "Starting processOptions"
  local localReturnCode=0

  case "$1" in
    -h|--help) 
      showHelp
      localReturnCode=$?
      ;;
    --setupEnvironment) 
      setupEnvironment
      localReturnCode=$?
      ;;
    -f|--file) 
      validateRuleFile "$2"
      localReturnCode=$?
      ;;
    -s|--staged)
      validateStagedRules
      localReturnCode=$?
      ;;
    *) 
      PostErr "Invalid option: $1. Use --help for usage."
      showHelp
      localReturnCode=1
      ;;
  esac

  PostInfo "Finishing processOptions ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processOptions

## =================================================================
# ---------- MAIN: ------------------------------------------------
# This is the only part of the script that executes.
# The purpose is to read the command-line arguments and process them.
PostInfo "Starting VcsRuleInterfaceRule"
local localReturnCode=0

# Setup environment
setupEnvironment
localReturnCode=$?
if [[ $localReturnCode -ne 0 ]]; then
  PostErr "Setup failed. Exiting VcsRuleInterfaceRule."
  exit $localReturnCode
fi

# Process command-line options
processOptions "$@"
localReturnCode=$?

PostInfo "Finishing VcsRuleInterfaceRule ReturnCode: $localReturnCode"
exit $localReturnCode
