#!/bin/bash
# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
# ==============================================================================
# File: TdlProcessor.sh
# Copyright (c) 2023 to present by Dido Solutions. All rights reserved.
#
# **Prohibited Activities:** You cannot copy, modify, distribute, transmit, 
# reproduce, publish, publicly display, publicly perform, create derivative 
# works, transfer, or sell any of the content without prior written permission 
# from Dido Solutions.
#
# **Non-Exclusive License:** This file is provided "as is" without warranty of 
# any kind, expressed or implied. You are granted a non-exclusive, non-transferable 
# license to use this file for personal, non-commercial purposes only.
#
# **Non-Commercial Use:** Governments, educational institutions, and tax-exempt/
# public-benefit non-profits are granted a non-exclusive, non-transferable license 
# to use this file for non-commercial purposes.
#
# **Commercial Use:** You cannot use this file for your business or profit without 
# Dido Solutions' consent (https://didosolutions.com/contact/).
#
# **Attribution Notice:** You must retain this attribution notice in all copies of 
# the file: Copyright (c) 2023 by Dido Solutions. All rights reserved.
#
# **Last Revision:** 15 February 2025 - Improved function performance and documentation.
#
# **Reviewers (Human):** 
# - R. W. Stavros, Ph.D. - Code Review
# - John Doe - Security Review
#
# **Automated Reviews:** 
# - Hamish I. MacCloud, AIA - AI Code Review
# - Grammarly - Spelling & Grammar Check (Last run: 15 February 2025)
# - ShellCheck - Shell Script Linting (Last run: 14 February 2025)
# - Bandit - Security Analysis for Scripts (Last run: 13 February 2025)
# - LicenseCheck - Open Source License Compliance (Last run: 12 February 2025)
# ==============================================================================

# ------------------------------------------------------------------------------
# @file TdlProcessor.sh
# @description Provides core processing functions for TDL workflows, handling 
# data transformation, validation, and automation tasks.
# @author R. W. Stavros, Ph.D. Dido Solutions, Inc.
# @since 10 December 2023
# @version 1.0
# @reviewer R. W. Stavros, Ph.D. - Code Review
# @reviewer John Doe - Security Review
# @automated_review Hamish I. MacCloud, AIA - AI Code Review
# @automated_review Grammarly - Spelling & Grammar Check (Last run: 15 February 2025)
# @automated_review ShellCheck - Shell Script Linting (Last run: 14 February 2025)
# @automated_review Bandit - Security Analysis for Scripts (Last run: 13 February 2025)
# @automated_review LicenseCheck - Open Source License Compliance (Last run: 12 February 2025)
# ------------------------------------------------------------------------------

# ---------- Setup Environment
setupEnvironment()
{ 
  PostInfo "Setting up the Environment"
  # Define the target directory name
  TDL_TARGET="TemplateDL"
  # Get the current working directory
  CURRENT_DIR="$(basename "$(pwd)")"
  # Determine if we are already inside a TemplateDL directory
  if [ "$CURRENT_DIR" == "$TDL_TARGET" ]; then
    TDL_HOME="$(pwd)"
    TDL_ROOT="$TDL_HOME"
    PostInfo "Detected TemplateDL as the current directory. Using it as TDL_ROOT."
  else
    TDL_HOME="$(pwd)"
    TDL_ROOT="$TDL_HOME/$TDL_TARGET"
    PostInfo "Not in TemplateDL directory. Will create and use $TDL_ROOT as TDL_ROOT."
  fi
  NODE_CMD="node"
  GITHUB_REPO="https://github.com/NickStavros/TdlProcessor.git"
  GITHUB_DIR="$TDL_ROOT"

  DEFAULT_EXECUTABLE="$TDL_ROOT/Code/TdlProcessor.js"
  EXECUTABLE="$DEFAULT_EXECUTABLE"

  INPUT_FILESPEC="$TDL_ROOT/Templates/HelloWorld.tdl"
  OUTPUT_FILESPEC="$TDL_ROOT/Output/HelloWorld.text"
  SETTING_FILESPEC="$TDL_ROOT/Data/tdlSettings.json"

  TDL_SCHEMA_FILE="Data/tdl_settings.schema.json"
  TDL_VALIDATOR_SCRIPT="Code/validateSettings.js"

  USER_NAME="${USER:-${LOGNAME:-$(whoami)}}"
  VERBOSE=false
  LOCAL_VERBOSE=true
} # End function setupEnvironment

