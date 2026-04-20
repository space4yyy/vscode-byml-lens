.PHONY: all compile watch lint test package clean install

all: compile

install:
	npm install

compile:
	npm run compile

watch:
	npm run watch

lint:
	npm run lint

test:
	npm run test

package:
	npx vsce package

clean:
	rm -rf out dist *.vsix
