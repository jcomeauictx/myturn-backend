install:
	# first make sure `/usr/bin/env node` returns a valid path
	if [ -z "$$(which node)" ]; then \
	 sudo ln -sf $$(which nodejs) $$(dirname $$(which nodejs))/node; \
	fi
	@echo Installing myturn-backend from $(PWD)
	cd configuration && $(MAKE) DRYRUN= siteinstall install
logs: /var/log/node-myturn-backend.log /var/log/nginx/myturn-web-error.log
	tail -f $+
logs.clear: /var/log/node-myturn-backend.log /var/log/nginx/myturn-web-error.log
	for logfile in $+; do cat /dev/null | sudo tee $$logfile; done