# ---------- Logging
timestamp() { echo "$(date '+%Y-%m-%d %H:%M:%S')"; }
PostInfo()  { if [ "$LOCAL_VERBOSE" = true ]; then echo "--   $(timestamp) ->$1"; fi; }
PostWarn()  { echo "--+++ WARNING: $(timestamp) ->$1"; }
PostErr()   { echo "--*** ERROR: $(timestamp) ->$1" >&2; }

# ---------- Function to show the settings file
showConfigAction()
{ PostInfo "DEBUG: Looking for settings file at: $SETTING_FILESPEC"
  if [ -f "$SETTING_FILESPEC" ]; then
    PostInfo "Settings file found at: $SETTING_FILESPEC"
    cat "$SETTING_FILESPEC"
  else
    PostErr "Settings file not found: $SETTING_FILESPEC"
    exit 1
  fi
} # End function showConfigAction

updateConfigAction() 
{ if [ "$#" -lt 2 ]; then
    PostErr "Usage: --config <key> <value>"
    return 1
  fi

  local key="$1"
  local value="$2"
  local config_file="$SETTING_FILESPEC"

  if [ ! -f "$config_file" ]; then
    PostErr "Settings file not found: $config_file"
    return 1
  fi

  PostInfo "Updating Configuration: $key = $value"

  # Determine if the value is a number or boolean (true/false)
  if [[ "$value" =~ ^[0-9]+$ || "$value" =~ ^(true|false)$ ]]; then
    jq --arg key "$key" --argjson value "$value" \
       'setpath($key | split("."); $value)' "$config_file" > "$config_file.tmp"
  else
    jq --arg key "$key" --arg value "$value" \
       'setpath($key | split("."); ($value | tostring))' "$config_file" > "$config_file.tmp"
  fi

  if [ $? -eq 0 ]; then
    mv "$config_file.tmp" "$config_file"
    PostInfo "Updated $key to $value in $config_file"
  else
    PostErr "Failed to update the settings file."
    rm -f "$config_file.tmp"  # Clean up temp file on failure
  fi
} # End function updateConfigAction

# ---------- Help Function
displayHelpAction()
{ echo "Usage: TdlProcessor.sh [options]"
  echo "Options:"
  echo "  -i, --input <inputFileSpec>       Specify input TDL file (default: input.tdl)"
  echo "  -o, --output <outputFileSpec>     Specify output file (default: output.json)"
  echo "  -s, --settings <settingFileSpec>  Specify settings file (default: tdlSettings.json)"
  echo "  -v, --verbose                     Enable verbose mode"
  echo "  -b, --build <home_directory>      Set up the TDL environment in the specified home directory"
  echo "  -c, --config <key> <value>        Modify a setting in the settings file"
  echo "  -d, --display-config              Show the current settings file"
  echo "  -m, --make-config <directory>     Create a settings file in the specified directory (default: Data)"
  echo "  -g, --github [clone|pull|help]    Clone or update the TemplateDL GitHub repository"
  echo "  -h, --help                        Display this help message"
} # End displayHelpAction

# ---------- Function to check if Node.js is installed
checkNodeJsInstalled()
{ if ! command -v $NODE_CMD &> /dev/null; then
    PostErr "Node.js is not installed. Please install it using the following instructions:"
    PostInfo "  - Ubuntu/Debian          : sudo apt update && sudo apt install nodejs npm"
    PostInfo "  - macOS (Homebrew)       : brew install node"
    PostInfo "  - Windows (Chocolatey)   : choco install nodejs"
    PostInfo "  - Windows (Scoop)        : scoop install nodejs"
    PostInfo "  - Generic                : Download from https://nodejs.org/ and install manually"
    exit 1
  fi
} # End checkNodeJsInstalled


