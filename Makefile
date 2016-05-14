# semantic-merge
#
# @author      Robert Rossmann <rr.rossmann@me.com>
# @copyright   2015 Robert Rossmann
# @license     http://choosealicense.com/licenses/bsd-3-clause  BSD-3-Clause License

# Default - Run it all! (except for coveralls - that should be run only from Travis)
all: install lint test docs coverage

include targets/nodejs/*.mk
include targets/shared/*.mk

# Project-specific information
ghuser = Alaneor
lintfiles = lib test bench
testflags += --require should
platform_t = v6.1

# Define version constraints
gh-pages: platform-version
coveralls: platform-version

# Project-specific targets
bench:
	@node bench

.PHONY: bench
