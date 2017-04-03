BACKEND := node-myturn-backend
export
install: /etc/rc2.d/S01$(BACKEND) startup_service
/etc/init.d/%: %
	sudo cp $< $@
/etc/rc2.d/S01%: /etc/init.d/%
	sudo update-rc.d $* enable
startup_service: /etc/init.d/$(BACKEND)
	sudo $< start
