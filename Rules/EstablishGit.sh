#!/bin/bash
# ----------------------------------------------------------------------------
# PUBLIC
# ----------------------------------------------------------------------------
#  EstablishGitMain.sh - Establishes Git Repository with only a main and 
#  without master
# 
# This script is useful for ensuring that every new repository starts 
# with main without dealing with master.
#  1. It initializes a Git repository if one doesn't already exist.
#  2. It explicitly sets the default branch to main.
#  3. If a master branch exists, it deletes it.
#  4. If master does not exist, it skips deletion.
#
# Usage:
#   ./EstablishGitMain.sh
#
# Author(s):
#   - Dido Solutions Inc.
#   - R. W. "Nick" Stavros, Ph.D.
#   - Hamish I. MacCloud, AIA
#
# License: MIT
# ----------------------------------------------------------------------------
# Ensure script fails on error
set -e

# ---------- Function: findAndSourceCommon
findAndSourceCommon()
{ local dir
  dir=$(pwd)
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/common.sh" ]; then
      echo "Found common.sh in $dir. Sourcing..."
      source "$dir/common.sh"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  echo "Warning: common.sh not found. Proceeding without additional functions."
  return 1
} # End Function findAndSourceCommon

# ---------- Function: checkGitRepo
# Function to check if inside a Git repository
checkGitRepo() {
  if [ -d ".git" ]; then
    PostInfo "Git repository already initialized."
    return 0
  else
    PostInfo "Initializing new Git repository..."
    git init
  fi
} # End function checkGitRepo

# ---------- Function: checkCleanDirectory
# Function to check if the directory is empty (except for .git)
checkCleanDirectory()
{ if [ "$(ls -A | grep -v '^\.git$')" ]; then
    PostWarn "This directory is not empty!"
    PostWarn "It is recommended to run this script in a NEW, EMPTY directory."
    PostWarn "If you proceed, untracked files might be lost when switching branches."
    read -p "Are you sure you want to continue? (y/N) " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      echo "Aborting setup."
      exit 1
    fi
  fi
} # End function checkCleanDirectory

# ---------- Function: checkGitRepo
# Function to check if inside a Git repository
checkGitRepo()
{ if [ -d ".git" ]; then
    echo "Git repository already initialized."
  else
    echo "Initializing new Git repository..."
    git init
  fi
} # End Function checkGitRepo

# ---------- Function: setMainBranch
# Function to set default branch to 'main'
setMainBranch() 
{ PostInfo "Setting default branch to 'main'..."
  git symbolic-ref HEAD refs/heads/main
} # End Function setMainBranch

# ---------- Function: removeMasterBranch
# Function to delete 'master' branch if it exists
removeMasterBranch() {
  if git show-ref --verify --quiet refs/heads/master; then
    PostWarn "Deleting 'master' branch..."
    git branch -D master
  else
    PostInfo "'master' branch does not exist. Skipping deletion."
  fi
} # End Function removeMasterBranch

# ---------- Function: removeMasterBranch
# Function to delete 'master' branch if it exists
removeMasterBranch()
{ if git show-ref --verify --quiet refs/heads/master; then
    PostWarn "Deleting 'master' branch..."
    git branch -D master
  else
    PostInfo "'master' branch does not exist. Skipping deletion."
  fi
} # End Function removeMasterBranch

# Function to parse command-line options
parseOptions()
{ while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -e|--exists)
        GIT_EXISTS=true
        ;;
      -f|--force)
        FORCE=true
        ;;
      -h|--help)
        usage
        ;;
      -m|--hasMaster)
        HAS_MASTER=true
        ;;
      -v|--verbose)
        VERBOSE=true
        ;;
      *)
        echo "Unknown option: $1"
        usage
        ;;
    esac
    shift
  done
} # End Function parseOptions

# ---------- Function: EstablishGit
# EstablishGit function to execute all steps
EstablishGit() 
{ checkCleanDirectory      || exit 1
  checkGitRepo             || exit 1
  setMainBranch            || exit 1
  removeMasterBranch       || exit 1
  PostInfo "Git repository is now set up with 'main' as the default branch."
} # End Function main

# =================================================================
# ---------- MAIN: ------------------------------------------------
# This is the only part of the EstablishGitMain that executes.
  EstablishGit

