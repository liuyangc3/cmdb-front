# install nvm 
install nvm
```
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.27.1/install.sh | bash
```
install nodejs
```
$ NVM_NODEJS_ORG_MIRROR=http://dist.u.qiniudn.com nvm install 0.10
$ nvm use 0.10
```
# Karma
install Karma
```
$ sudo npm --registry=https://registry.npm.taobao.org install --unsafe-perm karma -g --save-dev
$ npm --registry=https://registry.npm.taobao.org install karma -g --save-dev
```

Install plugins that your project needs:
```
$ npm --registry=https://registry.npm.taobao.org install karma-jasmine karma-chrome-launcher karma-cli -g --save-dev
```

find npm root dir
```
$ npm root -g
```

add karma config
```
$ /usr/lib/node_modules/karma/bin/karma init karma.conf.js
```

startup
```
$ /usr/lib/node_modules/karma/bin/karma start
```