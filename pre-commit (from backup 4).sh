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
  CONFIG_FILE="Data/pre_commit_config.json"
  SECURITY_LEVEL="UNCLASSIFIED"  # Default security level
  LOCAL_VERBOSE=true             # Default verbosity
  STAGED_FILES_EXIST=false       # Default to no files
  VALID_STATE=0                  # Tracks validation failures
  SCAN_PATH=$(getJsonValue ".scan_scope.default_path")
  # Ensure SCAN_PATH is set to "." if no value exists
  if [[ -z "$SCAN_PATH" || "$SCAN_PATH" == "null" ]]; then
    SCAN_PATH="."
  fi
  loadJsonValues                 # Load the config values from JSON
  checkNodeJsInstalled           # Check for Node.js installation
  checkStagedFiles               # Check if there are any staged files
  PostInfo "Environment setup complete. Using scan path: '$SCAN_PATH'"
} # End function setupEnvironment

# ---------- Logging Functions ----------
timestamp() 
{ echo "$(date '+%Y-%m-%d %H:%M:%S')"; 
} # End function timestamp
PostInfo()
{ if [ "$LOCAL_VERBOSE" = true ]; then 
    echo "--   [INFO] $(timestamp) -> $1"; 
  fi; 
} # End function PostInfo
PostWarn()
{ echo "--+++ [WARN] $(timestamp) -> $1"; 
} # End function PostWarn
PostErr()
{ echo "--*** [ERROR] $(timestamp) -> $1" >&2; ((VALID_STATE++)); 
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
{
  local JSON_PATH="$1"
  local CONFIG_FILE="Data/pre_commit_config.json"

  # Ensure the file exists
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "ERROR: Config file not found at: $CONFIG_FILE" >&2
    return 1
  fi

  # Retrieve the value **without logging extra messages**
  local VALUE
  VALUE=$(jq -r "$JSON_PATH" "$CONFIG_FILE" 2>/dev/null)

  # Ensure only the raw value is returned
  if [[ "$VALUE" == "null" || -z "$VALUE" ]]; then
    echo ""
  else
    echo "$VALUE"
  fi
} # End function getJsonValue

# ---------- Function: Load Security & Verbose Config ----------
loadConfig()
{ PostInfo "Loading pre-commit configuration..."
  SECURITY_LEVEL=$(getJsonValue "._classification.level")
  LOCAL_VERBOSE=$(getJsonValue ".verbose.enabled")
  if [ -z "$SECURITY_LEVEL" ] || [ "$SECURITY_LEVEL" = "null" ]; then SECURITY_LEVEL="UNCLASSIFIED"; fi
  if [ -z "$LOCAL_VERBOSE" ] || [ "$LOCAL_VERBOSE" = "null" ]; then LOCAL_VERBOSE=false; fi
  PostInfo "Config loaded: SECURITY_LEVEL=$SECURITY_LEVEL, VERBOSE=$LOCAL_VERBOSE"
} # End function loadConfig

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
getJsonValue() {
  local JSON_PATH="$1"
  local CONFIG_FILE="Data/pre_commit_config.json"

  # Ensure the file exists
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "ERROR: Config file not found at: $CONFIG_FILE" >&2
    return 1
  fi

  # Retrieve the value **without logging extra messages**
  local VALUE
  VALUE=$(jq -r "$JSON_PATH" "$CONFIG_FILE" 2>/dev/null)

  # Ensure only the raw value is returned
  if [[ "$VALUE" == "null" || -z "$VALUE" ]]; then
    echo ""
  else
    echo "$VALUE"
  fi
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
  if ! jq '.' "$CONFIG_FILE"; then
    PostErr "Error: Configuration file is malformed or unreadable."
    ((VALID_STATE++))  # Increment on failure
    return 1
  fi
  PostInfo "Pre-commit configuration displayed successfully."
} # End function showConfigAction

# ---------- Function: Validate Commit Message Format ----------
validateCommitMessage()
{
  local COMMIT_MSG_FILE="$1"
  local COMMIT_REGEX
  local COMMIT_EXAMPLE

  PostInfo "DEBUG: Attempting to retrieve commit message config from JSON..."

  COMMIT_REGEX=$(getJsonValue '.pre_commit.commitMessage.regex')
  COMMIT_EXAMPLE=$(getJsonValue '.pre_commit.commitMessage.example')

  PostInfo "DEBUG: Retrieved COMMIT_REGEX = '$COMMIT_REGEX'"
  PostInfo "DEBUG: Retrieved COMMIT_EXAMPLE = '$COMMIT_EXAMPLE'"

  if [[ -z "$COMMIT_REGEX" || "$COMMIT_REGEX" == "null" ]]; then
    PostErr "Commit message validation regex not found in pre_commit_config.json!"
    ((VALID_STATE++))
    return 1
  fi

  if [[ -z "$COMMIT_EXAMPLE" || "$COMMIT_EXAMPLE" == "null" ]]; then
    PostWarn "Expected commit message example missing. Validation will proceed without it."
    COMMIT_EXAMPLE="<type>(<module>): <summary>"
  fi
} # End function validateCommitMessage

# ---------- Function: Check if there any staged files ----------
checkStagedFiles()
{ PostInfo "Checking staged and modified files..."
  if [[ -n "$GITHUB_ACTIONS" ]]; then
    # Running in GitHub Actions - Compare last two commits
    PostInfo "GitHub Actions detected. Checking changes against the last commit..."
    STAGED_FILES=$(git diff --name-only HEAD^ HEAD | grep -Ev '(^node_modules/|^.git/|venv/)' || true)
  else
    # Running locally - Use staged files
    STAGED_FILES=$(git diff --cached --name-only | grep -Ev '(^node_modules/|^.git/|venv/)' || true)
    UNSTAGED_FILES=$(git diff --name-only | grep -Ev '(^node_modules/|^.git/|venv/)' || true)
    if [[ -z "$STAGED_FILES" ]]; then
      PostWarn "No staged files detected. Some tools may be skipped."
      if [[ -n "$UNSTAGED_FILES" ]]; then
        PostWarn "Modified but unstaged files detected! Did you forget to run 'git add .'?"
        PostInfo "Unstaged modified files:"
        echo "$UNSTAGED_FILES" | while read -r file; do
          PostInfo "  - $file"
        done
      fi
    else
      PostInfo "Staged files detected. Proceeding with validation."
    fi
  fi
} # End function checkStagedFiles

# ---------- Function: Run Automated Linting & Security Checks ----------
runAutomatedChecksAction()
{ local TOOL_TO_RUN="$1"
  local SCAN_SCOPE=$(getJsonValue '.scan_scope.default_path')
  local ALLOW_OVERRIDES=$(getJsonValue '.scan_scope.allow_overrides')

  if [[ "$ALLOW_OVERRIDES" == "true" && -n "$TOOL_TO_RUN" ]]; then
    SCAN_SCOPE="$TOOL_TO_RUN"  # Override default scan path if provided
  fi

  PostInfo "Running automated checks on '${SCAN_SCOPE:-entire repository}'..."
  local STAGED_FILES
  STAGED_FILES=$(git diff --cached --name-only "$SCAN_SCOPE" | grep -Ev '(^node_modules/|^.git/|venv/)' || true)

  if [ "$STAGED_FILES_EXIST" = "false" ]; then
    PostInfo "No staged files detected. Some tools may be skipped."
    return
  fi

  # Run ShellCheck if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "shellcheck" ]]; then
    if [[ "$STAGED_FILES_EXIST" == "true" ]]; then
      if [ "$(getJsonValue '.pre_commit.tools.shellcheck.enabled')" = "true" ]; then
        if command -v shellcheck &> /dev/null; then
          PostInfo "Running ShellCheck on shell scripts in ${SCAN_SCOPE}..."
          
          # Filter shell script files from staged files
          SHELL_FILES=$(echo "$STAGED_FILES" | grep '\.sh$' || true)
          if [[ -n "$SHELL_FILES" ]]; then
            PostInfo "Files to check: $SHELL_FILES"
  
            # Run ShellCheck and handle errors
            if ! echo "$SHELL_FILES" | xargs -r shellcheck; then
              PostErr "ShellCheck failed!"
              ((VALID_STATE++))
            fi
          else
            PostInfo "No shell script files found in staged files."
          fi
        else
          PostWarn "Optional ShellCheck not installed. Skipping."
          PostInfo "To install ShellCheck locally, run:"
          PostInfo "  - Linux (Debian/Ubuntu) : sudo apt install shellcheck"
          PostInfo "  - Linux (Fedora)        : sudo dnf install ShellCheck"
          PostInfo "  - macOS (Homebrew)      : brew install shellcheck"
          PostInfo "  - Windows (Chocolatey)  : choco install shellcheck"
          PostInfo "  - Windows (Scoop)       : scoop install shellcheck"
          PostInfo "For GitHub CI/CD, add this step to your workflow:"
          PostInfo "  - run                   : sudo apt install shellcheck"
          PostInfo "More info: https://github.com/koalaman/shellcheck#installing"
        fi
      fi
    else
      PostWarn "Skipping ShellCheck: No staged files detected."
    fi  
  fi  

  # Run JSONLint if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "jsonlint" ]]; then
    if [[ "$STAGED_FILES_EXIST" == "true" ]]; then
      if [ "$(getJsonValue '.pre_commit.tools.jsonlint.enabled')" = "true" ]; then
        if command -v jsonlint &> /dev/null; then
          PostInfo "Running JSONLint on JSON files in ${SCAN_SCOPE}..."
          
          # Filter JSON files from staged files
          JSON_FILES=$(echo "$STAGED_FILES" | grep '\.json$' || true)
          if [[ -n "$JSON_FILES" ]]; then
            PostInfo "Files to check: $JSON_FILES"
  
            # Run JSONLint and handle errors
            if ! echo "$JSON_FILES" | xargs -r jsonlint -q; then
              PostErr "JSONLint failed!"
              ((VALID_STATE++))
            fi
          else
            PostInfo "No JSON files found to lint in ${SCAN_SCOPE}."
          fi
        else
          PostWarn "Optional JSONLint not installed. Skipping."
          PostInfo "To install JSONLint locally, run:"
          PostInfo "  - Node.js (npm)         : npm install -g jsonlint"
          PostInfo "  - macOS (Homebrew)      : brew install jsonlint"
          PostInfo "  - Windows (Chocolatey)  : choco install jsonlint"
          PostInfo "  - Windows (Scoop)       : scoop install jsonlint"
          PostInfo "For GitHub CI/CD, add this step to your workflow:"
          PostInfo "  - run                   : npm install -g jsonlint"
          PostInfo "More info: https://github.com/zaach/jsonlint"
        fi
      fi
    else
      PostWarn "Skipping JSONLint: No staged files detected."
    fi  
  fi 

  # Run SpellCheck if requested or no specific tool was provided
  if [[ -z "$TOOL_TO_RUN" || "$TOOL_TO_RUN" == "spell" ]]; then
    if [[ "$STAGED_FILES_EXIST" == "true" ]]; then
      if [ "$(getJsonValue '.pre_commit.tools.spell.enabled')" = "true" ]; then
        if command -v aspell &> /dev/null; then
          PostInfo "Running SpellCheck on text files in ${SCAN_SCOPE}..."
          local SPELLCHECK_FILES_CHECKED=0
          local SPELLCHECK_ERRORS_FOUND=0
          
          # Filter text-based files from staged files
          SPELL_FILES=$(echo "$STAGED_FILES" | grep -E '\.(txt|md|json)$' || true)
          
          if [[ -n "$SPELL_FILES" ]]; then
            PostInfo "Files to check: $SPELL_FILES"
  
            # Process each file
            while read -r file; do
              ((SPELLCHECK_FILES_CHECKED++))
              PostInfo "Checking spelling in: $file"
  
              # Extract words and run Aspell
              cat "$file" | sed -E '
                s/([a-z])([A-Z])/\1 \2/g;   # Split camelCase -> camel Case
                s/[_\-\.]/ /g;              # Convert snake_case, kebab-case, dot.case -> spaces
                s/[^a-zA-Z0-9 ]/ /g;        # Remove non-alphanumeric characters
              ' | aspell --mode=none list | while read -r word; do
                PostWarn "Misspelled word in $file: $word"
                ((SPELLCHECK_ERRORS_FOUND++))
              done
            done <<< "$SPELL_FILES"
  
            PostInfo "SpellCheck Summary: $SPELLCHECK_FILES_CHECKED files checked,   $SPELLCHECK_ERRORS_FOUND misspelled words found."
          else
            PostInfo "No text-based files found for SpellCheck in ${SCAN_SCOPE}."
          fi
        else
          PostWarn "Optional SpellCheck (aspell) not installed. Skipping."
          PostInfo "To install aspell locally, run:"
          PostInfo "  - Linux (Debian/Ubuntu)  : sudo apt install aspell"
          PostInfo "  - Linux (Fedora/RHEL)    : sudo dnf install aspell"
          PostInfo "  - macOS (Homebrew)       : brew install aspell"
          PostInfo "  - Windows (Chocolatey)   : choco install aspell"
          PostInfo "  - Windows (Scoop)        : scoop install aspell"
          PostInfo "For GitHub CI/CD, add this step to your workflow:"
          PostInfo "  - run                    : sudo apt install aspell"
          PostInfo "More info: https://gnu.org/software/aspell/"
        fi
      fi
    else
      PostWarn "Skipping SpellCheck: No staged files detected."
    fi  
  fi  
  PostInfo "Completed automated checks.${TOOL_TO_RUN:+ (Only: $TOOL_TO_RUN)} in ${SCAN_SCOPE}"
} # End function runAutomatedChecksAction

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
  local LAST_REVISION_REQUIRED=$(loadJsonValue '.metadata_checks.lastRevision_required')
  local LAST_REVISION_DETAILS_REQUIRED=$(loadJsonValue '.metadata_checks.lastRevisionDetails_required')
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
  local ALLOWED_LEVELS=$(loadJsonValue ".security.levels.$SECURITY_LEVEL | join(\" \")")
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
  local returnCounter=0

  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      # Run all checks (but does NOT commit)
      -a|--all)  
        showConfigAction
        runAutomatedChecksAction
        checkMetadataComplianceAction
        checkSecurityLevelAction
        validateCommitMessage
        enforceClassificationBanners
        ;;

      # Execute all checks AND perform the commit
      -e|--execute)
        showConfigAction
        runAutomatedChecksAction
        checkMetadataComplianceAction
        checkSecurityLevelAction
        validateCommitMessage
        enforceClassificationBanners
        PostInfo "Executing Git Commit..."
        git commit -m "Auto-commit via pre-commit hook"
        ;;

      # Validate commit message (optional argument for file)
      -c|--commit-msg)  
        shift
        if [[ -z "$1" || "$1" =~ ^- ]]; then
          USER_COMMIT_MSG_FILE=".git/COMMIT_EDITMSG"  # Set default commit message file
        else
          USER_COMMIT_MSG_FILE="$1"
        fi
      
        # Check if commit message file exists
        if [[ ! -f "$USER_COMMIT_MSG_FILE" ]]; then
          PostErr "Commit message file '$USER_COMMIT_MSG_FILE' not found!"
          ((VALID_STATE++))
          return 1
        fi
      
        validateCommitMessage "$USER_COMMIT_MSG_FILE"
        ((returnCounter++))
        ;;

      # Show pre-commit configuration
      -d|--display-config)  
        showConfigAction
        ((returnCounter++))
        ;;

      # Show help
      -h|--help)  
        showHelp
        ((returnCounter++))
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
        ((returnCounter++))
        ;;

      # Validate metadata in committed files
      -m|--meta)  
        checkMetadataComplianceAction
        ((returnCounter++))
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
        ((returnCounter++))
        ;;

      # Perform security level checks
      -s|--security)  
        checkSecurityLevelAction
        ((returnCounter++))
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
        ((returnCounter++))
        ;;

      # Enable verbose logging
      -v|--verbose)  
        LOCAL_VERBOSE=true
        ((returnCounter++))
        ;;

      # Handle unknown options (log warning but continue execution)
      *)  
        PostWarn "Unknown option $1"
        showHelp
        ((returnCounter++))
        ;;
    esac
    shift
  done

  return "$returnCounter"
} # End function processArguments


# ========== MAIN ==========
PostInfo "Starting Pre-Commit Hook Processing"
setupEnvironment
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
