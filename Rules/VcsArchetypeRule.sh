#!/bin/bash

# DELETE THESE COMMENTS AFTER CREATION vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
# ============================================================================
#  VcsArchetypeRule.sh - Pre-commit Hook Archetype
# ============================================================================
# This file serves as a template for creating new pre-commit rules.
# Follow these steps to create a new rule from this archetype:
# 
# SETUP: These markers used within this Archetype. Take a moment to define
#        them before starting.
#  * <ruleName>
#  * <ruleTitle>
#  * <ruleDescription>
#  * <listOfExtensions>
#  * <companyName>
#  * <authors>
#  * <license>             (i.e., MIT)
#  * <nameOfProduct>
#  * <productURI>
#
# STEPS:
# 1. Copy this file and rename it for your new <ruleName>:
#    cd Rules/
#    cp VcsArchetypeRule.sh Vcs<ruleName>Rule.sh
#
# 2. Replace all instances of "<ruleName>" with the actual new <ruleName>.
#
# 3. Update the rule's purpose in "<ruleTitle>" and <ruleDescription>.
#
# 4. Modify JSON references in `setupEnvironment`:
#    - .pre_commit.rules.<ruleName>.enabled
#    - .pre_commit.rules.<ruleName>.extensions
#    - .pre_commit.rules.<ruleName>.exclude
#
# 5. Modify `processFile`, `processStagedFiles`, and `processBuffer` functions
#    to implement the new rule’s logic.
#
# 6. Ensure the rule's logic aligns with its intended function.
# 7. chmod +x Vcs<ruleName>Rule.sh
# DELETE THESE COMMENTS AFTER CREATION ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
# <ruleName> - <ruleTitle>
#
# This rule <ruleDescription>
#
# File Extensions Checked:
#   - <listOfExtensions>
#
# Configuration:
#   - `pre_commit.rules.<ruleName>.enabled` (boolean) - Enable or disable <ruleName>.
#   - `pre_commit.rules.<ruleName>.extensions` (array) - <listOfExtensions> to check.
#
# Usage:
#   ./Vcs_ruleName>Rule.sh --file <filename>
#   ./Vcs_ruleName>Rule.sh --staged
#   ./Vcs_ruleName>Rule.sh --setupEnvironment
#
# Author(s):
#   - <companyName>
#   - <authors>
#
# License: <license>
# ----------------------------------------------------------------------------

