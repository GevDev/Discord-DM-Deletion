const fetch = require('node-fetch')

const dm_channel_id = "REQUIRED"
const dm_author_self_id = "REQUIRED"

const get_messages_endpoint = `https://discord.com/api/v9/channels/${dm_channel_id}/messages/search?author_id=${dm_author_self_id}`;
const delete_message_endpoint = `https://discord.com/api/v9/channels/${dm_channel_id}/messages/`;

const authorization_header = "REQUIRED";
const cookie_header = "REQUIRED"; // Not actually sure if cookie header is required or if auth header is enough, but too lazy to test it out

let results_count = 9999; // This will be updated once the code actually runs
let skip_counter = 0; // Used to offset the number of system messages that cannot be deleted, such as messages for a call that a user initiated

const miliseconds_between_deletions = 4000 // Wait 4 seconds before sending a delete request. Somewhere between 2 and 4 seconds is the sweet spot not to get rate limited from testing
let do_i_sleep = false; // True if the API returns a message saying we are sending too many requests
let how_long_to_sleep = 10000 // Wait 10 seconds if we are being rate limited before trying again


/**
 * Request 25 of the newest messages from discord
 */
async function getMessagesPerPage() {
    let final_messages_endpoint = get_messages_endpoint + ("&offset=" + skip_counter) // If we have skipped any undeletable messages, offset by that number so we don't end up with them again

    const data_request = await fetch(final_messages_endpoint, {
        headers: {
            authorization: authorization_header,
            cookie: cookie_header
        },
        method: "GET",
    });

    return await data_request.json()
}

/**
 * Get the messages and delete them
 * @param {JSON} data_promise A JSON Object with 25 messages from discord
 */
async function getResults(data_promise) {
    let results = await data_promise
    results_count = results["total_results"]
    console.log(results["messages"])
    console.log("Results left to process: " + results_count)
    for ( var n = 0; n < results["messages"].length; n++) {
        if (do_i_sleep) {
            console.log(`I need to sleep for ${how_long_to_sleep/1000} seconds`)
            await sleep(how_long_to_sleep);
            console.log("Woke up from deep sleep")
            do_i_sleep = false
        }
        console.log("message_id is: " + results["messages"][n][0]["id"]);
        if(results["messages"][n][0]["type"] == 3) {
            skip_counter += 1;
            console.log("skipping type 3");
            continue;
        }
        await deleteMessage(results["messages"][n][0]["id"]);
        console.log("Sleeping")
        await sleep(miliseconds_between_deletions);
        console.log("Slept")
    }
    console.log("done, next page plz")

    // Stop when there is 50 or less total messages, otherwise, recursively call myself
    // TODO: Change this later, I just don't know how the code will interact with the API when there is only 1 page left
    if (results_count > 50) {
        getResults(getMessagesPerPage());
    }
}

/**
 * Delete a message with the given message ID
 * @param {*} message_id 
 */
async function deleteMessage(message_id) {
    let final_delete_endpoint = delete_message_endpoint + message_id
    console.log(final_delete_endpoint)
    await fetch(final_delete_endpoint, {
        headers: {
            authorization: authorization_header,
            cookie: cookie_header,
        },
        method: "DELETE",
    })
    .then(res => res.text())
    .then((text) => {
        console.log(text)
        // Having to deal with text that looks like JSON, but I can't do JSON.parse for some reason...
        if (text.includes("You are being rate limited")) {
            do_i_sleep = true
            let wait_time = (text.substring(text.indexOf('retry_after'), text.indexOf('}'))) // Don't ask...
            how_long_to_sleep = (Math.ceil(wait_time) + 20) * 1000
        }
    })
    // How does this work? Without it, node was complaining about unhandled promises. I didn't promise you anything my man
    .catch((error) => {
        console.log("ERROR!")
        console.log(error)
        console.log("msssg:" + error["message"]);

    })
}

/**
 * ZZzzzZz
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// JUST DO IT!
getResults(getMessagesPerPage())
