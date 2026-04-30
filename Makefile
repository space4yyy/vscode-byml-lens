.PHONY: all compile bundle watch lint test test-unit package clean install install-cli

all: bundle

install:
	npm install

compile:
	npm run compile

bundle:
	npm run bundle

# Run full VS Code integration tests
test:
	npm run test

# Run fast core logic unit tests
test-unit:
	npm run test:unit

# Install CLI tool globally
install-cli: bundle
	npm install -g .

watch:
	npm run watch

lint:
	npm run lint

package: bundle
	npx @vscode/vsce package

clean:
	rm -rf out dist *.vsix temp
