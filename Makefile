# Dreamscapes\semantic-merge
#
# Licensed under the BSD-3-Clause license
# For full copyright and license information, please see the LICENSE file
#
# @author       Robert Rossmann <rr.rossmann@me.com>
# @copyright    2015 Robert Rossmann
# @link         https://github.com/Dreamscapes/semantic-merge
# @license      http://choosealicense.com/licenses/BSD-3-Clause  BSD-3-Clause License

# Helper vars
BIN = node_modules/.bin/
# Current Node.js version (in the form v{MAJOR}.{MINOR}, i.e. v0.12)
NODE_V = $(shell node -v | cut -f1,2 -d".")
# If there is any target that mutates some remote data, check if it runs on this version of Node
NODE_T = v0.12
# Command line args for Mocha test runner
MOCHAFLAGS = --require should

# Project-specific information
GH_USER = Alaneor
GH_REPO = $(shell git remote -v | grep origin | grep fetch | cut -d":" -f2 | cut -d"." -f1)

# Project-specific paths
LIBDIR = lib
TSTDIR = test
DOCDIR = docs
COVDIR = coverage
GHPDIR = gh-pages

# Set/override some variables for Travis

# Travis cannot access our repo using just a username - a token is necessary to be exported into
# GH_TOKEN env variable
GH_USER := $(if ${GH_TOKEN},${GH_TOKEN},$(GH_USER))
# This will usually not change, but if someone forks our repo, this should make sure Travis will
# not try to update the source repo
GH_REPO := $(if ${TRAVIS_REPO_SLUG},${TRAVIS_REPO_SLUG},$(GH_REPO))


# Default - Run it all! (except for coveralls - that should be run only from Travis)
all: install lint test coverage docs

# Install dependencies (added for compatibility reasons with usual workflows with make,
# i.e. calling make && make install)
install:
	@npm install

# Lint all js files (configuration available in .jshintrc)
lint:
	@$(BIN)eslint $(LIBDIR) $(TSTDIR)

# Run tests using Mocha
test:
	@$(BIN)mocha $(MOCHAFLAGS)

# Generate coverage report (html report available in coverage/lcov-report)
coverage:
	@$(BIN)istanbul cover $(BIN)_mocha > /dev/null -- $(MOCHAFLAGS)

# Submit coverage results to Coveralls (works from Travis; from localhost, additional setup is
# necessary
coveralls: restrict-node-v coverage
	@$(BIN)coveralls < $(COVDIR)/lcov.info

# Generate API documentation
docs:
	@$(BIN)jsdoc --destination $(DOCDIR) -c .jsdoc.json

# Update gh-pages branch with new docs
gh-pages: restrict-node-v clean-gh-pages docs
	$(eval COMMIT_MSG := $(if ${TRAVIS},\
		"Updated gh-pages from Travis build ${TRAVIS_JOB_NUMBER}",\
		"Updated gh-pages manually"))
ifeq (${TRAVIS}, true)
	git config --global user.name "Travis-CI"
	git config --global user.email "travis@travis-ci.org"
endif
	@git clone --branch=gh-pages \
			https://$(GH_USER)@github.com/$(GH_REPO).git $(GHPDIR) > /dev/null 2>&1; \
		cd $(GHPDIR); \
		rm -rf *; \
		cp -Rf ../$(DOCDIR)/* .; \
		git add -A; \
		git commit -m $(COMMIT_MSG); \
		git push --quiet origin $(GHPDIR) > /dev/null 2>&1;

# Intermediate target to ensure that a task will only run on a specific Node.js version
# NODE_V -> Current Node.js version
# NODE_T -> Target Node.js version
restrict-node-v:
ifneq ($(NODE_V), $(NODE_T))
	@echo "This task modifies remote resources and requires specific version of Node.js runtime."
	@echo "Node.js version required: $(NODE_T), got $(NODE_V) - bail out"
	@exit 1
endif

# Delete API docs
clean-docs:
	@rm -rf $(DOCDIR)

# Delete coverage results
clean-coverage:
	@rm -rf $(COVDIR)

# Clean gh-pages dir
clean-gh-pages:
	@rm -rf $(GHPDIR)

# Delete all generated files
clean: clean-docs clean-coverage clean-gh-pages

.PHONY: \
	install \
	lint \
	test \
	coveralls \
	gh-pages \
	clean-docs \
	clean-coverage \
	clean-gh-pages \
	clean
