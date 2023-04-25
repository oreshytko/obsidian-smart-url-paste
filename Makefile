
VAULT = ~/Documents/Obsidian/Zettelkasten

.PHONY: dev build install

dev:
	npm run dev

build:
	npm run build

install:
	rm -rf ${VAULT}/.obsidian/plugins/smart-urls-paste && \
	mkdir -p ${VAULT}/.obsidian/plugins/smart-urls-paste && \
	cp -r ./dist/* ${VAULT}/.obsidian/plugins/smart-urls-paste
