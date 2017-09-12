url = window.location.href;
story_slug = url.substring(url.indexOf('?') + 1, (url.length));
get_feed();
var NODE = null;
/**
 * @function get_feed
 * @description Retrieves the feed from the star API
 * @param {void} - void
 * @return {void} void
 */
function get_feed() {
    //Retrieves the feed from the star
    feed_url = 'https://s3-eu-west-1.amazonaws.com/cfa-healthtools-ke/starhealth-news.json'
    $.ajax({
        method: "GET",
        url: feed_url,
        success: (function( data ) {
            data = JSON.parse(data);
            prepare_data(data);
        })
    })
}

/**
 * @function prepare_data
 * @description This function loops through all stories until the story with a matching slug
 * is found
 * @param {object} data - JSON data from the GET request in get_feed() function
 * @return {void} - void
 */
function prepare_data(data) {
    for (var i = 0; i < data.nodes.length; i++) {
        node = data.nodes[i].node;
        if (slugify(node.title) == story_slug) {
            NODE = node;
            social_media_share_button_update(node.title)
            display_story(node);
            break
        }
    }
}

/**
 * @function slugify
 * @description This function slugifies string data using regular expression
 * @param {any} text - string data from the prepare_data function
 * @returns {string} - slugified string
 *
 */
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * @function display_story
 * @description This function displays the story content in the story section
 * @param {object} node - object data that contains the story content
 * @return {void} void
 */
function display_story(node) {
    //Show the story content in the story section
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

/**
 * @function get_classifieds
 * @description This function gets the classfieds feeds from star
 * @param {void} - void
 * @return {void} - void
 */
function get_classifieds() {
    feed_url = 'https://s3-eu-west-1.amazonaws.com/cfa-healthtools-ke/starhealth-classifieds.html';
    y = $.ajax({
        method: "get",
        url: feed_url,
        success: (function( response ) {
            $('.classifieds').html(response);
        })
    });
}

/**
 * @function get_news_feed
 * @description This function makes a GET request to obtain current news feed
 * from star
 * @param {void} - void
 * @return {void} - void
 */
function get_news_feed() {
    title_arr = []
    link_arr = []
    url = 'https://s3-eu-west-1.amazonaws.com/cfa-healthtools-ke/starhealth-latest.xml'
    $.ajax({
        method: "get",
        url: url,
        success: (function( response ) {
            d = $.parseXML(response)
            $xml = $(d)
            $xml.find("item>link").each(function(){ link_arr.push($(this).text())})
            $xml.find("item>title").each(function(){ title_arr.push($(this).text())})
            html = ''
            for (var i = 0; i < title_arr.length; i++) {
                html += '<li>'
                html += '<a href="'+ link_arr[i] +'">'+ title_arr[i] +'</a>'
                html += '</li>'
            }
            $('.latest-news-links').html(html)
        }),
        err: (function( err ) {
            console.log(err)
        })
    });
}

/**
 * @function social_media_share_button_update
 * @description This functions makes the share button share the correct story
 * @param {string} title - title of the story
 * @return {void} - void
 */
function social_media_share_button_update(title) {
    //Make the share buttons share the correct story
    $('.rrssb-facebook a').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.href)
    $('.rrssb-twitter a').attr('href', 'https://twitter.com/intent/tweet?text=' + title + '&amp;url=' + window.location.href + '&amp;via=TheStarKenya' )
    $('.rrssb-googleplus a').attr('href', 'https://plus.google.com/share?url=' + window.location.href)
    $('.rrssb-whatsapp a').attr('href','whatsapp://send?text=' + window.location.href)
    $('.rrssb-email a').attr('href', 'mailto:?subject=' + title + '&amp;body=' + window.location.href)

}

$(document).ready(function () {
    //Load the classifieds section
    get_classifieds();
    get_news_feed()
});
