# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
# Rules Directory README
#
# This document describes the pre-commit rule framework used by Dido Solutions.
# It provides guidelines for creating and integrating new pre-commit hooks into
# the system, ensuring modularity and extensibility.
#
# License: MIT
#
# Author(s):
#   - Dido Solutions Inc.
#   - R. W. "Nick" Stavros, Ph.D.
#   - Hamish I. MacCloud, AIA
#
# ----------------------------------------------------------------------------

# Rules Directory

This directory contains standalone scripts for individual pre-commit checks. Each rule is self-contained and follows a standardized interface, allowing easy integration into the pre-commit workflow.

## Rule Naming Convention
All rules should follow the naming convention:

```
Vcc<ruleName>Rule.sh
```

For example:
- `VcsShellCheckRule.sh` for ShellCheck
- `VscYamlRule.sh` for YAML validation
- `VscSpellRule.sh` for spell checking

This naming convention ensures consistency and easy identification of rules.

## Rule Interface
Each rule script must support the following command-line options:

### **1. Help Option (`--help` or `-h`)**
Displays a brief usage guide. This option is **only available in local mode**.

```bash
./Rules/VscSpellRule.sh --help
./Rules/VscSpellRule.sh -h
```

### **2. Environment Setup (`--setupEnvironment`)**
Validates dependencies and provides installation instructions if missing.

```bash
./Rules/VscSpellRule.sh --setupEnvironment
```

### **3. Read a Single File (`--file <filename>` or `-f <filename>`)**
Reads the contents of a file to be processed by `--buffer`.

```bash
./Rules/VscSpellRule.sh --file README.md
./Rules/VscSpellRule.sh -f README.md
```

### **4. Process Staged Files (`--staged [<list-of-files>]` or `-s [<list-of-files>]`)**
Processes a set of staged files. If no list is provided, it checks `git diff --cached` for staged files.

```bash
./Rules/VscSpellRule.sh --staged
./Rules/VscSpellRule.sh -s
```

OR specify files manually:

```bash
./Rules/VscSpellRule.sh --staged file1.md file2.yml
./Rules/VscSpellRule.sh -s file1.md file2.yml
```

### **5. Process a Buffer (`--buffer "<text>"` or `-b "<text>"`)**
Processes the provided text buffer instead of a file. This is the main processing function.

```bash
echo "Some sample text" | ./Rules/VscSpellRule.sh --buffer
echo "Some sample text" | ./Rules/VscSpellRule.sh -b
```

## Pre-Commit Hook Integration
The main `pre-commit.sh` script dynamically loads and executes all rules in this directory. Any new rule added to `Rules/` is automatically used without modifying `pre-commit.sh`.

### **Common Functions & Configuration Handling**
All rules should source `common.sh` to access shared functionality:

```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
source "$SCRIPT_DIR/common.sh"
```

This provides:
- **Logging**: `PostInfo`, `PostDebug`, `PostWarn`, `PostErr`
- **JSON Configuration Handling**: `loadJsonConfigValues`, `getJsonValue`, `getJsonValueOrDefault`
- **Verbosity Settings**: `loadVerbositySettings`

### **JSON Configuration File**
Configuration is stored in `Data/pre_commit_config.json`. 
Rules should use `getJsonValueOrDefault` to retrieve values safely.

## Adding a New Rule
To add a new rule:
1. Create a new script in `Rules/` following the naming convention (e.g., `CheckYamlRule.sh`).
2. Ensure it follows the standard interface.
3. Make it executable:
   ```bash
   chmod +x Rules/VscYamlRule.sh
   ```
4. Test it locally before committing.

## Example Rule: `VscSpellRule.sh`
Each rule script should follow this structure:

```bash
#!/bin/bash

# Load shared functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
source "$SCRIPT_DIR/common.sh"

function showHelp
{ echo "Usage: $(basename "$0") [-h|--help] [--setupEnvironment] [-f|--file <filename>] [-s|--staged] [-b|--buffer]"
} # End function showHelp

function setupEnvironment
{ if ! command -v aspell &> /dev/null; then
    echo "Error: aspell is not installed.\nRun: sudo apt install aspell"
    exit 1
  fi
} # End function setupEnvironment

function readFile
{ local file="$1"
  cat "$file"
} # End function readFile

function processBuffer
{ echo "Checking spelling in provided buffer..."
  aspell list
} # End function processBuffer

function processStaged
{ local files
  files=$(git diff --cached --name-only | grep -E '\.md|\.txt$')
  
  for file in $files; do
    readFile "$file" | processBuffer
  done
} # End Function processStaged

# =================================================================
# ---------- MAIN: ------------------------------------------------
case "$1" in
  -h|--help) showHelp ;;
  --setupEnvironment) setupEnvironment ;;
  -f|--file) readFile "$2" | processBuffer ;;
  -s|--staged) processStaged ;;
  -b|--buffer) processBuffer ;;
  *) echo "Invalid option. Use --help for usage." ;;
esac
```

## Future Expansion
- Additional rules (e.g., `FOSSology`, security scans) can be added to this directory.
- `pre-commit.sh` will automatically detect and execute them.

---

This setup ensures that the pre-commit framework remains **modular, extensible, and maintainable**.
