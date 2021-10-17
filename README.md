Use this to automagically delete the messages you sent in a DM, or just block the person, that works too. Slow but steady.

Horrible README instructions, but they will have to make do for now. (Famous last words)

This will also probably work for regular non-DM channels, but I haven't tested it.

## Setup and Usage

You need NodeJS installed. 

* Clone repo and run `$ npm install node-fetch`


* Open up `discord_dm_mass_delete.js` file in the text editor of your choice.
  1. Replace the word `REQUIRED` in the channel ID variable `dm_channel_id` to the channel ID of the DM between you and the unspoken one.
  2. Replace the word `REQUIRED` in the author id variable `dm_author_self_id` to your own ID from discord.
  3. Go to discord in your browser, login, go to the DM you want and press F12.
     * Click on the network tab
     * Run a search in the DM and put in `from: $your_username`
     * From the network tab, find the request for that search, look at the request parameters sent over, and copy the Authorization header as well as the cookie header values
     * Replace the variables `authorization_header` and `cookie_header` with the values you just copied
     * If you haven't figured out how to get the `dm_channel_id` and `dm_author_self_id` yet, look at the request URI for the search, and that should give you both of those as well.
  4. Save the file

* Run the file `$ node discord_dm_mass_delete.js`

* It will delete 1 message every 4 seconds, you do the math for how long it will take for your use case.