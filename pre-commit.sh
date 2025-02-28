#!/bin/bash
# ------------------------------------------------------------------------------
# PUBLIC
# ------------------------------------------------------------------------------
# ------------------------------------------------------------------------------
# @file pre-commit.sh
# @description Git pre-commit hook for enforcing commit compliance.
# Ensures commit messages follow format, runs automated tools, and checks metadata.
# @author R. W. Stavros, Ph.D. - Dido Solutions, Inc.
# @since 2025-02-24
# @version 1.0
# @reviewer R. W. Stavros, Ph.D. - Code Review
# @reviewer John Doe - Security Review
# @automated_review Hamish I. MacCloud, AIA - AI Code Review
# @automated_review ShellCheck - Shell Script Linting (Last run: 2025-02-24)
# @automated_review JSONLint - JSON Validation (Last run: 2025-02-24)
# ------------------------------------------------------------------------------

# ---------- Configuration Paths ----------
setupEnvironment()
{ PostInfo "Starting environment setup..."
  # Find the root of the Git repository
  PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
  if [[ -z "$PROJECT_ROOT" ]]; then
    PostErr "This script must be run inside a Git repository!"
    exit 1
  fi
  # Locate TemplateDL dynamically
  DIST_DIR=$(find "$PROJECT_ROOT" -type d -name "TemplateDL" -print -quit)
  if [[ -z "$DIST_DIR" ]]; then
    PostErr "Could not locate TemplateDL directory inside $PROJECT_ROOT."
    exit 1
  fi
  PostInfo "PROJECT_ROOT is set to: $PROJECT_ROOT"
  PostInfo "DIST_DIR (TemplateDL) is set to: $DIST_DIR"
  # Dynamically determine config file location
  CONFIG_FILE="$DIST_DIR/Data/pre_commit_config.json"
  if [[ ! -f "$CONFIG_FILE" ]]; then
    PostWarn "Configuration file not found: $CONFIG_FILE. Using defaults."
  else
    PostDebug "Config file path set to: $CONFIG_FILE"
  fi
  SECURITY_LEVEL="UNCLASSIFIED"  # Default security level
  LOCAL_VERBOSE=true             # Default verbosity
  VALID_STATE=0                  # Tracks validation failures
  NUMBER_OF_SPELL_INST=0         # Tracks times the spellcheck instructions given
  SPELLCHECK_ERRORS=0
  # Load JSON values ONCE into memory
  loadJsonValues

  # Resolve scan path from loaded JSON
  SCAN_PATH=$(getJsonValue ".scan_scope.default_path")
  if [[ -z "$SCAN_PATH" ]]; then
    SCAN_PATH="$DIST_DIR"
  fi
  PostDebug "Scan path set to: $SCAN_PATH"
  checkNodeJsInstalled  # Ensure Node.js is installed
  PostInfo "Environment setup complete. Using scan path: '$SCAN_PATH'"
} # End function setupEnvironment

# ---------- Logging Functions ----------
timestamp() 
{ echo "$(date '+%Y-%m-%d %H:%M:%S')"; 
} # End function timestamp
PostInfo()
{ if [ "$LOCAL_VERBOSE" = true ]; then 
    echo "--   [INFO] $(timestamp) -> $1" 
  fi
} # End function PostInfo
PostDebug()
{ echo "--=== [DEBUG] $(timestamp) -> $1"
} # End function PostDebug
PostWarn()
{ echo "--+++ [WARN] $(timestamp) -> $1"
} # End function PostWarn
PostErr()
{ echo "--*** [ERROR] $(timestamp) -> $1" >&2; ((VALID_STATE++))
} # End function PostErr

# ---------- Function: Display Help Message ----------
showHelp()
{ echo "Usage: pre-commit.sh [options]"
  echo "Options:"
  echo "  -a, --all             Run all validation checks"
  echo "  -c, --commit-msg      Validate commit message (optional: specify file)"
  echo "  -d, --display-config  Show current pre-commit configuration"
  echo "  -h, --help            Show this help message"
  echo "  -m, --meta            Validate metadata in committed files"
  echo "  -p, --path <dir>      Specify directory for validation scope"
  echo "  -s, --security        Perform security level checks"
  echo "  -t, --tool <name>     Run a specific automated tool (or all if omitted)"
  echo "  -v, --verbose         Enable verbose logging"
  return 0
} # End function showHelp

# ---------- Function: Load JSON Config Once ----------
loadJsonValues()
{ PostInfo "Loading JSON configuration..."
  if [ -f "$CONFIG_FILE" ]; then
    JSON_CONFIG=$(jq '.' "$CONFIG_FILE" 2>/dev/null)
  else
    PostWarn "Config file not found! Using defaults."
    JSON_CONFIG="{}"  # Set to an empty JSON object to prevent errors
  fi
  PostInfo "Finished loading JSON configuration."
} # End function loadJsonValues