# ---------- Function: setupEnvironment
# Sets up the environment by loading shared functions, verbosity settings,
# and JSON configuration values.
function setupEnvironment
{ PostInfo "Starting setupEnvironment"
  local localReturnCode=0
  # Load shared functions
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
  source "$SCRIPT_DIR/common.sh"
  # Load verbosity settings and JSON config
  loadVerbositySettings
  loadJsonConfigValues
  # Default values to ensure they are always set
  RULE_EXTENSIONS=""
  EXCLUDED_PATTERNS=""
  # Check if rule is enabled
  TOOL_ENABLED=$(getJsonValueOrDefault ".pre_commit.rules.<ruleName>.enabled" "false" "<ruleName> Enabled")
  if [[ "$TOOL_ENABLED" != "true" ]]; then
    PostInfo "<ruleName> is disabled in pre_commit_config.json. Skipping execution."
    localReturnCode=1
  else
    # Get allowed extensions from pre_commit_config.json
    defaultExtensions=".default"
    RULE_EXTENSIONS=$(getJsonValueOrDefault ".pre_commit.rules.<ruleName>.extensions | join(\"\n\")" "$defaultExtensions" "<ruleName> Extensions")
    # Get excluded patterns from pre_commit_config.json
    defaultExclusions="excluded/"
    EXCLUDED_PATTERNS=$(getJsonValueOrDefault ".pre_commit.rules.<ruleName>.exclude | join(\"|\")" "$defaultExclusions" "<ruleName> Exclusions")
  fi
  if [[ "$localReturnCode" == 0 ]]; then
    ruleVerification
    localReturnCode=$?
  fi
  PostInfo "Finishing setupEnvironment ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function setupEnvironment

# ---------- Function: getRuleName
# Returns the full name of the Rule
getRuleName()
{ echo "<ruleName>"
} # End function getRuleName

# ---------- Function: getRuleTitle
# Returns the title of the rule.
getRuleTitle()
{ echo "<ruleTitle>"
} # End function getRuleTitle

# ---------- Function: showHelp
# Displays usage information for this rule.
function showHelp
{
  PostInfo "Starting showHelp"
  local localReturnCode=0
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -h, --help                 Show this help message
  --setupEnvironment         Check for dependencies and provide installation steps
  -f, --file <filename>      Run <ruleName> on a single file
  -s, --staged               Run <ruleName> on all staged <ruleName> files
  -s, --staged <files>       Run <ruleName> only on the specified staged files
  -b, --buffer <bufferText>  Run <ruleName> only on the specified Buffer

Examples:
  Run <ruleName> on all staged <listOfExtensions> files:
    $(basename "$0") --staged

  Run <ruleName> only on specific list of files:
    $(basename "$0") --staged <listOfFiles>

  If all specified files are excluded by configuration, the script will return an error.

Notes:
  - The script automatically excludes files and directories based on the configuration.
  - If no valid <ruleName> files are found after exclusions, it will return an error.  
EOF
  PostInfo "Finishing showHelp ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function showHelp

# ---------- Function: ruleVerification
# Checks if <ruleName> is installed. If not, provides installation instructions.
function ruleVerification
{ PostInfo "Starting ruleVerification"
  local localReturnCode=0
  if ! command -v shellcheck &> /dev/null; then
    PostErr "<ruleName> is not installed."
    cat <<EOF
To install <ruleName>, use one of the following:
  - macOS (Homebrew)      : brew install <nameOfProduct>
  - Linux (APT)           : sudo apt install <nameOfProduct>
  - Windows (Chocolatey)  : choco install <nameOfProduct>
  - Windows (Scoop)       : scoop install <nameOfProduct>
  - Arch Linux (Pacman)   : sudo pacman -S <nameOfProduct>
  - Fedora (DNF)          : sudo dnf install <ruleName>
More info: <productURI>
EOF
    localReturnCode=1
  fi
  PostInfo "Finishing ruleVerification ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function setupEnvironment

# ---------- Function: runCheck
# Runs <nameOfProduct> on the provided files.
# @param $@ List of files to check.
function runCheck
{ PostInfo "Starting runCheck"
  local localReturnCode=0
  if ! command -v <nameOfProduct> &> /dev/null; then
    PostWarn "<nameOfProduct> is not installed. Skipping."
    localReturnCode=1
  else
    PostInfo "Running <ruleName>..."
    <nameOfProduct> "$@"
    localReturnCode=$?
  fi
  PostInfo "Finishing runCheck ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function runCheck

# ---------- Function: processFile
# Processes a single file with <ruleName>.
# @param $1 The file to check.
function processFile
{ PostInfo "Starting processFile '$fileSpec'"
  local localReturnCode=0
  local fileSpec="$1"
  if [[ -n "$fileSpec" ]]; then
    runCheck "$fileSpec"
    localReturnCode=$?
  else
    PostErr "No file specified. processFile requires a valid filename."
    localReturnCode=1
  fi
  PostInfo "Finishing processFile ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processFile

# ---------- Function: processStagedFiles
# Processes all staged shell script files with <ruleName>.
# If a list of files is provided, only those files are checked.
# Otherwise, all staged files are checked.
# @param $@ (optional) List of specific files to check.
function processStagedFiles
{ PostInfo "Starting processStagedFiles"
  local localReturnCode=0
  local files
  if [[ $# -gt 0 ]]; then
    # User provided a list of files, apply exclusion filtering
    files=$(echo "$@" | tr ' ' '\n' | grep -Ev "($EXCLUDED_PATTERNS)" || true)
    PostInfo "Processing user-specified staged files (after exclusions): $files"
  else
    # Get all staged files and filter out excluded ones
    local pattern="$(echo "$SHELL_EXTENSIONS" | sed 's/ /\|/g')"
    files=$(git diff --cached --name-only | grep -E "($pattern)$" | grep -Ev "($EXCLUDED_PATTERNS)" || true)
  fi
  if [[ -n "$files" ]]; then
    PostInfo "Running <ruleName> on staged files..."
    IFS=$'\n' # Handle filenames with spaces
    for file in $files; do
      processFile "$file"
      localReturnCode=$(( localReturnCode || $? )) # Accumulate failures
    done
    unset IFS # Restore default IFS
  else
    PostInfo "No valid staged files found (after exclusions)."
    localReturnCode=1  # Set to 1 since no files were processed
  fi
  PostInfo "Finishing processStagedFiles ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processStagedFiles

# ---------- Function: processBuffer
# Handles buffer processing.
# If the rule supports buffer processing, it processes the provided bufferText.
# Otherwise, it reports that buffer processing is not supported.
# @param $1 The buffer text to process.
function processBuffer
{ PostInfo "Starting processBuffer"
  local localReturnCode=0
  local bufferText="$1"
  if [[ -z "$bufferText" ]]; then
    PostErr "No buffer text provided for processing."
    localReturnCode=1
  else
    TOOL_SUPPORTS_BUFFER=$(getJsonValueOrDefault ".pre_commit.rules.<ruleName>.supportsBuffer" "false" "<ruleName> Supports Buffer")
    if [[ "$TOOL_SUPPORTS_BUFFER" == "true" ]]; then
      echo "$bufferText" | <nameOfProduct> -
      localReturnCode=$?
    else
      PostErr "<ruleName> does NOT support buffers."
      localReturnCode=1
    fi
  fi
  PostInfo "Finishing processBuffer ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processBuffer

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
      processFile "$2"
      localReturnCode=$?
      ;;
    -s|--staged)
      processStagedFiles
      localReturnCode=$?
      ;;
    -b|--buffer)
      if [[ -z "$2" ]]; then
        PostErr "Error: No buffer text provided for --buffer option."
        localReturnCode=1
      else
        processBuffer "$2"
        localReturnCode=$?
      fi
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
# This is the only part of the Vsc<ruleName>Rule.sh that executes.
# The purpose is to read the command line arguments and process them.
# See showHelp for details.
PostInfo "Starting Vsc[#]<ruleName>Rule"
local localReturnCode=0
# Setup environment
setupEnvironment
localReturnCode=$?
if [[ $localReturnCode -ne 0 ]]; then
  PostErr "Setup failed or rule is disabled. Exiting Vsc[#]<ruleName>Rule."
  exit $localReturnCode
fi
# Process command-line options
processOptions "$@"
localReturnCode=$?
PostInfo "Finishing Check[#]<ruleName>Rule ReturnCode: $localReturnCode"
exit $localReturnCode
