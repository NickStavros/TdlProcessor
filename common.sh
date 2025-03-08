# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
# Common Functions for Pre-Commit Hooks
#
# This script provides shared logging functions, JSON configuration handling,
# and verbosity settings for pre-commit hooks. It ensures that all tools
# have consistent logging and configuration access.
#
# Usage:
#   To use this script in another tool or script, source it at the beginning:
#     SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
#     source "$SCRIPT_DIR/common.sh"
#
#   This ensures that `common.sh` is sourced correctly regardless of where the
#   calling script is located.
#
#   Then, call the provided functions as needed:
#     - Logging: PostInfo, PostDebug, PostWarn, PostErr
#     - JSON Handling: loadJsonConfigValues, getJsonValue, getJsonValueOrDefault
#     - Verbosity Settings: loadVerbositySettings
#
# Dependency:
#   This script relies on the JSON configuration file located at:
#     Data/pre_commit_config.json
#   Since different scripts may call `common.sh` from different locations, 
#   the script determines the absolute path dynamically.
#
#   The `SCRIPT_DIR` variable is used to resolve the correct path to `common.sh`,
#   ensuring that relative paths work correctly when sourcing this script.
#
#   If a script calls this file from outside the Tools/ directory (e.g., from
#   pre-commit.sh in the root project directory), it will still work because
#   `SCRIPT_DIR` ensures paths are adjusted dynamically.
#
# Author(s):
#   - Dido Solutions Inc.
#   - R. W. "Nick" Stavros, Ph.D.
#   - Hamish I. MacCloud, AIA
#
# License: MIT
#
# ----------------------------------------------------------------------------

#!/bin/bash
# ---------- Global Configuration Variables ----------
# Determine the absolute path of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
CONFIG_BUFFER=""                                # Holds the JSON configuration data
relativeFilePath="Data/pre_commit_config.json"  # Relative path to JSON config file

# ---------- Logging Functions ----------
# ---------- Function: timestamp
# Generates a timestamp in the format YYYY-MM-DD HH:MM:SS.
# This function is used to standardize log entries with a consistent date-time format.
#
# Usage:
#   currentTime=$(timestamp)
#   echo "The current timestamp is: $currentTime"
#
# Output Example:
#   2025-03-04 12:45:30
#
# Returns:
#   - A string containing the current date and time in the format YYYY-MM-DD HH:MM:SS.
#
# Dependencies:
#   - Requires the `date` command available in Unix-like systems.
#
# Notes:
#   - The format is ISO 8601-compatible without time zone information.
#   - This function does not require any arguments.
timestamp() 
{ 
  echo "$(date '+%Y-%m-%d %H:%M:%S')"
} # End Function timestamp

# ---------- Function: PostInfo
# Logs an informational message if verbosity settings allow it.
# This function is used to display general status messages in a standardized format.
#
# Usage:
#   PostInfo "Starting processOptions"
#
# Output Example (if VERBOSE_INFO is enabled):
#   --   [INFO] 2025-03-04 12:45:30 -> Starting processOptions
#
# Parameters:
#   - $1 (string) : The informational message to log.
#
# Environment Variables:
#   - VERBOSE_INFO (boolean, default: false) : Controls whether INFO messages are displayed.
#
# Dependencies:
#   - Requires the `timestamp` function to generate timestamps.
#
# Notes:
#   - If VERBOSE_INFO is not set or is "false", no output will be generated.
#   - This function ensures consistent log formatting for INFO-level messages.
function PostInfo 
{ if [[ "${VERBOSE_INFO:-false}" == "true" ]]; then
    echo "--   [INFO] $(timestamp) -> $1"
  fi
} # End Function PostInfo