# ---------- Function: Get JSON Value from Loaded Config ----------
getJsonValue()
{ local KEY="$1"
  local VALUE
  VALUE=$(echo "$JSON_CONFIG" | jq -r "$KEY // empty" 2>/dev/null)
  # Ensure we don't return 'null' or an empty value
  if [[ "$VALUE" == "null" || -z "$VALUE" ]]; then
    echo "" # Return an empty string instead of "null"
  else
    echo "$VALUE"
  fi
} # End function getJsonValue

# ---------- Function: Load Security & Verbose Config ----------
loadConfig()
{ PostInfo "Loading pre-commit configuration..."
  SECURITY_LEVEL=$(getJsonValue "._classification.level")
  LOCAL_VERBOSE=$(getJsonValue ".verbose.enabled")
  if [[ -z "$SECURITY_LEVEL"  ||  "$SECURITY_LEVEL" = "null" ]]; then SECURITY_LEVEL="UNCLASSIFIED"; fi
  if [[ -z "$LOCAL_VERBOSE"  ||  "$LOCAL_VERBOSE" = "null" ]]; then LOCAL_VERBOSE=false; fi
  PostInfo "Config loaded: SECURITY_LEVEL=$SECURITY_LEVEL, VERBOSE=$LOCAL_VERBOSE"
} # End function loadConfig

# ---------- Function: Get JSON Value from Loaded Config ----------
getJsonValue()
{ PostInfo "Retrieving JSON value for key: $1"
  echo "$JSON_CONFIG" | jq -r "$1" 2>/dev/null
  PostInfo "Finished retrieving JSON value."
} # End function getJsonValue

# ---------- Function to check if Node.js is installed ----------
checkNodeJsInstalled()
{ PostInfo "Checking if Node.js is installed..."
  if command -v node &> /dev/null; then
    PostInfo "Node.js is installed."
    return 0
  fi
  PostErr "Node.js is not installed. JSONLint and other Node-based tools may not work."
  if [ -n "$GITHUB_ACTIONS" ]; then
    PostInfo "For GitHub CI/CD, add this to your workflow:"
    PostInfo "  - run: sudo apt-get update && sudo apt-get install -y nodejs npm"
  else
    PostInfo "To install Node.js, run:"
    PostInfo "  - Ubuntu/Debian          : sudo apt update && sudo apt install nodejs npm"
    PostInfo "  - macOS (Homebrew)       : brew install node"
    PostInfo "  - Windows (Chocolatey)   : choco install nodejs"
    PostInfo "  - Windows (Scoop)        : scoop install nodejs"
    PostInfo "  - Generic                : Download from https://nodejs.org/ and install manually"
  fi
  ((VALID_STATE++))  # Increment on failure
  PostInfo "Node.js check completed with status: $VALID_STATE"
  return 1
} # End checkNodeJsInstalled

# ---------- Function: Display Current Configuration ----------
showConfigAction()
{ PostInfo "Displaying pre-commit configuration..."
  if ! command -v jq &> /dev/null; then
    PostErr "jq is not installed. Unable to display JSON configuration."
    if [ -n "$GITHUB_ACTIONS" ]; then
      PostInfo "For GitHub CI/CD, add this to your workflow:"
      PostInfo "  - run: sudo apt-get update && sudo apt-get install -y jq"
    else
      PostInfo "To install jq, run:"
      PostInfo "  npm install -g jq" 
      PostInfo "For more info, visit: https://stedolan.github.io/jq/download/"
    fi
    ((VALID_STATE++))  # Increment on failure
    return 1
  fi
  if [ ! -f "$CONFIG_FILE" ]; then
    PostErr "Configuration file not found: $CONFIG_FILE"
    ((VALID_STATE++))  # Increment on failure
    return 1
  fi
  if ! jq '.' "$CONFIG_FILE" >/dev/null 2>&1; then
    PostErr "Error: Configuration file is malformed or unreadable."
    ((VALID_STATE++))  # Increment on failure
    return 1
  fi
  PostInfo "Pre-commit configuration displayed successfully."
} # End function showConfigAction

# ---------- Function: Check spelling ----------
runSpellCheck()
{ local TEXT_TO_CHECK="$1"
  local SOURCE_LABEL="$2"  # e.g., "Commit Message" or "File: filename.txt"
  local MISSPELLED_WORDS=""
  if [ "$(getJsonValue '.pre_commit.tools.spell.enabled')" != "true" ]; then
    PostDebug "SpellCheck is disabled in config. Skipping..."
    return 0
  fi
  if command -v aspell &>/dev/null; then
    MISSPELLED_WORDS=$(echo "$TEXT_TO_CHECK" | aspell --mode=none list)
  elif command -v hunspell &>/dev/null; then
    MISSPELLED_WORDS=$(echo "$TEXT_TO_CHECK" | hunspell -l)
  else
    PostWarn "Optional SpellCheck (aspell/hunspell) not installed. Skipping."
    return 0
  fi
  if [[ -n "$MISSPELLED_WORDS" ]]; then
    PostWarn "SpellCheck Warnings in $SOURCE_LABEL:"
    echo "$MISSPELLED_WORDS" | while read -r word; do
      PostWarn "  - $word"
    done
  else
    PostInfo "No spelling errors detected in $SOURCE_LABEL."
  fi
} # End function runSpellCheck

