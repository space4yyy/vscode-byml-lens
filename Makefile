.PHONY: all compile bundle watch lint test package clean install

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

clean:
	rm -rf out dist *.vsix