# ---------- Function to process script arguments
processArguments()
{ PostInfo "Processing Arguments: $@"
  EXECUTABLE="$DEFAULT_EXECUTABLE"
  while [[ "$#" -gt 0 ]]; do
    PostInfo "Current Argument: $1"
    case "$1" in
      -i|--input)
        INPUT_FILESPEC="$2"; shift 2 ;;
      -o|--output)
        OUTPUT_FILESPEC="$2"; shift 2 ;;
      -s|--settings)
        if [ -z "$2" ]; then
          PostWarn "No settings file specified! Using default: $SETTING_FILESPEC"
        else
          SETTING_FILESPEC="$2"
        fi
        validateSettingsFile "$SETTING_FILESPEC"
        shift 2
        ;;
      -u|--user)
        USER_NAME="$2"; shift 2 ;;
      -v|--verbose)
        VERBOSE=true; shift ;;
      -d|--display-config)
        showConfigAction; shift; unset EXECUTABLE ;;
      -b|--build)
        if [[ -n "$2" && ! "$2" =~ ^- ]]; then
          buildDirectoryAction "$2"
          shift 2  # Shift both --build and its argument
        else
          buildDirectoryAction "$(pwd)" # Default to current directory
          shift  # Shift only --build
        fi
        unset EXECUTABLE
        ;;
      -c|--config)
        updateConfigAction "$2" "$3"; shift 2; unset EXECUTABLE ;;
      -m|--make-config)
        initConfigAction "$2"; shift; unset EXECUTABLE ;;
      -g|--github)
        githubAction "$2"; shift; unset EXECUTABLE ;;
      -h|--help)
        displayHelpAction; unset EXECUTABLE; exit 0 ;;
      -* )
        PostErr "Unknown option: $1"; displayHelpAction; exit 1 ;;
      * )
        if [ -z "$EXECUTABLE" ]; then EXECUTABLE=""; fi; shift ;;
    esac
  done
} # End processArguments

# ---------- Function to create directory structure
# @function buildDirectoryAction
# @description Initializes the required directory structure for the TDL Processor.
# Creates standard directories and ensures `TdlProcessor.sh` is placed correctly.
# @global TDL_ROOT (string) - Root directory where TDL structure is built.
# @returns 0 on success.
# @example
# buildDirectoryAction
buildDirectoryAction() 
{ PostInfo "Initializing TDL directory structure..."
  local required_dirs=("Code" "Data" "Documents" "Output" "Results" "Templates")
  for dir in "${required_dirs[@]}"; do
    local full_path="$TDL_ROOT/$dir"
    if [ -d "$full_path" ]; then
      PostInfo "Directory already exists: $full_path"
    else
      mkdir -p "$full_path"
      PostInfo "Created: $full_path"
    fi
  done
  # Ensure `TdlProcessor.sh` exists in the root directory
  local script_path="$(pwd)/TdlProcessor.sh"
  local target_path="$TDL_ROOT/TdlProcessor.sh"
  if [ ! -f "$target_path" ]; then
    cp "$script_path" "$target_path"
    PostInfo "Copied TdlProcessor.sh to: $TDL_ROOT"
  else
    PostWarn "TdlProcessor.sh already exists in $TDL_ROOT. Skipping copy."
  fi
  initConfigAction
} # End buildDirectoryAction

# ---------- Function to create default settings file
initConfigAction()
{ local config_dir="${1:-$(dirname "$SETTING_FILESPEC")}"
  local config_file="$config_dir/tdlSettings.json"
  PostInfo "Initializing the ${config_file}"
  if [ -z "$1" ]; then
    PostWarn "No directory specified for config. Using default: $config_dir"
  fi
  mkdir -p "$config_dir"
  cat <<EOF > "$config_file"
{
  "_meta": {
    "schema": "tdl_meta.schema.json",
    "fileName": "tdlSettings.json",
    "description": "Default configuration for TDL Processor",
    "license": "MIT",
    "lastRevision": "$(date +%Y-%m-%d)",
    "lastRevisionDetails": "Initial creation of default settings file.",
    "reviewers": [
      { "name": "R. W. Stavros, Ph.D.", "role": "Code Review" },
      { "name": "John Doe", "role": "Security Review" }
    ],
    "automatedReviews": [
      { "tool": "Hamish I. MacCloud, AIA", "purpose": "AI Code Review" },
      { "tool": "Grammarly", "purpose": "Spelling & Grammar Check", "lastRun": "2025-02-15" },
      { "tool": "JSONLint", "purpose": "JSON Validation", "lastRun": "2025-02-14" }
    ]
  },
  "$schema": "${TDL_SCHEMA_FILE}",
  "companyName": "Template Foundry Inc.",
  "companyAddress": {
    "firstAddressLine": "444 Template Foundry Road",
    "secondAddressLine": "",
    "city": "San Diego",
    "state": "California",
    "country": "USA",
    "mailCode": "92050"
  },
  "companyPhone": "1-800-555-1212",
  "webSite": "TemplateFoundry.com",
  "contactEmail": "support@templateFoundry.com",
  "poc": "Hamish I. MacCloud",
  "authors": [
    "R. W. Stavros, PhD",
    "Hamish I. MacCloud, AIA"
  ],
  "metaEchoOutput": true,
  "metaEchoInput": true,
  "metaEchoInfo": true,
  "systemModelVersion": "0.0.1a"
}
EOF
  # validateSettingsFile "$config_file" 
  PostInfo "Created default configuration file: $config_file"
} # End initConfigAction