# ---------- Function: Validate Commit Message Format ----------
validateCommitMessage()
{ # arguments
  local COMMIT_MSG_FILE="$1"
  local COMMIT_MSG_CONTENT
  # Retrieve validation settings from config
  local COMMIT_REGEX=$(getJsonValue '.pre_commit.commitMessage.regex')
  local COMMIT_EXAMPLE=$(getJsonValue '.pre_commit.commitMessage.example')
  local RESERVED_WORDS=$(getJsonValue '.pre_commit.commitMessage.reservedWords')
  local MIN_WORDS=$(getJsonValue '.pre_commit.commitMessage.minWords')
  local SPELLING_THRESHOLD=$(getJsonValue '.pre_commit.commitMessage.spellingThreshold')
  # local variables
  local localResult=0
  local WORD_COUNT=0
  # Ensure defaults are set if JSON values are missing or return "null"
  [[ -z "$COMMIT_REGEX" || "$COMMIT_REGEX" == "null" ]] && COMMIT_REGEX="^(feat|fix|docs|style|refactor|perf|test|chore)\(.*\): .{10,}$"
  [[ -z "$COMMIT_EXAMPLE" || "$COMMIT_EXAMPLE" == "null" ]] && COMMIT_EXAMPLE="feat(module): description"
  [[ -z "$RESERVED_WORDS" || "$RESERVED_WORDS" == "null" ]] && RESERVED_WORDS="feat,fix,docs,style,refactor,perf,test,chore"
  [[ -z "$MIN_WORDS" || "$MIN_WORDS" == "null" ]] && MIN_WORDS=3
  [[ -z "$SPELLING_THRESHOLD" || "$SPELLING_THRESHOLD" == "null" ]] && SPELLING_THRESHOLD=60
  # Default commit message file
  if [[ -z "$COMMIT_MSG_FILE" ]]; then
    COMMIT_MSG_FILE="$PROJECT_ROOT/.git/COMMIT_EDITMSG"
  fi
  # Ensure commit message file exists
  if [[ ! -f "$COMMIT_MSG_FILE" ]]; then
    PostErr "Commit message file '$COMMIT_MSG_FILE' not found! Skipping validation."
    ((VALID_STATE++))
    return 1
  fi

  # Read commit message (first line only)
  COMMIT_MSG_CONTENT=$(head -n 1 "$COMMIT_MSG_FILE" | tr -d '\r')
  PostDebug "Commit message content: '$COMMIT_MSG_CONTENT'"

  # Retrieve validation settings from config
  COMMIT_REGEX=$(getJsonValue '.pre_commit.commitMessage.regex')
  COMMIT_EXAMPLE=$(getJsonValue '.pre_commit.commitMessage.example')
  RESERVED_WORDS=$(getJsonValue '.pre_commit.commitMessage.reservedWords')
  MIN_WORDS=$(getJsonValue '.pre_commit.commitMessage.minWords')
  SPELLING_THRESHOLD=$(getJsonValue '.pre_commit.commitMessage.spellingThreshold')

  PostDebug "Retrieved COMMIT_REGEX = '$COMMIT_REGEX'"
  PostDebug "Retrieved COMMIT_EXAMPLE = '$COMMIT_EXAMPLE'"
  PostDebug "Retrieved RESERVED_WORDS = '$RESERVED_WORDS'"
  PostDebug "Retrieved MIN_WORDS = '$MIN_WORDS'"
  PostDebug "Retrieved SPELLING_THRESHOLD = '$SPELLING_THRESHOLD'"

  # Enforce default values if missing
  [[ -z "$COMMIT_EXAMPLE" || "$COMMIT_EXAMPLE" == "null" ]] && COMMIT_EXAMPLE="feat(module): description"
  [[ -z "$MIN_WORDS" || "$MIN_WORDS" == "null" ]] && MIN_WORDS=3
  [[ -z "$SPELLING_THRESHOLD" || "$SPELLING_THRESHOLD" == "null" ]] && SPELLING_THRESHOLD=60

  # 1️⃣ **Check if commit message matches required pattern (WARN)**
  if ! echo "$COMMIT_MSG_CONTENT" | grep -E "$COMMIT_REGEX" >/dev/null 2>&1; then
    PostWarn "Commit message format does not match the expected pattern!"
    PostWarn "Expected format: $COMMIT_EXAMPLE"
  fi

  # 2️⃣ **Check if commit message contains at least one reserved word (WARN)**
  local MATCHED_RESERVED_WORD=0
  for WORD in ${RESERVED_WORDS//,/ }; do
    if echo "$COMMIT_MSG_CONTENT" | grep -iE "\b$WORD\b" >/dev/null; then
      MATCHED_RESERVED_WORD=1
      break
    fi
  done

  if [[ "$MATCHED_RESERVED_WORD" -eq 0 ]]; then
    PostWarn "Commit message does not contain a reserved keyword! Consider using one: $RESERVED_WORDS"
  fi

  # 3️⃣ **Ensure message has at least MIN_WORDS (FAIL)**
  WORD_COUNT=$(echo "$COMMIT_MSG_CONTENT" | wc -w | tr -d ' ')
  if [[ "$WORD_COUNT" -lt "$MIN_WORDS" ]]; then
    PostErr "Commit message is too short! Minimum words required: $MIN_WORDS"
    ((VALID_STATE++))
    return 1
  fi

  # 4️⃣ **Spell check commit message (FAIL if below threshold)**
  PostDebug "SPELLCHECK_ERRORS  : $SPELLCHECK_ERRORS"
  runSpellCheck buffer "$COMMIT_MSG_CONTENT"
  local WORDS_TOTAL
  WORDS_TOTAL=$(echo "$COMMIT_MSG_CONTENT" | wc -w | tr -d ' ')
  PostDebug "COMMIT_MSG_CONTENT : $COMMIT_MSG_CONTENT"
  PostDebug "WORDS_TOTAL        : $WORDS_TOTAL"
  PostDebug "SPELLCHECK_ERRORS  : $SPELLCHECK_ERRORS"
  
  if [[ "$WORDS_TOTAL" -gt 0 ]]; then
    local SPELLING_PERCENTAGE
    SPELLING_PERCENTAGE=$(( 100 - (SPELLCHECK_ERRORS * 100 / WORDS_TOTAL) ))
    PostDebug "SPELLING_PERCENTAGE   : $SPELLING_PERCENTAGE"
    local SPELLING_DIFFERENCE=$(( SPELLING_PERCENTAGE - SPELLING_THRESHOLD ))
    PostDebug "SPELLING_DIFFERENCE : $SPELLING_DIFFERENCE"
    local firstChar="${SPELLING_DIFFERENCE:0:1}"
    PostDebug "firstChar ->${firstChar}<-"
    case "$firstChar" in
      # If first character is a minus sign, we failed the threshold check
      -)  
        PostInfo "Commit message spelling accuracy is below threshold " # ($SPELLING_THRESHOLD%). Detected: $SPELLING_PERCENTAGE%"
        PostErr "Commit message spelling accuracy is below threshold ($SPELLING_THRESHOLD%). Detected: $SPELLING_PERCENTAGE%"
        ((VALID_STATE++))
        localResult=1
        ;;
      # Otherwise, we're good
      *)  
        PostDebug "Commit message spelling accuracy is acceptable."
        localResult=0
        ;;
    esac
  else
    PostErr "Commit message contains no valid words. Please provide a meaningful message."
    ((VALID_STATE++))
    localResult=1
  fi
  PostInfo "Commit message format is valid."
  return $localResult
} # End function validateCommitMessage


