#!/bin/bash
# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
#  VcsRules.sh - Identify and Execute Rule with processStagedFiles
# 
# This script finds all pre-commit rules in the Rules/ directory
# that define the function processStagedFiles, builds a sorted list,
# and executes them with appropriate options.
#
# Usage:
#   ./VcsRules.sh
#
# Author(s):
#   - Dido Solutions Inc.
#   - R. W. "Nick" Stavros, Ph.D.
#   - Hamish I. MacCloud, AIA
#
# License: MIT
# ----------------------------------------------------------------------------

# ---------- Function: setupEnvironment
# Sets up the environment by locating and loading common.sh, verbosity settings, and JSON config.
function setupEnvironment
{ 
  local currentDir
  currentDir="$(pwd)"
  local foundProjectDirectory=false
  
  # Traverse up the directory tree until a .git directory or pre_commit_config.json is found
  while [[ "$currentDir" != "/" ]]; do
    if [[ -d "$currentDir/.git" || -f "$currentDir/Data/pre_commit_config.json" ]]; then
      foundProjectDirectory=true
      break  # Stop searching once the project root is found
    fi
    currentDir="$(dirname "$currentDir")"  # Move up one level
  done

  # If the project root was not found, exit with an error
  if [[ "$foundProjectDirectory" == "false" ]]; then
    echo "❌ Error: Could not find project root. Ensure you have a .git directory or Data/pre_commit_config.json." >&2
    return 1
  fi

  # Set PROJECT_ROOT and RULES_DIR
  PROJECT_ROOT="$currentDir"
  RULES_DIR="$PROJECT_ROOT/Rules"

  # Locate common.sh
  if [[ -f "$RULES_DIR/common.sh" ]]; then
    # The following is a shellcheck directive.
    # shellcheck source=/absolute/path/to/common.sh
    COMMON_SH_PATH="$RULES_DIR/common.sh"
  elif [[ -f "$PROJECT_ROOT/common.sh" ]]; then
    COMMON_SH_PATH="$PROJECT_ROOT/common.sh"
  else
    echo "❌ Error: common.sh not found in expected locations." >&2
    return 1
  fi
  # Load shared functions BEFORE using PostInfo, PostErr, etc.
  # The following is a shellcheck directive.
  # shellcheck disable=SC1090,SC1091  # Dynamic path; cannot specify absolute path
  source "$COMMON_SH_PATH" || { echo "❌ Error: Failed to load common.sh"; exit 1; }

  # Check if common.sh was loaded successfully
  if ! declare -F PostInfo &>/dev/null; then
    echo "❌ Error: common.sh did not load correctly. Exiting." >&2
    exit 1
  fi

  # Load verbosity settings and JSON config
  loadVerbositySettings
  loadJsonConfigValues

  # Retrieve rule-specific configuration
  RULE_ENABLED=$(getJsonValueOrDefault ".pre_commit.rules.shellcheck.enabled" "false" "shellcheck")
  
  if [[ "$RULE_ENABLED" != "true" ]]; then
    PostInfo "VcsShellCheckRule is disabled in pre_commit_config.json. Skipping execution."
    return 1
  fi

  # Get allowed extensions from pre_commit_config.json
  defaultExtensions=".sh"
  SHELL_EXTENSIONS=$(getJsonValueOrDefault ".pre_commit.rules.shellcheck.extensions | join(\"\\n\")" "$defaultExtensions" "ShellCheck Extensions")
  export SHELL_EXTENSIONS

  # Get excluded patterns from pre_commit_config.json
  defaultExclusions="tests/ scripts/legacy/"
  EXCLUDED_PATTERNS=$(getJsonValueOrDefault ".pre_commit.rules.shellcheck.exclude | join(\"|\")" "$defaultExclusions" "ShellCheck Exclusions")
  export EXCLUDED_PATTERNS

  # Run rule verification if setup was successful
  ruleVerification
  local localReturnCode=$?
  
  PostInfo "Finishing setupEnvironment ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function setupEnvironment



# ---------- Function: getRuleList
# Gathers a sorted list of rules that define processStagedFiles.
function getRuleList
{ PostInfo "Gathering list of rules with processStagedFiles..."
  PostDebug "RULES_DIR: $RULES_DIR"
  STAGED_FILES_RULES=()
  for rule in "$RULES_DIR"/Vcs*Rule.sh; do
    echo "rule: $rule"
    if grep -q "function processStagedFiles" "$rule"; then
      # Extract the rule name from the filename
      RULE_FILE_NAME=$(basename "$rule")
      RULE_NAME=$(echo "$RULE_FILE_NAME" | sed -E 's/^Vcs(.*)Rule\.sh$/\1/')
      echo "RULE_FILE_NAME: $RULE_FILE_NAME"
      echo "RULE_NAME: $RULE_NAME"
      # Extract short description from the rule file
      RULE_TITLE=$(grep -m 1 "# ----------------------------------------------------------------------------" "$rule" -A 3 | tail -n 1 | sed 's/# //')
      if [[ -z "$RULE_TITLE" ]]; then
        RULE_TITLE="No description available"
      fi
      STAGED_FILES_RULES+=("$RULE_FILE_NAME|$RULE_NAME|$RULE_TITLE")
    fi
  done
  # Sort rules by rule name
  IFS=$'\n' read -r -d '' -a STAGED_FILES_RULES < <(printf '%s\0' "${STAGED_FILES_RULES[@]}" | sort -z)
  unset IFS
} # End Function getRuleList

# ---------- Function: displayRuleList
# Displays the list of rules with their name and description.
function displayRuleList
{ PostInfo "Starting displayRuleList"
  if [[ ${#STAGED_FILES_RULES[@]} -gt 0 ]]; then
    PostInfo "Rules with processStagedFiles defined:"
    printf "%-30s | %-20s | %-50s\n" "Rule File Name" "Rule Name" "Rule Title"
    printf "%-30s | %-20s | %-50s\n" "------------------------------" "--------------------" "--------------------------------------------------"
    for entry in "${STAGED_FILES_RULES[@]}"; do
      IFS='|' read -r ruleFile ruleName desc <<< "$entry"
      printf "%-30s | %-20s | %-50s\n" "$ruleFile" "$ruleName" "$desc"
    done
  else
    PostWarn "No rules found with processStagedFiles defined."
  fi
  PostInfo "Finishing displayRuleList"
} # End Function displayRuleList

# ---------- Function: executeRule
# Executes the specified rule with appropriate options.
# @param $1 Rule file name
# @param $2 Rule name
# @param $3 Rule description
function executeRule
{ PostInfo "Executing rule: $2 ($1)"
  PostInfo "Title: $3"
  
  local localReturnCode=0
  local rulePath="$RULES_DIR/$1"
  
  if [[ -x "$rulePath" ]]; then
    # Uncomment this when ready to execute:
    PostInfo "Running: $rulePath --staged"
    "$rulePath" --staged
    localReturnCode=$?
  else
    PostWarn "$1 is not executable. Skipping."
    localReturnCode=1
  fi
  
  PostInfo "Finished executing $2 with ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function executeRule

# Main execution
setupEnvironment
PostInfo "######"
getRuleList
displayRuleList
PostInfo "#####"

# Execute each rule
# PostInfo "Starting executingRules"
# for entry in "${STAGED_FILES_RULES[@]}"; do
#   IFS='|' read -r ruleFile ruleName ruleDesc <<< "$entry"
#   executeRule "$ruleFile" "$ruleName" "$ruleDesc"
# done
# PostInfo "Finish executingRules"