# ---------- Function to validate settings file
# @function validateSettingsFile
# @description Validates TdlSettings.json using validateSettings.js.
validateSettingsFile() 
{ 
  if [ ! -f "$SETTING_FILESPEC" ]; then
    PostErr "TdlSettings.json not found! Creating a default settings file..."
    initConfigAction "$(dirname "$SETTING_FILESPEC")"
  fi

  # Only initialize settings if the file does NOT already exist
  if [ ! -f "$SETTING_FILESPEC" ]; then
    initConfigAction "$(dirname "$SETTING_FILESPEC")"
  else
    PostInfo "Existing settings file found. Skipping re-initialization."
  fi

  if [ -f "$TDL_VALIDATOR_SCRIPT" ]; then
    if node "$TDL_VALIDATOR_SCRIPT" "$SETTING_FILESPEC"; then
      PostInfo "TdlSettings.json validation successful."
    else
      PostErr "TdlSettings.json validation failed! Reverting to default settings..."
      initConfigAction "$(dirname "$SETTING_FILESPEC")"
    fi
  else
    PostWarn "Validation script $TDL_VALIDATOR_SCRIPT not found! Skipping validation."
  fi
} # End validateSettingsFile

# ---------- Function: githubAction
githubAction()
{ PostInfo "Starting githubAction"
  local action="${1:-clone}"  # Default to "clone" if no argument is given
  local repo_url="https://github.com/NickStavros/TdlProcessor.git"
  local repo_dir="TemplateDL"
  case "$action" in
    clone)
      if [ -d "$repo_dir/.git" ]; then
        PostWarn "Repository already exists in $repo_dir. Use 'pull' to update."
      else
        PostInfo "Cloning TemplateDL repository..."
        git clone "$repo_url" "$repo_dir" || { PostErr "Git clone failed!"; exit 1; }
        PostInfo "Clone successful. Repository is in $repo_dir."
      fi
      ;;
    pull)
      if [ -d "$repo_dir/.git" ]; then
        PostInfo "Updating TemplateDL repository..."
        cd "$repo_dir" || { PostErr "Failed to navigate to $repo_dir"; exit 1; }
        git pull origin main || { PostErr "Git pull failed!"; exit 1; }
        PostInfo "Repository updated successfully."
      else
        PostErr "Repository not found in $repo_dir. Run 'githubAction clone' first."
        exit 1
      fi
      ;;
    help)
      echo "Usage: TdlProcessor.sh --github [clone|pull|help]"
      echo "  clone - Clones the TemplateDL repository (default action)"
      echo "  pull  - Updates the existing TemplateDL repository"
      echo "  help  - Displays this help message"
      ;;
    *)
      PostErr "Invalid option: $action. Use 'clone', 'pull', or 'help'."
      exit 1
      ;;
  esac
  PostInfo "Starting githubAction"
} # End function githubAction


# ========== MAIN ==========
PostInfo "Starting TdlProcessor"
setupEnvironment       || { PostErr "setupEnvironment failed! Exiting."; exit 1; }
validateSettingsFile   || { PostErr "validateSettingsFile failed! Exiting."; exit 1; }
checkNodeJsInstalled   || { PostErr "checkNodeJsInstalled failed! Exiting."; exit 1; }
processArguments "$@"
EXIT_CODE=$?
PostInfo "Finishing TdlProcessor : $EXIT_CODE"
exit "$EXIT_CODE"
