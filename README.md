Moda Small Group Application
==========================
Stack

* [Compass] (http://compass-style.org/) as [Compass-Mixins] (https://github.com/Igosuki/compass-mixins) compass library
* [Sass] (http://sass-lang.com/) precompiled css
* [Modular Scale] (http://modularscale.com/) modular scale for typography
* [Angular] (http://angularjs.org) thick-client framework
* [Node and NPM] (http://nodejs.org) server-side JS environment and package manager
* [Webpack] (https://webpack.github.io/) Front-end asset pipeline, module bundler

Project uses Webpack and NPM scripts in the package.json for the development and build toolchain, Sass for preprocessed CSS features and modularity, and Angular for the MV* thick client

initial setup
------------
* system requirements 
** node/npm - Installer for your OS from the site, also installs npm - Requires node v4 or higher
** git - Installer for your OS from [Git] (http://git-scm.com)
** webpack

* All installations should be done in a way that gets the necessary pieces on your path (Git, Ruby, Node/NPM), so that you can issue all commands from the shell of your choice

installation
------------
* cd into your sites directory, then, in bash (will create a new directory for the project):

```bash
        git clone |this project|
```

* cd into the build directory (submodule) and then:

```bash
        git checkout master
```

* you may want a local branch, in which case, in both the root and build directories:

```bash
        git checkout -b |your new branch|
```

* go to the root of your project

* finally, again at the root of your project

```bash
        npm install
```

working locally
---------------

* to run your project locally, use the following command with optional params for your machine name (just the machine name, and not the domain stuff) and ports for the dev SGA application (appport; default 9090), SpeedE (serport; default 9080), and the SGA web service (wsport; default 9080).

```bash
        npm start [ -- (--machine=your machine name) (--appport=desired port) (--serport=desired port) (--wsport=desired port)]
```

(If no machine name is specified, you will need to change the IP from "0.0.0.0" to "localhost", "127.0.0.1", your IPV4, or "[your machine name].pdx.odshp.com", and keep port 9090 or whatever you specified in "appport")

* All code changes should be made within the "app" folder, except for the template (index.html), which lives above the app folder

* on making code changes, the browser should refresh (and if it doesn't, save a root html or js file again, no changes necessary; plus you may need to wait a bit)

building and deploying
----------------------
* to rebuild the build directory, from the root directory:

```bash
        npm run build (production)
        npm run build-ser (for local copying of the client over to a SpeedERates WAR, optional machine name and ports also accepted and parsed)
```

troubleshooting
----------------

* npm install before anything else.
* be careful not to specify a port that's already being listened to for your appport (eg, 9080, if that's what websphere's already using)

helpful links
-----------------
*  [sass docs](http://sass-lang.com/documentation/file.SASS_REFERENCE.html)
