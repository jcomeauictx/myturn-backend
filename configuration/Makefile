SHELL := /bin/bash
SERVICE := myturn-web
BACKEND := node-myturn-backend
NGINX_CONFIG := /etc/nginx
SITE_ROOT := /var/www/myturn-web
SITE_CONFIG := $(NGINX_CONFIG)/sites-available/$(SERVICE)
SITE_ACTIVE := $(NGINX_CONFIG)/sites-enabled/$(SERVICE)
TIMESTAMP := $(shell date +%Y%m%d%H%M%S)
DRYRUN ?= --dry-run  # for rsync
DELETE ?= --delete
export
install: /etc/rc2.d/S01$(BACKEND) $(SITE_ACTIVE) startup_service restart_nginx
siteinstall:
	[ -d $(SITE_ROOT) ] || \
	 (echo 'Must first `make install` from myturn-web sources' >&2; \
	  echo 'Alternatively `npm install jcomeauictx/myturn-web`' >&2; false)
	(cd .. && sudo rsync -avuz $(DRYRUN) \
	 --exclude='.git*' \
	 --exclude='configuration' \
	 . /var/www/myturn-backend)
/etc/init.d/%: %
	if [ -e "$@" ]; then \
	 if diff -q $< $@; then \
	  echo $@ unchanged >&2; \
	 else \
	  echo Saving $@ to $@.$(TIMESTAMP) >&2; \
	  sudo mv $@ $@.$(TIMESTAMP); \
	 fi; \
	fi
	[ -e "$@" ] || sudo cp $< $@
/etc/rc2.d/S01%: /etc/init.d/%
	sudo update-rc.d $* defaults
startup_service: /etc/init.d/$(BACKEND)
	sudo $< restart
$(SITE_ACTIVE): $(SITE_CONFIG)
	cd $(dir $@) && sudo ln -sf ../sites-available/$(notdir $<) .
$(SITE_CONFIG): myturn.nginx
	if [ -e "$@" ]; then \
	 if diff -q $< $@; then \
	  echo $@ unchanged >&2; \
	 else \
	  echo Saving $@ to $@.$(TIMESTAMP) >&2; \
	  sudo mv $@ $@.$(TIMESTAMP); \
	 fi; \
	fi
	[ -e "$@" ] || sudo cp $< $@
restart_nginx: /etc/init.d/nginx
	sudo $< restart
diff:
	diff -r -x '.git*' .. /var/www/myturn-backend/