# ---------- Function: PostDebug
# Logs a debug-level message if verbosity settings allow it.
# This function is used to display detailed diagnostic messages to assist in troubleshooting.
#
# Usage:
#   PostDebug "Loading configuration file..."
#
# Output Example (if VERBOSE_DEBUG is enabled):
#   --=== [DEBUG] 2025-03-04 12:50:45 -> Loading configuration file...
#
# Parameters:
#   - $1 (string) : The debug message to log.
#
# Environment Variables:
#   - VERBOSE_DEBUG (boolean, default: false) : Controls whether DEBUG messages are displayed.
#
# Dependencies:
#   - Requires the `timestamp` function to generate timestamps.
#
# Notes:
#   - If VERBOSE_DEBUG is not set or is "false", no output will be generated.
#   - This function ensures consistent log formatting for DEBUG-level messages.
#   - DEBUG messages typically contain granular details useful for developers and maintainers.
function PostDebug 
{ if [[ "${VERBOSE_DEBUG:-false}" == "true" ]]; then
    echo "--=== [DEBUG] $(timestamp) -> $1"
  fi
} # End Function PostDebug

# ---------- Function: PostWarn
# Logs a warning-level message if verbosity settings allow it.
# This function is used to notify users of potential issues that do not stop execution but may require attention.
#
# Usage:
#   PostWarn "Configuration file is missing, using defaults."
#
# Output Example (if VERBOSE_WARN is enabled):
#   --+++ [WARN] 2025-03-04 12:55:30 -> Configuration file is missing, using defaults.
#
# Parameters:
#   - $1 (string) : The warning message to log.
#
# Environment Variables:
#   - VERBOSE_WARN (boolean, default: false) : Controls whether WARN messages are displayed.
#
# Dependencies:
#   - Requires the `timestamp` function to generate timestamps.
#
# Notes:
#   - If VERBOSE_WARN is not set or is "false", no output will be generated.
#   - Warning messages indicate possible issues but do not halt execution.
#   - This function ensures consistent log formatting for WARN-level messages.
#   - WARN messages typically highlight non-critical misconfigurations or missing optional dependencies.
function PostWarn 
{ if [[ "${VERBOSE_WARN:-false}" == "true" ]]; then
    echo "--+++ [WARN] $(timestamp) -> $1"
  fi
} # End Function PostWarn

# ---------- Function: PostErr
# Logs an error-level message if verbosity settings allow it.
# This function is used to indicate critical issues that may affect execution.
#
# Usage:
#   PostErr "Required dependency missing: jq"
#
# Output Example (if VERBOSE_ERROR is enabled):
#   --*** [ERROR] 2025-03-04 13:10:45 -> Required dependency missing: jq
#
# Parameters:
#   - $1 (string) : The error message to log.
#
# Environment Variables:
#   - VERBOSE_ERROR (boolean, default: false) : Controls whether ERROR messages are displayed.
#   - VALID_STATE (integer, default: 0) : This function increments VALID_STATE on each error.
#
# Dependencies:
#   - Requires the `timestamp` function to generate timestamps.
#
# Notes:
#   - If VERBOSE_ERROR is not set or is "false", no output will be generated.
#   - This function ensures consistent log formatting for ERROR-level messages.
#   - ERROR messages highlight critical failures, missing dependencies, or unrecoverable states.
#   - The function increments VALID_STATE, which can be checked later to determine error counts.
#   - Consider exiting the script if a certain error threshold is reached.
function PostErr 
{ 
  if [[ "${VERBOSE_ERROR:-false}" == "true" ]]; then
    echo "--*** [ERROR] $(timestamp) -> $1"
    ((VALID_STATE++))
  fi
} # End Function PostErr