# ---------- Function: Run Automated Linting & Security Checks ----------
runAutomatedChecksAction()
{ local TOOL_TO_RUN="$1"
  local SCAN_SCOPE
  SCAN_SCOPE=$(getJsonValue '.scan_scope.default_path')

  # Ensure SCAN_SCOPE is never null or empty
  if [[ -z "$SCAN_SCOPE" ]]; then
    SCAN_SCOPE=""
  fi

  local ALLOW_OVERRIDES
  ALLOW_OVERRIDES=$(getJsonValue '.scan_scope.allow_overrides')

  if [[ "$ALLOW_OVERRIDES" == "true" && -n "$TOOL_TO_RUN" ]]; then
    SCAN_SCOPE="$TOOL_TO_RUN"  # Override default scan path if provided
  fi

  PostInfo "Running automated checks on '${SCAN_SCOPE:-entire repository}'..."
  local STAGED_FILES

  # Ensure proper handling of `git diff` when SCAN_SCOPE is empty
  if [[ -n "$SCAN_SCOPE" ]]; then
    STAGED_FILES=$(git diff --cached --name-only "$SCAN_SCOPE" | grep -Ev '(^node_modules/|^.git/|venv/)' || true)
  else
    STAGED_FILES=$(git diff --cached --name-only | grep -Ev '(^node_modules/|^.git/|venv/)' || true)
  fi

  if [[ -z "$STAGED_FILES" ]]; then
    PostInfo "No staged files to check in scope: ${SCAN_SCOPE:-'entire repository'}"
    return
  fi

  # Run ShellCheck if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "shellcheck" ]]; then
    if [ "$(getJsonValue '.pre_commit.tools.shellcheck.enabled')" = "true" ]; then
      if command -v shellcheck &> /dev/null; then
        PostInfo "Running ShellCheck on shell scripts in ${SCAN_SCOPE}..."
        SHELL_FILES=$(echo "$STAGED_FILES" | grep '\.sh$' || true)
        if [[ -n "$SHELL_FILES" ]]; then
          PostInfo "Files to check: $SHELL_FILES"
          if ! echo "$SHELL_FILES" | xargs -r shellcheck; then
            PostErr "ShellCheck failed!"
            ((VALID_STATE++))
          fi
        else
          PostInfo "No shell script files found in staged files."
        fi
      else
        PostWarn "Optional ShellCheck (shellcheck) not installed. Skipping."
        PostInfo "To install ShellCheck, use one of the following:"
        PostInfo "  - macOS (Homebrew)      : brew install shellcheck"
        PostInfo "  - Linux (APT)           : sudo apt install shellcheck"
        PostInfo "  - Windows (Chocolatey)  : choco install shellcheck"
        PostInfo "  - Windows (Scoop)       : scoop install shellcheck"
        PostInfo "  - Arch Linux (Pacman)   : sudo pacman -S shellcheck"
        PostInfo "  - Fedora (DNF)          : sudo dnf install ShellCheck"
        PostInfo "More info: https://www.shellcheck.net/"
      fi
    fi
  fi

  # Run JSONLint if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "jsonlint" ]]; then
    if [ "$(getJsonValue '.pre_commit.tools.jsonlint.enabled')" = "true" ]; then
      if command -v jsonlint &> /dev/null; then
        PostInfo "Running JSONLint on JSON files in ${SCAN_SCOPE}..."
        JSON_FILES=$(echo "$STAGED_FILES" | grep '\.json$' || true)
        if [[ -n "$JSON_FILES" ]]; then
          if ! echo "$JSON_FILES" | xargs -r jsonlint -q; then
            PostErr "JSONLint failed!"
            ((VALID_STATE++))
          fi
        else
          PostInfo "No JSON files found to lint in ${SCAN_SCOPE}."
        fi
      else
        PostWarn "Optional JSON Lint (jq) not installed. Skipping."
        PostInfo "To install JSON Lint, use one of the following:"
        PostInfo "  - macOS (Homebrew)      : brew install jq"
        PostInfo "  - Linux (APT)           : sudo apt install jq"
        PostInfo "  - Windows (Chocolatey)  : choco install jq"
        PostInfo "  - Windows (Scoop)       : scoop install jq"
        PostInfo "More info: https://stedolan.github.io/jq/"
      fi
    fi
  fi
  # Run YAML Lint if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "yamllint" ]]; then
    if [ "$(getJsonValue '.pre_commit.tools.yamllint.enabled')" = "true" ]; then
      if command -v yamllint &> /dev/null; then
        PostInfo "Running YAML Lint (yamllint) on YAML files in ${SCAN_SCOPE}..."
        YAML_FILES=$(echo "$STAGED_FILES" | grep -E '\.(yaml|yml)$' || true)

        if [[ -n "$YAML_FILES" ]]; then
          echo "$YAML_FILES" | xargs -r yamllint
          if [ $? -ne 0 ]; then
            PostErr "YAML Lint (yamllint) failed!"
            ((VALID_STATE++))
          fi
        else
          PostInfo "No YAML files found to lint in ${SCAN_SCOPE}."
        fi
      else
        PostWarn "Optional YAML Lint (yamllint) not installed. Skipping."
        PostInfo "To install YAML Lint locally, run:"
        PostInfo "  - Python (pip)          : pip install yamllint"
        PostInfo "  - macOS (Homebrew)      : brew install yamllint"
        PostInfo "  - Windows (Chocolatey)  : choco install yamllint"
        PostInfo "  - Windows (Scoop)       : scoop install yamllint"
        PostInfo "For GitHub CI/CD, add this step to your workflow:"
        PostInfo "  - run                   : pip install yamllint"
        PostInfo "More info: https://github.com/adrienverge/yamllint"
      fi
    fi
  fi

  # Run SpellCheck if requested or if no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "spell" ]]; then
    if [ "$(getJsonValue '.pre_commit.tools.spell.enabled')" = "true" ]; then
      PostInfo "Running SpellCheck on text files in ${SCAN_SCOPE}..."
      local SPELLCHECK_FILES_CHECKED=0
      local SPELLCHECK_ERRORS_FOUND=0
      # Get the list of excluded files from JSON
      local EXCLUDED_FILES
      EXCLUDED_FILES=$(getJsonValue '.pre_commit.file_exclusions[]')
      echo "$STAGED_FILES" | grep -E '\.(txt|md|json)$' | while read -r file; do
        # Check if the file is in the exclusion list
        if echo "$EXCLUDED_FILES" | grep -Fxq "$file"; then
          PostInfo "Skipping excluded file: $file"
          continue
        fi
        ((SPELLCHECK_FILES_CHECKED++))
        runSpellCheck "file" "$file"
        local SPELL_RESULT=$?
        PostDebug "SPELL_RESULT    : $SPELL_RESULT"
        if [[ $SPELLCHECK_ERRORS -gt 0 ]]; then
          PostWarn "SpellCheck: $SPELLCHECK_ERRORS misspelled words found in $file."
          ((SPELLCHECK_ERRORS_FOUND+=SPELLCHECK_ERRORS))
        elif [[ $SPELLCHECK_ERRORS -lt 0 ]]; then
          PostErr "SpellCheck encountered an error on file: $file."
        fi
      done
      PostInfo "SpellCheck Summary: $SPELLCHECK_FILES_CHECKED files checked, $SPELLCHECK_ERRORS_FOUND misspelled words found."
    fi
  fi
  PostInfo "Completed automated checks.${TOOL_TO_RUN:+ (Only: $TOOL_TO_RUN)} in ${SCAN_SCOPE}"
  
} # End function runAutomatedChecksAction

