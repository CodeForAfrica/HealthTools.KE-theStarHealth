url = window.location.href
story_slug = url.substring(url.indexOf('#') + 1, (url.length))
get_feed()
function get_feed() {
    //Retrieves the feed from the star
    feed_url = 'https://c6maz9prs8.execute-api.eu-west-1.amazonaws.com/starhealthfeed'
    $.ajax({
        method: "GET",
        url: feed_url,
        success: (function( data ) {
            prepare_data(data)
        })
    })
}

function prepare_data(data) {
    for (var i = 0; i < data.nodes.length; i++) {
        node = data.nodes[i].node
        if (slugify(node.title) == story_slug) {
            display_story(node)
            break
        }
    }
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function display_story(node) {
    $('.title').html(node.title)
    $('.story-date').html(node.date)
    if (node.byline.split('@').length > 1) {
        author = node.byline.split('@')[0] + '<a href="https://twitter.com/'+ node.byline.split('@')[0] +'">@'+ node.byline.split('@')[1]+ '</a>'
    } else {
        author = node.byline
    }
    $('.author').html(author)
    img = node.image
    $('.feature-image').html('<img src="' + img.slice(0, img.indexOf('|ALT|')) + '"/>')
    $('.caption').html(img.slice(img.indexOf('|ALT|') + 5, img.length))
    $('.story-body').html(node.body)
}

/*Social buttons*/

$(document).ready(function ($) {

//  $('.rrssb-buttons').rrssb({
//    // required:
//    title: 'This is the email subject and/or tweet text',
//    url: 'http://rrssb.ml/',
//
//    // optional:
//    description: 'Longer description used with some providers',
//    emailBody: 'Usually email body is just the description + url, but you can customize it if you want'
//  });
});