# ---------- Function: loadJsonConfigValues
# Loads configuration values from a JSON file using `jq` and stores them
# in the global variable `CONFIG_BUFFER`. This function ensures the JSON
# configuration is properly loaded and accessible for other functions.
#
# Usage:
#   loadJsonConfigValues
#
# Example:
#   loadJsonConfigValues
#   echo "$CONFIG_BUFFER"   # Prints the loaded JSON content
#
# Expected JSON File:
#   - Located at: Data/pre_commit_config.json (relative to PROJECT_ROOT)
#
# Dependencies:
#   - Requires `jq` for JSON parsing.
#   - Uses global variables:
#     - `CONFIG_BUFFER`: Stores the parsed JSON data.
#     - `PROJECT_ROOT`: Defines the root directory.
#
# Returns:
#   - Populates `CONFIG_BUFFER` with parsed JSON content.
#   - If the JSON file is missing or malformed, exits with an error.
#
# Error Handling:
#   - Exits if the configuration file is missing or unreadable.
#   - Logs an error if `jq` is not installed.
#
# Notes:
#   - The function must be called before accessing configuration values.
#   - If `jq` is unavailable, the function logs a warning and sets `CONFIG_BUFFER` to an empty string.
#   - This function does not take any arguments.
loadJsonConfigValues()
{ if command -v jq &> /dev/null; then
    CONFIG_FILE="$PROJECT_ROOT/$relativeFilePath"
    if [[ -f "$CONFIG_FILE" ]]; then
      CONFIG_BUFFER=$(jq '.' "$CONFIG_FILE" 2>/dev/null)
      if [[ -z "$CONFIG_BUFFER" || "$CONFIG_BUFFER" == "null" ]]; then
        PostErr "Failed to load JSON configuration from $relativeFilePath"
        exit 1
      else
        PostInfo "Successfully loaded JSON from $relativeFilePath"
      fi
    else
      PostErr "Configuration file $relativeFilePath not found!"
      exit 1
    fi
  else
    echo "⚠️ jq is not installed, configuration values cannot be loaded."
    CONFIG_BUFFER=""
  fi
} # End Function loadJsonConfigValues

# ---------- Function: getJsonValue
# Retrieves a value from the loaded JSON configuration buffer (`CONFIG_BUFFER`)
# using the provided JSON key.
#
# Usage:
#   result=$(getJsonValue ".pre_commit.verbose.info.enabled")
#   echo "Value: $result"
#
# Example:
#   JSON File (`Data/pre_commit_config.json`):
#   {
#     "pre_commit": {
#       "verbose": {
#         "info": { "enabled": true }
#       }
#     }
#   }
#
#   Command:
#     getJsonValue ".pre_commit.verbose.info.enabled"
#
#   Output:
#     true
#
# Parameters:
#   - $1 (key) : The JSON key path to retrieve the value from `CONFIG_BUFFER`.
#
# Returns:
#   - The value associated with the provided JSON key.
#   - If the key is missing or the buffer is empty, an error is logged and an
#     empty string is returned.
#
# Dependencies:
#   - Requires `jq` for JSON parsing.
#   - Uses the global variable `CONFIG_BUFFER`, which must be populated before calling this function.
#
# Error Handling:
#   - Logs an error if `CONFIG_BUFFER` is empty.
#   - Returns an empty string if the key is not found or if `CONFIG_BUFFER` is not initialized.
#
# Notes:
#   - This function does NOT return a default value. Use `getJsonValueOrDefault`
#     if a fallback value is needed.
#   - Ensure `loadJsonConfigValues` is called before using this function.
getJsonValue() 
{ local key="$1"
  local value=""
  if [[ -z "$CONFIG_BUFFER" || "$CONFIG_BUFFER" == "null" ]]; then
    PostWarn "CONFIG_BUFFER is empty or invalid. Cannot fetch key: $key. Returning empty." >&2
    echo ""
    return
  fi
  # Fetch value using jq (without join)
  value=$(echo "$CONFIG_BUFFER" | jq -c --arg key "$key" 'try getpath($key[1:] | split(".")) catch empty')
  # If it's an array, return as-is (handle it in Bash)
  if [[ "$value" =~ ^\[.*\]$ ]]; then
    PostInfo "Detected array: $value" >&2
  fi

  # If the value is a reference (e.g., `$.some_key`), resolve it recursively
  if [[ "$value" =~ ^\$. ]]; then
    local referenced_key="${value:1}"  # Remove leading '$'
    value=$(getJsonValue "$referenced_key")  # Recursively resolve
  fi
  echo "$value"
} # End Function getJsonValue


