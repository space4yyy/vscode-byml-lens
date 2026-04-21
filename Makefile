VERSION := $(shell node -p "require('./package.json').version")
EXT_ID := space4.vscode-byml-inspector-$(VERSION)
EXT_DIR := ~/.antigravity/extensions/$(EXT_ID)

.PHONY: all compile bundle watch lint test package clean install install-local install-dev

all: compile

install:
	npm install

compile:
	npm run compile

bundle:
	npm run bundle

watch:
	npm run watch

lint:
	npm run lint

test:
	npm run test

package:
	npx @vscode/vsce package

# One-click test for local Antigravity (Production Bundle Mode)
install-local: bundle
	@echo "Syncing production-ready bundle to Antigravity ($(VERSION))..."
	@mkdir -p $(EXT_DIR)/dist
	@cp package.json README.md README_ZH.md LICENSE $(EXT_DIR)/
	@cp dist/extension.js $(EXT_DIR)/dist/
	@echo "Done. Please restart Antigravity to test."

# Restore full source/node_modules for debugging (Development Mode)
install-dev: compile
	@echo "Syncing full development environment to Antigravity ($(VERSION))..."
	@mkdir -p $(EXT_DIR)/out
	@cp -r out/* $(EXT_DIR)/out/
	@cp -r src $(EXT_DIR)/
	@cp -r node_modules $(EXT_DIR)/
	@cp package.json README.md README_ZH.md LICENSE $(EXT_DIR)/
	@echo "Done. Development environment restored."

clean:
	rm -rf out dist *.vsix

