# X-Plane Flight Planner

This is a web-based flight planning tool for the flight simulator X-Plane.
It provides an easy to use interface where you can point and click your routes on a map.

Future versions will intergrate the economy system FSEconomy within the flight planner.

<figure>
<a href="https://github.com/der-On/X-Plane-Flight-Planner/raw/master/docs/screenshot.jpg"><img src="https://github.com/der-On/X-Plane-Flight-Planner/raw/master/docs/screenshot.jpg" width="600" /></a>
<figcaption>Screenshot from 01. March 2012</figcaption>
</figure>

## How to install

You will need to install [node.js](http://nodejs.org/) and [mongoDB](http://www.mongodb.org/).
After that open your console and within the root directory of the flight planner type: 

  npm install -d

This will install all the dependencies using the node.js package manager.

Now you'll need the lates apt nav data from http://data.x-plane.com/get_data.html 
You find the download to the left under "Download the data ...".
After downloading it unpack it's contents into the "apt_nav" folder of the flight planner.
Then start the server (See "How to start").


## How to start

Before you try to start the server be sure to read "How to install".

Open your console and within the root directory of the flight planner type:

  node app.js

This will open up a local server listening on port 3000. 
Now open your browser and open up the URL: http://localhost:3000

If you haven't done so before you now need to import the apt nav data, you've downloaded before.
To do so open up: http://localhost:3000/import and then choose wich data to import from the list. You have to import one after another. When importing wait a couple of seconds or maybe minutes depending on the speed of your computer.
It now processes the apt_nav/apt.dat file and imports every airport found within into the mongoDB. When done, it should display the number of imported airports.
You can check the process by looking into the console. It will print out each airport found there.

To shutdown the browser simply hit CTRL-C or on mac Apple-C within the console you've used to start the server.