# ---------- Function: getJsonValueOrDefault
# Retrieves a value from the loaded JSON configuration buffer (`CONFIG_BUFFER`)
# using the provided JSON key. If the key is missing, invalid, or `CONFIG_BUFFER`
# is empty, the function returns the specified default value.
#
# Usage:
#   result=$(getJsonValueOrDefault ".pre_commit.verbose.info.enabled" "false" "INFO Logging")
#   echo "Value: $result"
#
# Example:
#   JSON File (`Data/pre_commit_config.json`):
#   {
#     "pre_commit": {
#       "verbose": {
#         "info": { "enabled": true }
#       }
#     }
#   }
#
#   Command:
#     getJsonValueOrDefault ".pre_commit.verbose.info.enabled" "false" "INFO Logging"
#
#   Output:
#     true
#
# Parameters:
#   - $1 (key)       : The JSON key path to retrieve the value from `CONFIG_BUFFER`.
#   - $2 (default)   : The default value to return if the key is missing or invalid.
#   - $3 (context)   : (Optional) Context label for logging/debugging purposes.
#
# Returns:
#   - The value associated with the provided JSON key.
#   - The default value if the key is missing, `null`, or if `CONFIG_BUFFER` is empty.
#
# Dependencies:
#   - Requires `jq` for JSON parsing.
#   - Uses the global variable `CONFIG_BUFFER`, which must be populated before calling this function.
#
# Error Handling:
#   - If `CONFIG_BUFFER` is empty or invalid, logs a warning and returns the default value.
#   - If the key is missing or `null`, logs a debug message and returns the default value.
#   - Suppresses debug output in the final result to avoid unwanted text in scripts.
#
# Notes:
#   - This function is preferred over `getJsonValue` when a default fallback is required.
#   - Ensure `loadJsonConfigValues` is called before using this function.
getJsonValueOrDefault() 
{ local key="$1"
  local default="$2"
  local context="$3" # Optional context for logging
  local value=""
  # Debug: Print current CONFIG_BUFFER size
  if [[ -z "$CONFIG_BUFFER" || "$CONFIG_BUFFER" == "null" ]]; then
    PostWarn "CONFIG_BUFFER is empty or invalid. Using default for $context: $default" >&2
    echo "$default"
    return
  fi
  # Debug: Print the JSON query
  # Extract value using jq
  value=$(echo "$CONFIG_BUFFER" | jq -r --arg key "$key" '
    try (getpath($key[1:] | split("."))) catch "null"' 2>/dev/null)
  # Handle cases where jq fails or returns null/empty
  if [[ -z "$value" || "$value" == "null" ]]; then
    value="$default"
    PostInfo "Using default for $context: $default" >&2
  fi
  # Suppress Debug Output from Final Echo
  echo "$value"
} # End Function getJsonValueOrDefault

resolveJsonKey()
{ local key="$1"
  local maxDepth="${2:-5}"  # Prevent infinite loops (default max depth = 5)
  local resolvedValue=""

  if [[ -z "$CONFIG_BUFFER" || "$CONFIG_BUFFER" == "null" ]]; then
    PostWarn "CONFIG_BUFFER is empty or invalid. Cannot resolve key: $key"
    echo "null"
    return
  fi

  # Extract the value using jq
  PostDebug "🔍 Querying JSON: $key"
  resolvedValue=$(echo "$CONFIG_BUFFER" | jq -r --arg key "$key" 'try (getpath($key[1:] | split("."))) catch "null"' 2>/dev/null)

  # Check if the value is a reference (starts with "$.")
  if [[ "$resolvedValue" == \$.* ]]; then
    # Prevent infinite recursion
    if [[ "$maxDepth" -le 0 ]]; then
      PostErr "🚨 Recursive depth exceeded while resolving key: $key"
      echo "null"
      return
    fi

    PostDebug "🔄 Dereferencing key: $resolvedValue"
    resolvedValue=$(resolveJsonKey "$resolvedValue" $((maxDepth - 1)))
  fi

  # If still null, return null explicitly
  if [[ -z "$resolvedValue" || "$resolvedValue" == "null" ]]; then
    echo "null"
  else
    echo "$resolvedValue"
  fi
} # End Function resolveJsonKey


# ---------- Function: loadVerbositySettings
# Loads verbosity settings from the JSON configuration file (`CONFIG_BUFFER`).
# This function retrieves logging preferences for different log levels
# (DEBUG, INFO, WARN, ERROR) using `getJsonValueOrDefault`, ensuring
# that each verbosity setting has a default value if missing.
#
# Usage:
#   loadVerbositySettings
#
# Example:
#   JSON File (`Data/pre_commit_config.json`):
#   {
#     "pre_commit": {
#       "verbose": {
#         "debug": { "enabled": true },
#         "info":  { "enabled": true },
#         "warn":  { "enabled": true },
#         "error": { "enabled": true }
#       }
#     }
#   }
#
#   Command:
#     loadVerbositySettings
#     echo "Debug Enabled: $VERBOSE_DEBUG"
#
#   Output:
#     Debug Enabled: true
#
# Behavior:
#   - Calls `loadJsonConfigValues` to ensure `CONFIG_BUFFER` is populated.
#   - Extracts verbosity settings using `getJsonValueOrDefault` with a default of `false`.
#   - Suppresses errors using `2>/dev/null` to avoid cluttering output.
#
# Parameters:
#   - None (relies on `CONFIG_BUFFER` being preloaded).
#
# Returns:
#   - Populates global variables:
#     - `VERBOSE_DEBUG`
#     - `VERBOSE_INFO`
#     - `VERBOSE_WARN`
#     - `VERBOSE_ERROR`
#
# Dependencies:
#   - Requires `jq` for JSON parsing.
#   - Calls `loadJsonConfigValues` before accessing `CONFIG_BUFFER`.
#
# Error Handling:
#   - If `CONFIG_BUFFER` is empty or invalid, defaults all verbosity settings to `false`.
#   - Uses `getJsonValueOrDefault` to prevent missing key errors.
#
# Notes:
#   - Ensures logging settings are initialized before any `PostInfo`, `PostDebug`, etc.
#   - This function should be called early in script execution.
loadVerbositySettings() 
{ loadJsonConfigValues  # Load JSON once
  VERBOSE_DEBUG=$(getJsonValueOrDefault ".pre_commit.verbose.debug.enabled" "false" "DEBUG" 2>/dev/null)
  VERBOSE_INFO=$(getJsonValueOrDefault ".pre_commit.verbose.info.enabled" "false" "INFO"    2>/dev/null)
  VERBOSE_WARN=$(getJsonValueOrDefault ".pre_commit.verbose.warn.enabled" "false" "WARN"    2>/dev/null)
  VERBOSE_ERROR=$(getJsonValueOrDefault ".pre_commit.verbose.error.enabled" "false" "ERROR" 2>/dev/null)
} # End Function loadVerbositySettings

# ---------- Function: echoVerbositySettings
# Prints the current verbosity settings to standard output.
# This function ensures that verbosity settings are displayed using `echo`,
# as `Post*` functions may not be available when it is called.
#
# Usage:
#   echoVerbositySettings
#
# Example:
#   loadVerbositySettings
#   echoVerbositySettings
#
#   Output:
#   [ECHO] VERBOSE_DEBUG  : true
#   [ECHO] VERBOSE_INFO   : true
#   [ECHO] VERBOSE_WARN   : false
#   [ECHO] VERBOSE_ERROR  : true
#
# Behavior:
#   - Displays the values of verbosity settings.
#   - Uses `echo` instead of `Post*` functions to avoid dependency issues.
#
# Parameters:
#   - None (relies on global verbosity variables).
#
# Returns:
#   - Prints the current values of:
#     - `VERBOSE_DEBUG`
#     - `VERBOSE_INFO`
#     - `VERBOSE_WARN`
#     - `VERBOSE_ERROR`
#
# Dependencies:
#   - Assumes `loadVerbositySettings` has been called to set verbosity variables.
#
# Notes:
#   - Can be used for debugging to confirm verbosity settings.
#   - Helps diagnose configuration loading issues.
#
function echoVerbositySettings
{
  echo "[ECHO] VERBOSE_DEBUG  : $VERBOSE_DEBUG"
  echo "[ECHO] VERBOSE_INFO   : $VERBOSE_INFO"
  echo "[ECHO] VERBOSE_WARN   : $VERBOSE_WARN"
  echo "[ECHO] VERBOSE_ERROR  : $VERBOSE_ERROR"
} # End Function echoVerbositySettings