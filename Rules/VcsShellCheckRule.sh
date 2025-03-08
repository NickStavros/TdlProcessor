#!/bin/bash

# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
# ${ruleName} - Shell Script Linter for Pre-Commit Hooks
#
# This rule runs ShellCheck on shell scripts before commits.
# It ensures that shell scripts follow best practices and are free from errors.
#
# File Extensions Checked:
#   - The list of extensions is configurable in `pre_commit_config.json`.
#   - Defaults to `.sh` if not specified.
#
# Configuration:
#   - `pre_commit.rules.${nameOfProduct}.enabled` (boolean) - Enable or disable ShellCheck.
#   - `pre_commit.rules.${nameOfProduct}.extensions` (array) - List of file extensions to check.
#
# Usage:
#   ./${ruleName}.sh --file <filename>
#   ./${ruleName}.sh --staged
#   ./${ruleName}.sh --setupEnvironment
#
# Author(s):
#   - Dido Solutions Inc.
#   - R. W. "Nick" Stavros, Ph.D.
#   - Hamish I. MacCloud, AIA
#
# License: MIT
# ----------------------------------------------------------------------------

# ---------- Function: defineRuleConstants
# Defines the rule specific variables for use throughout the rest of the
# script. 
function defineRuleConstants() 
{ #  Rule Constants
  ruleHandle="ShellCheck"
  ruleName="Vcs${ruleHandle}Rule"
  ruleTitle="Shell Script Linter for Pre-Commit Hooks"
  ruleDescription="Runs $ruleHandle on shell scripts before commits."
  listOfExtensions=".sh .bash .ksh"
  companyName="Dido Solutions Inc."
  authors="R. W. 'Nick' Stavros, Ph.D., Hamish I. MacCloud, AIA"
  license="MIT"
  nameOfProduct="shellcheck"
  productURI="https://www.${nameOfProduct}.net/"
  
  # Namespace for JSON keys
  NAME_SPACE=".pre_commit.rules.${nameOfProduct}"
} # End Function defineRuleConstants

# ---------- Function: findProjectRoot
# Determines the project root by traversing up the directory tree 
# until a .git directory or Data/pre_commit_config.json is found.
#
# Usage:
#   projectRoot=$(findProjectRoot)
#
# Returns:
#   - The absolute path of the project root if found.
#   - Prints an error and returns 1 if no project root is found.
#
# Notes:
#   - This function is critical for locating common.sh and configurations.
#   - It should be called before loading shared functions.
findProjectRoot()
{ local currentDir
  currentDir="$(pwd)"  # Assign after declaration
  while [[ "$currentDir" != "/" ]]; do
    if [[ -d "$currentDir/.git" || -f "$currentDir/Data/pre_commit_config.json" ]]; then
      echo "$currentDir"
      return 0
    fi
    currentDir="$(dirname "$currentDir")"  # Move up one level
  done
  echo "[ERROR] : Could not find project root. Ensure you have a .git directory or Data/pre_commit_config.json." >&2
  return 1
} # End Function findProjectRoot

# ---------- Function: findAndLoadCommon
# Locates the common.sh script, sources it, and verifies the availability of required functions.
#
# This function searches for `common.sh` in the expected locations (`$RULES_DIR` and `$PROJECT_ROOT`),
# sources it, and ensures that required functions (e.g., `PostInfo`, `PostErr`) are properly loaded.
#
# Usage:
#   findAndLoadCommon || return 1
#
# Expected Locations:
#   - $RULES_DIR/common.sh
#   - $PROJECT_ROOT/common.sh
#
# Behavior:
#   - If `common.sh` is found, it is sourced.
#   - If `common.sh` is missing, an error message is displayed and the function returns with an error.
#   - If `common.sh` fails to load properly, the script exits with an error.
#
# Output Example:
#   [ERROR]: common.sh not found in expected locations.
#   [ERROR]: Failed to load common.sh
#
# Returns:
#   - 0 on success
#   - 1 if `common.sh` is not found
#   - Exits if `common.sh` fails to load correctly
#
# Dependencies:
#   - Requires `source` to load `common.sh`
#   - Expects `PostInfo` and `PostErr` functions to be defined in `common.sh`
#
# Notes:
#   - This function is typically called early in `setupEnvironment` to ensure logging functions are available.
#   - If `common.sh` is not properly loaded, the script **cannot** proceed safely.
findAndLoadCommon()
{ local commonFileName="common.sh"
  if [[ -f "$RULES_DIR/$commonFileName" ]]; then
    COMMON_SH_PATH="$RULES_DIR/$commonFileName"
  elif [[ -f "$PROJECT_ROOT/$commonFileName" ]]; then
    COMMON_SH_PATH="$PROJECT_ROOT/$commonFileName"
  else
    echo "[ERROR]: $commonFileName not found in expected locations." >&2
    return 1
  fi
  # Load shared functions BEFORE using PostInfo, PostErr, etc.
  source "$COMMON_SH_PATH" || { 
    echo "[ERROR]: Failed to load $commonFileName" >&2
    exit 1
  }
  # Check if common.sh was loaded successfully
  if ! declare -F PostInfo &>/dev/null; then
    echo "[ERROR]: common.sh did not load correctly. Exiting." >&2
    exit 1
  fi
} # End Function findAndLoadCommon

