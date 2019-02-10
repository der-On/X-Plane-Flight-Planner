# X-Plane Flight Planner

This is a web-based flight planning tool for the flight simulator X-Plane.
It provides an easy to use interface where you can point and click your routes on a map.

Currently the flight-planner will not work 100% on Internet Explorer. Please consider using another browser.

<figure>
<a href="https://github.com/der-On/X-Plane-Flight-Planner/raw/master/docs/screenshot.jpg"><img src="https://github.com/der-On/X-Plane-Flight-Planner/raw/master/docs/screenshot.jpg" width="600" /></a>
<figcaption>Screenshot from 06. March 2012</figcaption>
</figure>

## How to install

You will need to install [node.js](http://nodejs.org/) and [mongoDB](http://www.mongodb.org/).
After that open your console and within the root directory of the flight planner type: 

    $ npm install -d

This will install all the dependencies using the node.js package manager.

After that you have to start mongoDB by typing the following in the command line:

    $ mongo

Then chose the database "x-plane_apt_nav":

    $ use x-plane_apt_nav

And finally add a user for the database:

    $ db.addUser("username","password")

Next you need to copy the file "local_config.sample.js" and rename the copy to "local_config.js".
Open up the "local_config.js" in a text editor and adjust the mongodb user, password and maybe host to your needs.

Now you'll need the lates apt nav data. You can either download it from http://gateway.x-plane.com/NOTAMs (You find the download to the left under `Download the data ...`.)
or directly from mcantsin's GitHub repository: https://github.com/mcantsin/x-plane-navdata
After downloading it unpack it's contents into the `apt_nav` folder of the flight planner.
Then start the server (See `How to start`).


## How to start

Before you try to start the server be sure to read `How to install`.

Open your console and within the root directory of the flight planner type:
```
  node app.js
```
This will open up a local server listening on port `3000`. 
Now open your browser and open up the URL: http://localhost:3000/flight-planner

If you haven't done so before you now need to import the apt nav data, you've downloaded before.
To do so open up: http://localhost:3000/flight-planner/import and then choose wich data to import from the list. You have to import one after another. When importing wait a couple of seconds or maybe minutes depending on the speed of your computer.
It now processes the corresponding apt_nav/*.dat file and imports every airport/navaid or fix found within into the mongoDB.
When done you'll see a list of all imported data.

To shutdown the server simply hit `CTRL`-`C` or on mac `Apple`-`C` within the console you've used to start the server.


## Donations

If you like this tool and want to say thank you to the developer you can [donate easily with paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DNL9MGKS39BAJ).

Thank you very much!
