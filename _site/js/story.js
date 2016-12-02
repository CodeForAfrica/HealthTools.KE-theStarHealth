url = window.location.href
story_id = url.substring(url.indexOf('=') + 1, (url.length))
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
        if (node.nid == parseInt(story_id)) {
            console.log(node)
            display_story(node)
            break
        }
    }
}

function display_story(node) {
    console.log(node.thumb)
    $('.title').html(node.title)
    $('.story-date').html(node.date)
    if (node.byline.split('@').length > 1) {
        author = node.byline.split('@')[0] + '<a href="https://twitter.com/'+ node.byline.split('@')[0] +'">@'+ node.byline.split('@')[1]+ '</a>'
    } else {
        author = node.byline
    }
    $('.author').html(author)
    $('.story-body').html(node.body)
    $('.author').html(node.author)
    img = node.image
    $('.feature-image').html('<img src="' + img.slice(0, img.indexOf('|ALT|')) + '"/>')
    $('.caption').html(img.slice(img.indexOf('|ALT|') + 5, img.length))
}

/*Social buttons*/

$(document).ready(function ($) {

  $('.rrssb-buttons').rrssb({
    // required:
    title: 'This is the email subject and/or tweet text',
    url: 'http://rrssb.ml/',

    // optional:
    description: 'Longer description used with some providers',
    emailBody: 'Usually email body is just the description + url, but you can customize it if you want'
  });
});