# ---------- Function: setupEnvironment
# Initializes the environment by locating and loading dependencies, configurations, 
# and checking required dependencies.
setupEnvironment() 
{ # Find Project Root
  PROJECT_ROOT=$(findProjectRoot) || return 1
  RULES_DIR="$PROJECT_ROOT/Rules"
  # Defines the rule specific variables
  echo "[DEBUG] : starting defineRuleConstants"
  defineRuleConstants
  echo "[DEBUG] : finishing defineRuleConstants nameOfProduct : $nameOfProduct"
  # Locate and Load Common Functions
  findAndLoadCommon     || return 1
  # Load verbosity settings and JSON config
  loadVerbositySettings || return 1
  loadJsonConfigValues  || return 1
  # Retrieve rule-specific configuration
  RULE_ENABLED=$(getJsonValueOrDefault "$name_space.enabled" "false" "${nameOfProduct}")
  if [[ "$RULE_ENABLED" != "true" ]]; then
    PostInfo "${ruleName} is disabled in pre_commit_config.json. Skipping execution."
    return 1
  fi
  # Get allowed extensions from pre_commit_config.json
  defaultExtensions=".sh"
  RAW_EXTENSIONS=$(getJsonValue "$name_space.extensions")
  RAW_EXCLUDE=$(getJsonValue "$name_space.exclude")
  # Convert JSON arrays to proper Bash strings
  SHELL_EXTENSIONS=$(echo "$RAW_EXTENSIONS" | jq -r 'join("\n")' 2>/dev/null || echo "$RAW_EXTENSIONS")
  EXCLUDED_PATTERNS=$(echo "$RAW_EXCLUDE" | jq -r 'join("|")' 2>/dev/null || echo "$RAW_EXCLUDE")
  # Run rule verification if setup was successful
  checkDependencies
  local localReturnCode=$?
  PostInfo "Finishing setupEnvironment ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function setupEnvironment

# ---------- Function: getRuleName
# Retrieves the full name of the rule.
#
# This function returns a predefined string representing the rule's full name.
# It is useful for identification, logging, and verification purposes.
#
# Usage:
#   ruleName=$(getRuleName)
#   echo "The rule name is: $ruleName"
#
# Output Example:
#   ${ruleName}
#
# Returns:
#   - A string containing the full rule name.
#
# Dependencies:
#   - None
#
# Notes:
#   - The rule name should be unique to avoid conflicts with other rules.
#   - This function does not take any arguments.
getRuleName()
{ echo "$ruleName"
} # End Function getRuleName

# ---------- Function: getRuleTitle
# Retrieves the title of the rule.
#
# This function returns a predefined string representing the descriptive title of the rule.
# The title provides a human-readable explanation of the rule's purpose.
#
# Usage:
#   ruleTitle=$(getRuleTitle)
#   echo "The rule title is: $ruleTitle"
#
# Output Example:
#   Shell Script Linter for Pre-Commit Hooks
#
# Returns:
#   - A string containing the rule's title.
#
# Dependencies:
#   - None
#
# Notes:
#   - The rule title should be descriptive and informative.
#   - This function does not take any arguments.
getRuleTitle()
{ echo "$ruleTitle"
} # End Function getRuleTitle

# ---------- Function: showHelp
# Displays usage information for this rule.
#
# This function prints a detailed help message explaining the available command-line options,
# their usage, and example scenarios. It provides users with guidance on how to execute the script.
#
# Usage:
#   showHelp
#
# Output Example:
#   Usage: Vcs${ruleHandle}Rule.sh [options]
#
#   Options:
#     -h, --help                 Show this help message
#     -c, --check                Check for dependencies and provide installation steps
#     -f, --file <filename>      Run ${ruleHandle} on a single file
#     -s, --staged               Run ${ruleHandle} on all staged shell script files
#     -s, --staged <files>       Run ${ruleHandle} only on the specified staged files
#     -b, --buffer <bufferText>  NOT SUPPORTED (${ruleHandle} does not support buffers)
#     -n, --name                 Print the rule name and exit
#     -t, --title                Print the rule title and exit
#
#   Examples:
#     Run ${ruleHandle} on all staged shell script files:
#       Vcs${ruleHandle}Rule.sh --staged
#
#     Run ${ruleHandle} only on specific staged files:
#       Vcs${ruleHandle}Rule.sh --staged file1.sh file2.sh file3.sh
#
#     Get the rule name:
#       Vcs${ruleHandle}Rule.sh --name
#
#     Get the rule title:
#       Vcs${ruleHandle}Rule.sh --title
#
#   Notes:
#     - The script automatically excludes files and directories based on the configuration.
#     - If no valid shell script files are found after exclusions, it will return an error.
#
# Returns:
#   - Prints the help message to standard output.
#   - Always returns 0 (success).
#
# Dependencies:
#   - Requires `PostInfo` for logging.
#
# Notes:
#   - This function does not take any arguments.
#   - If additional options are added to the script, this function should be updated accordingly.
function showHelp
{
  PostInfo "Starting showHelp"
  local localReturnCode=0
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  -h, --help                 Show this help message
  -c, --check                Check for dependencies and provide installation steps
  -f, --file <filename>      Run ${ruleHandle} on a single file
  -s, --staged               Run ${ruleHandle} on all staged shell script files
  -S, --set <files>          Run ${ruleHandle} only on the specified staged files
  -b, --buffer <bufferText>  NOT SUPPORTED (${ruleHandle} does not support buffers)
  -n, --name                 Print the rule name and exit
  -t, --title                Print the rule title and exit

Examples:
  Run ${ruleHandle} on all staged shell script files:
    $(basename "$0") --staged

  Run ${ruleHandle} only on specific staged files:
    $(basename "$0") --staged file1.sh file2.sh file3.sh

  Get the rule name:
    $(basename "$0") --name

  Get the rule title:
    $(basename "$0") --title

  If all specified files are excluded by configuration, the script will return an error.

Notes:
  - The script automatically excludes files and directories based on the configuration.
  - If no valid shell script files are found after exclusions, it will return an error.
EOF
  PostInfo "Finishing showHelp ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function showHelp

# ---------- Function: checkDependencies
# Verifies that all required dependencies are installed before executing the script.
#
# This function specifically checks whether `${ruleHandle}` is installed on the system.
# If `${ruleHandle}` is not found, it prints an error message and provides installation instructions
# for multiple operating systems.
#
# Usage:
#   checkDependencies
#
# Output Example (if ${ruleHandle} is missing):
#   [ERROR] ${ruleHandle} is not installed.
#   To install ${ruleHandle}, use one of the following:
#     - macOS (Homebrew)      : brew install ${nameOfProduct}
#     - Linux (APT)           : sudo apt install ${nameOfProduct}
#     - Windows (Chocolatey)  : choco install ${nameOfProduct}
#     - Windows (Scoop)       : scoop install ${nameOfProduct}
#     - Arch Linux (Pacman)   : sudo pacman -S ${nameOfProduct}
#     - Fedora (DNF)          : sudo dnf install ${ruleHandle}
#   More info: https://www.${nameOfProduct}.net/
#
# Returns:
#   - 0 if all dependencies are installed.
#   - 1 if `${ruleHandle}` is missing.
#
# Dependencies:
#   - Requires `command -v` for checking command existence.
#   - Uses `PostInfo` for logging informational messages.
#   - Uses `PostErr` for logging errors.
#
# Notes:
#   - If additional dependencies are required in the future, they should be added here.
#   - The function currently supports multiple package managers for installation instructions.
function checkDependencies
{ PostInfo "Starting checkDependencies"
  local localReturnCode=0
  if ! command -v ${nameOfProduct} &> /dev/null; then
    PostErr "${ruleHandle} is not installed."
    cat <<EOF
To install ${ruleHandle}, use one of the following:
  - macOS (Homebrew)      : brew install ${nameOfProduct}
  - Linux (APT)           : sudo apt install ${nameOfProduct}
  - Windows (Chocolatey)  : choco install ${nameOfProduct}
  - Windows (Scoop)       : scoop install ${nameOfProduct}
  - Arch Linux (Pacman)   : sudo pacman -S ${nameOfProduct}
  - Fedora (DNF)          : sudo dnf install ${ruleHandle}
More info: https://www.${nameOfProduct}.net/
EOF
    localReturnCode=1
  fi
  PostInfo "Finishing setupEnvironment ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function checkDependencies

# ---------- Function: runRuleCheck
# Executes ${ruleHandle} on the provided files or script content, ensuring compliance with best practices.
#
# This function verifies whether `${ruleHandle}` is installed before attempting execution.
# If `${ruleHandle}` is missing, it logs a warning and skips execution. Otherwise, it runs
# ${ruleHandle} with the provided arguments and logs the results.
#
# Usage:
#   runRuleCheck <options> <file1> <file2> ...
#
# Example:
#   runRuleCheck myscript.sh
#   runRuleCheck --severity=error script1.sh script2.sh
#
# Output Example:
#   [INFO] Running ${ruleHandle}...myscript.sh
#   In myscript.sh line 3:
#     echo "Hello, world!"
#     ^-- SC2148: Tips for best practices...
#
# Returns:
#   - 0 if ${ruleHandle} runs successfully (regardless of warnings/errors found).
#   - 1 if ${ruleHandle} is not installed or execution fails.
#
# Dependencies:
#   - Requires `${ruleHandle}` to be installed on the system.
#   - Uses `command -v ${nameOfProduct}` to check availability.
#   - Uses `PostInfo` for logging information.
#   - Uses `PostWarn` for logging warnings.
#
# Notes:
#   - This function does not modify any files; it only runs ${ruleHandle} and returns results.
#   - Arguments passed to `runRuleCheck` are directly forwarded to ${ruleHandle}.
#   - If additional execution flags are needed, they should be passed as arguments.
function runRuleCheck
{ PostInfo "Starting runRuleCheck: $@"
  local localReturnCode=0
  local nameOfProduct="${nameOfProduct}"
  if ! command -v $nameOfProduct &> /dev/null; then
    PostWarn "$nameOfProduct is not installed. Skipping."
    localReturnCode=1
  else
    PostInfo "Running $nameOfProduct...$@"
    PostDebug "Executing rule check with: '$nameOfProduct' and args: '$@'"
    command "$nameOfProduct" "$@"
    localReturnCode=$?
  fi
  PostInfo "Finishing runRuleCheck $@, ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function runRuleCheck

# ---------- Function: processFile
# Processes a single file with ${ruleHandle}.
# @param $1 The file to check.
function processFile
{ PostInfo "Starting processFile '$fileSpec'"
  local localReturnCode=0
  local fileSpec="$1"
  if [[ -n "$fileSpec" ]]; then
    runRuleCheck "$fileSpec"
    localReturnCode=$?
  else
    PostErr "No file specified. processFile requires a valid filename."
    localReturnCode=1
  fi
  PostInfo "Finishing processFile $1, ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processFile

# ---------- Function: processStagedFiles
# Processes all staged shell script files with ${ruleHandle}.
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
    PostInfo "Running ${ruleHandle} on staged shell scripts..."
    IFS=$'\n' # Handle filenames with spaces
    for file in $files; do
      processFile "$file"
      localReturnCode=$(( localReturnCode || $? )) # Accumulate failures
    done
    unset IFS # Restore default IFS
  else
    PostInfo "No valid staged shell script files found (after exclusions)."
    localReturnCode=1  # Set to 1 since no files were processed
  fi
  PostInfo "Finishing processStagedFiles ReturnCode: $localReturnCode"
  return $localReturnCode
} # End Function processStagedFiles

# ---------- Function: processBuffer
# Handles buffer processing (not supported by ${ruleHandle}).
function processBuffer
{
  PostInfo "Starting processBuffer"
  local localReturnCode=1

  PostErr "${ruleHandle} does NOT support buffers."

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
    -c|--check) 
      checkDependencies
      localReturnCode=$?
      ;;
    -f|--file) 
      if [[ -z "$2" ]]; then
        PostErr "Error: No filename provided for --file option."
        localReturnCode=1
      else
        processFile "$2"
        localReturnCode=$?
      fi
      ;;
    -s|--staged)
      processStagedFiles
      localReturnCode=$?
      ;;
    -S|--set)
      if [[ -z "$2" ]]; then
        PostErr "Error: No file list provided for --set option."
        localReturnCode=1
      else
        processSetFiles "${@:2}"
        localReturnCode=$?
      fi
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
    -n|--name)
      getRuleName
      localReturnCode=$?
      ;;
    -t|--title)
      getRuleTitle
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


# =================================================================
# ---------- MAIN: ------------------------------------------------
# This is the only part of the Vcs${ruleHandle}Rule.sh that executes.
# The purpose is to read the command line arguments and process them.
# See showHelp for details.
# Setup environment
setupEnvironment
PostInfo "Starting Vcs${ruleHandle}Rule"
localReturnCode=$?
if [[ $localReturnCode -ne 0 ]]; then
  PostErr "Setup failed. Exiting Vcs${ruleHandle}Rule."
  localReturnCode=$?
else
# Process command-line options
  processOptions "$@"
  localReturnCode=$?
fi
PostInfo "Finishing ${ruleName} ReturnCode: $localReturnCode"
exit $localReturnCode

