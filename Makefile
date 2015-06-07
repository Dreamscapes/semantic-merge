# Dreamscapes\semantic-merge
#
# Licensed under the BSD-3-Clause license
# For full copyright and license information, please see the LICENSE file
#
# @author       Robert Rossmann <rr.rossmann@me.com>
# @copyright    2015 Robert Rossmann
# @link         https://github.com/Dreamscapes/semantic-merge
# @license      http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License

# Default - Run it all! (except for coveralls - that should be run only from Travis)
all: install lint test docs coverage

include targets/nodejs/*.mk
include targets/shared/*.mk

# Project-specific information
ghuser = Alaneor
lintfiles = lib test
testflags += --require should

# Define version constraints
gh-pages: platform-version
coveralls: platform-version
