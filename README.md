# X-Plane Flight Planner

This is a web-based flight planning tool for the flight simulator X-Plane.
It provides an easy to use interface where you can point and click your routes on a map.

<figure>
<a href="https://github.com/der-On/X-Plane-Flight-Planner/raw/v2.0/docs/screenshot.png"><img src="https://github.com/der-On/X-Plane-Flight-Planner/raw/v2.0/docs/screenshot.png" width="600" /></a>
<figcaption>Screenshot from 26. October 2016</figcaption>
</figure>

## Development

You will need to install [node.js](http://nodejs.org/).
After that open your console and within the root directory of the flight planner type:

    $ npm install

This will install all the dependencies using the node.js package manager.

After that you have to import your nav data from your X-Plane Installation:

    $ XPLANE_DIR=path_to_your_xplane_dir npm run import

Now start the local server using:

    $ npm start

If you want to rebuild the assets do:

    $ npm run build

If you want to rebuild automaticly when you change a source file run:

    $ npm run watch

## Donations

If you like this tool and want to say thank you to the developer you can [donate easily with paypal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DNL9MGKS39BAJ).

Thank you very much!
