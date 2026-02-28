.PHONY: build lint clean generate release-patch release-minor release-major

# ─── Development ──────────────────────────────────────────────

build:
	npm run build

lint:
	npm run lint

clean:
	rm -rf dist

generate: build
	node dist/cli.js -o output/sri-yantra.svg
	node dist/cli.js --minimal -o output/minimal-mark.svg
	node dist/cli.js --shiva-color "#1A0F0A" --shakti-color "#C9501C" --bindu-color "#D4A843" -o output/dual-color.svg
	node dist/cli.js --minimal --shiva-color "#1A0F0A" --shakti-color "#C9501C" --bindu-color "#D4A843" -o output/minimal-dual.svg
	node dist/cli.js --no-bhupura --no-lotus -o output/triangles-only.svg
	node dist/cli.js --filled --fill-opacity 0.08 -o output/filled.svg
	node dist/cli.js --background "#FDF8F0" -o output/on-cream.svg
	node dist/cli.js --minimal --size 64 -o output/favicon.svg
	node dist/cli.js --color "#1A0F0A" -o output/dark.svg
	node dist/cli.js --animated draw -o output/animated-draw.svg
	node dist/cli.js --animated layer-reveal -o output/animated-layer-reveal.svg
	node dist/cli.js --animated breathe -o output/animated-breathe.svg
	node dist/cli.js --animated rotate -o output/animated-rotate.svg
	@echo "✓ Generated 13 SVGs in output/"

# ─── Release ──────────────────────────────────────────────────
# Usage:
#   make release-patch   # 0.2.0 → 0.2.1
#   make release-minor   # 0.2.0 → 0.3.0
#   make release-major   # 0.2.0 → 1.0.0

define release
	@echo "── Bumping version ($(1)) ──"
	npm version $(1) --no-git-tag-version
	@echo "── Building ──"
	$(MAKE) build
	@echo "── Linting ──"
	$(MAKE) lint
	@echo "── Generating SVGs ──"
	$(MAKE) generate
	@echo "── Committing & pushing ──"
	$(eval VERSION := $(shell node -p "require('./package.json').version"))
	git add -A
	git commit -m "release: v$(VERSION)"
	git push origin main
	@echo ""
	@echo "✓ Pushed release: v$(VERSION)"
	@echo "  GitHub Actions will now tag, create a release, and publish to npm."
endef

release-patch:
	$(call release,patch)

release-minor:
	$(call release,minor)

release-major:
	$(call release,major)