# ---------- Function: Check Spelling  ----------
runSpellCheck()
{ # 0	  : No spelling errors
  # >0	: Number of misspelled words
  # -1	: aspell missing (processing error)
  # -2	: Empty input provided
  local INPUT_TYPE="$1"  # "file" or "buffer"
  local INPUT_VALUE="$2" # File path or text buffer
  local MISSPELLED_WORDS=()
  SPELLCHECK_ERRORS=0
  PostDebug "11111"
  # Ensure `aspell` is available
  if ! command -v aspell &> /dev/null; then
    PostDebug "22222"
    PostWarn "Optional SpellCheck (aspell) not installed. Skipping."
    PostInfo "To install SpellCheck locally, run:"
    PostInfo "  - macOS (Homebrew)      : brew install aspell"
    PostInfo "  - Ubuntu/Debian (APT)   : sudo apt install aspell"
    PostInfo "  - Fedora (DNF)          : sudo dnf install aspell"
    PostInfo "  - Windows (Chocolatey)  : choco install aspell"
    PostInfo "  - Windows (Scoop)       : scoop install aspell"
    PostInfo "For GitHub CI/CD, add this step to your workflow:"
    PostInfo "  - run                   : sudo apt install aspell"
    PostInfo "More info: https://aspell.net/"
    return -1  # Return negative for processing error
  fi
  PostDebug "33333"
  # Validate input type
  if [[ "$INPUT_TYPE" != "file" && "$INPUT_TYPE" != "buffer" ]]; then
    PostErr "Invalid input type: '$INPUT_TYPE'. Expected 'file' or 'buffer'."
    return -2  # Invalid input type error
  fi
  PostDebug "44444"
  # Ensure input is not empty
  if [[ -z "$INPUT_VALUE" ]]; then
    PostWarn "SpellCheck received empty input."
    return -3  # Return negative for empty input
  fi
  PostDebug "55555"
  local CLEAN_TEXT
  PostDebug "INPUT_TYPE      : ->$INPUT_TYPE<-"
  if [[ "$INPUT_TYPE" == "file" ]]; then
    PostDebug "file input"
    PostDebug "66666"
    # Ensure file exists
    if [[ ! -f "$INPUT_VALUE" ]]; then
      PostErr "File '$INPUT_VALUE' not found! Skipping spell check."
      return -4  # Return negative for missing file
    fi
    PostInfo "Running SpellCheck on file: $INPUT_VALUE"
    CLEAN_TEXT=$(cat "$INPUT_VALUE")
  else
    PostDebug "77777"
    # Buffer input
    PostInfo "Running SpellCheck on provided text buffer."
    CLEAN_TEXT="$INPUT_VALUE"
  fi
  PostDebug "CLEAN_TEXT      : ->$CLEAN_TEXT<-"
  # Normalize text before spell checking
  CLEAN_TEXT=$(echo "$CLEAN_TEXT" | sed -E "
      s/([a-z])([A-Z])/\1 \2/g;   # Split camelCase -> camel Case
      s/[_\-\.]/ /g;              # Convert snake_case, kebab-case, dot.case -> spaces
      s/[^a-zA-Z0-9 ]/ /g;        # Remove non-alphanumeric characters
  ")
  PostDebug "77000"
  PostDebug "CLEAN_TEXT      : ->$CLEAN_TEXT<-"
  # Run spell check
  while IFS= read -r word; do
   PostDebug "77100"
    MISSPELLED_WORDS+=("$word")
    ((SPELLCHECK_ERRORS++))
  done < <(echo "$CLEAN_TEXT" | aspell --mode=none list)
  PostDebug "77200"
  # Report results
  if [[ "$SPELLCHECK_ERRORS" -gt 0 ]]; then
    PostWarn "SpellCheck found $SPELLCHECK_ERRORS misspelled words:"
    for word in "${MISSPELLED_WORDS[@]}"; do
      PostWarn "  - $word"
    done
  else
    PostInfo "SpellCheck: No spelling errors found."
  fi
  PostDebug "88888"
  PostDebug "Total misspellings detected: $SPELLCHECK_ERRORS"
  return 0
} # End function runSpellCheck


# ---------- Function: Enforce Classification Banners ----------
enforceClassificationBanners()
{ local OVERRIDE_LEVEL="$1"
  local CLASSIFICATION_RULES
  local VALID_CLASSIFICATIONS
  local PROJECT_SECURITY_LEVEL
  local STAGED_FILES
  # Load classification rules from JSON config
  CLASSIFICATION_RULES=$(getJsonValue '.pre_commit.classification_rules')
  PROJECT_SECURITY_LEVEL=$(getJsonValue '.pre_commit.security_level')
  VALID_CLASSIFICATIONS=$(echo "$CLASSIFICATION_RULES" | jq -r --arg level "$PROJECT_SECURITY_LEVEL" '.[$level]')
  # Allow an override security level (e.g., show warnings for all files above a certain level)
  if [[ -n "$OVERRIDE_LEVEL" && "$CLASSIFICATION_RULES" == *"$OVERRIDE_LEVEL"* ]]; then
    VALID_CLASSIFICATIONS=$(echo "$CLASSIFICATION_RULES" | jq -r --arg level "$OVERRIDE_LEVEL" '.[$level]')
    PostInfo "Overriding classification check to '$OVERRIDE_LEVEL'."
  fi
  PostInfo "Checking classification banners (Allowed: $VALID_CLASSIFICATIONS)..."
  # Get list of staged files excluding binary files and configured exclusions
  STAGED_FILES=$(git diff --cached --name-only | grep -Ev '(\.git/|venv/|node_modules/)' || true)
  if [[ -z "$STAGED_FILES" ]]; then
    PostInfo "No staged files to check for classification enforcement."
    return
  fi
  local FILE
  for FILE in $STAGED_FILES; do
    # Skip excluded files
    if [[ "$FILE" =~ $(printf "|%s" "${file_exclusions[@]}") ]]; then
      PostInfo "Skipping excluded file: $FILE"
      continue
    fi
    # Read the first 10 lines of the file
    local HEADER
    HEADER=$(head -n 10 "$FILE" 2>/dev/null)
    # Extract classification from the banner
    local FILE_CLASSIFICATION
    FILE_CLASSIFICATION=$(echo "$HEADER" | grep -Eo 'PUBLIC|UNCLASSIFIED|SENSITIVE|SECRET|TOP SECRET')
    if [[ -z "$FILE_CLASSIFICATION" ]]; then
      PostWarn "$FILE is missing a classification banner."
      ((VALID_STATE++))
      continue
    fi
    if ! [[ "$VALID_CLASSIFICATIONS" =~ $FILE_CLASSIFICATION ]]; then
      PostWarn "$FILE has an invalid classification '$FILE_CLASSIFICATION'. Expected: $VALID_CLASSIFICATIONS"
      ((VALID_STATE++))
    fi
  done
  PostInfo "Classification banner check complete."
} # End function enforceClassificationBanners


# ---------- Function: Check Metadata Compliance ----------
checkMetadataComplianceAction()
{ PostInfo "Checking metadata compliance..."
  local TODAY=$(date +%Y-%m-%d)
  local LAST_REVISION_REQUIRED=$(getJsonValue '.metadata_checks.lastRevision_required')
  local LAST_REVISION_DETAILS_REQUIRED=$(getJsonValue '.metadata_checks.lastRevisionDetails_required')
  for file in $(find . -name "*.json"); do
    if [ "$LAST_REVISION_REQUIRED" = "true" ] && ! grep -q "\"lastRevision\": \"$TODAY\"" "$file"; then
      PostErr "$file is missing lastRevision: $TODAY"
    fi
    if [ "$LAST_REVISION_DETAILS_REQUIRED" = "true" ] && ! grep -q "\"lastRevisionDetails\":" "$file"; then
      PostErr "$file is missing lastRevisionDetails."
    fi
  done
} # End function checkMetadataComplianceAction

# ---------- Function: Check Security Classification ----------
checkSecurityLevelAction()
{ PostInfo "Checking security level compliance..."
  local ALLOWED_LEVELS=$(getJsonValue ".security.levels.$SECURITY_LEVEL | join(\" \")")
  for file in $(git diff --cached --name-only); do
    local FILE_SECURITY_LEVEL=$(grep -Po '"securityLevel":\s*"\K[^"]+' "$file" 2>/dev/null)
    if [ -n "$FILE_SECURITY_LEVEL" ] && ! echo "$ALLOWED_LEVELS" | grep -q "$FILE_SECURITY_LEVEL"; then
      PostErr "$file is classified as $FILE_SECURITY_LEVEL but only $ALLOWED_LEVELS are allowed!"
    fi
  done
} # End function checkSecurityLevelAction

# ---------- Function: Parsing the options ----------
processArguments()
{ PostInfo "Processing Arguments: $@"
  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      # Run all checks
      -a|--all)  
        showConfigAction
        runAutomatedChecksAction
        checkMetadataComplianceAction
        checkSecurityLevelAction
        validateCommitMessage
        enforceClassificationBanners
        ;;

      # Validate commit message (optional argument for file)
      -c|--commit-msg)  
        shift
        if [[ "$1" =~ ^-  ||  -z "$1" ]]; then
          USER_COMMIT_MSG_FILE=""
        else
          USER_COMMIT_MSG_FILE="$1"
        fi
        validateCommitMessage
        ;;

      # Show pre-commit configuration
      -d|--display-config)  
        showConfigAction
        ;;

      # Show help
      -h|--help)  
        showHelp
        ((VALID_STATE++))
        break
        ;;

      # Run classification check with an override level
      -l|--lower)  
        shift
        if [[ -z "$1" || "$1" =~ ^- ]]; then
          LOWER_CLASSIFICATION=$(getJsonValue ".pre_commit.security_level")
          PostInfo "No classification level provided. Defaulting to project level: $LOWER_CLASSIFICATION"
        else
          VALID_CLASSIFICATIONS=$(getJsonValue ".pre_commit.classification_labels | join(\" \")")
          if ! echo "$VALID_CLASSIFICATIONS" | grep -q -w "$1"; then
            PostErr "Invalid classification level: '$1'. Allowed values: $VALID_CLASSIFICATIONS"
            ((VALID_STATE++))
            return
          else
            LOWER_CLASSIFICATION="$1"
          fi
        fi
        enforceClassificationBanners "$LOWER_CLASSIFICATION"
        ;;

      # Validate metadata in committed files
      -m|--meta)  
        checkMetadataComplianceAction
        ;;

      # Override the scan path
      -p|--path)  
        shift
        if [[ -z "$1" || "$1" =~ ^- ]]; then
          PostErr "No path specified for --path option."
          ((VALID_STATE++))
        elif [ ! -d "$1" ]; then
          PostErr "Specified path '$1' does not exist or is not a directory."
          ((VALID_STATE++))
        else
          SCAN_PATH="$1"
        fi
        ;;

      # Perform security level checks
      -s|--security)  
        checkSecurityLevelAction
        ;;

      # Run all tools or a specific tool
      -t|--tool)  
        shift
        if [[ -z "$1" || "$1" =~ ^- ]]; then
          TOOL_NAME=""
          set -- "$@"  # Reset arguments to prevent shift issues
        else
          TOOL_NAME="$1"
          shift
        fi
        AVAILABLE_TOOLS=$(getJsonValue ".pre_commit.tools | keys | join(\" \")")
        if [[ -n "$TOOL_NAME" && ! " $AVAILABLE_TOOLS " =~ " $TOOL_NAME " ]]; then
          PostErr "Invalid tool: '$TOOL_NAME'. Available tools: $AVAILABLE_TOOLS"
          ((VALID_STATE++))
          return
        fi
        runAutomatedChecksAction "$TOOL_NAME"
        ;;

      # Enable verbose logging
      -v|--verbose)  
        LOCAL_VERBOSE=true
        ;;

      # Handle unknown options (log warning but continue execution)
      *)  
        PostWarn "Unknown option $1"
        showHelp
        return
        ;;
    esac
    shift
  done
  return $VALID_STATE
} # End function processArguments

PostInfo "Starting Pre-Commit Hook Processing"
setupEnvironment
PostDebug "processArguments $@"
processArguments "$@"
RETURN_CODE=$? 
PostInfo "RETURN_CODE $RETURN_CODE"
PostInfo "VALID_STATE $VALID_STATE"
if [[ $RETURN_CODE -eq 0 && $VALID_STATE -eq 0 ]]; then
  loadConfig
  validateCommitMessage
fi
PostInfo "Completed Pre-Commit Hook Processing with VALID_STATE=$VALID_STATE"
exit "$VALID_STATE"

