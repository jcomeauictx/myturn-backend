install:
	# first make sure `/usr/bin/env node` returns a valid path
	if [ -z "$$(which node)" ]; then \
	 sudo ln -sf $$(which nodejs) $$(dirname $$(which nodejs))/node; \
	fi
	@echo Installing MyTurn from $(PWD)
	cd configuration && $(MAKE) DRYRUN= siteinstall install
