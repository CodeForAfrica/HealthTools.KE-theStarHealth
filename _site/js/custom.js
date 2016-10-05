
TAGS = []
$('#embed_1_modal').html(modal_template(1, 'Dodgy Doctors'))
$('#embed_2_modal').html(modal_template(2, 'Am I Covered'))
$('#embed_3_modal').html(modal_template(3, 'Nearest specialist'))

function get_feed() {
    //Retrieves the feed from the star
    feed_url = 'https://c6maz9prs8.execute-api.eu-west-1.amazonaws.com/starhealthfeed'
    $.ajax({
        method: "GET",
        url: feed_url,
        success: (function( data ) {
            TAGS = data.tags
            formatted_nodes = []
            //Prepare all the nodes in a format we prefer
            for (var i = 0; i < data.nodes.length; i++) {
                node = data.nodes[i].node
                node = format_node(node)
                formatted_nodes.push(node)
            }
            //The featured news are the formatted nodes that have thumbnails i.e at least one image attached
            news = []
            first_item = true
            for (n in formatted_nodes) {
                node = formatted_nodes[n]
                if (node['thumb'] != null) {
                    if ( first_item ) {
                        node['related_articles'] = get_story_so_far(formatted_nodes, node['theme'], node['id'])
                    }
                    news.push(node);
                    first_item = false;
                }
            }

            //Featured section
            $('.story_title').html('<a href="' + news[0]['link'] + '" target="_blank">' + news[0]['title'] + '</a>')
            $('.backstory_desc').html(news[0]['description'])
            $('.featured_thumb_section').html('<img src="' + news[0]['thumb'] + '" alt="" class="featured_thumb">')

            //Accordions
            markup = ''
            for (var i = 1; i < 7; i++) {
                n = news[i]
                markup += accordion_template(n.id, n.title, n.thumb , n.description, n.link, i)
            }
            $('.accordions').html(markup)

            //Display tags
            TAGS = sortProperties(TAGS); // Arrange by descending order
            markup = '<tr><td><a  class="filter_feed" data-tag="All">All</a></td></tr>';
            for (var i = 0; i < 10; i++) {
                t = TAGS[i]
                markup += '<tr><td><a class="filter_feed" data-tag="'+ t[0] +'">'+ t[0] +' ('+ t[1] +')</td></tr>';
            }
            $('.filters').html(markup);

            //More news section
            markup = '';
            for (var i = 7; i < 15; i++) {
                node = news[i]
                markup += more_news_template(node)
            }
            $('.more_news').html(markup);
        })
    })
}

function format_node(node) {
    //rename keys and add missing ones
    new_node = {}

    new_node['id'] = node.nid;

    new_node['relevance'] = 0;

    new_node['similar_tags'] = 0;

    new_node['link'] = "http://the-star.co.ke/node/" + node.nid;

    new_node['title'] = node.title;

    new_node['tags'] = node.sorted_tags;

    new_node['description'] = first_paragraph(node.body);

    new_node['timestamp'] = node.date;

    new_node['author'] = node.byline;

    new_node['theme'] = node.theme;

    if (node.image!= null) {

        field_image = node.image;

        field_image = field_image.split('|ALT|');

        new_node['thumb'] = field_image[0];

    } else {

        new_node['thumb'] = null;

    }
    return new_node;
}

function first_paragraph(text) {
    arr = text.split('.');
    if (arr.length > 1) {
        str = arr[0] + '. ' + arr[1] + '.';
    } else {
        str = arr[0] + '.';
    }
    return str;
}

function get_story_so_far(nodes, theme, id) {
    articles = {}
    total_tags = Object.keys(theme).length;

    for (t in theme) {
        //Loop through each theme in the top story
        for (n in news) {
            //Does this story have this theme?
            if (t in n['theme']) {
                //Check if we have already added this article
                if (! n['id'] in articles) {
                    //If the news story does not exist in articles add it and set closeness
                    article[n['id']] = n
                    article[n['id']]['similar_tags'] = 0
                    article[n['id']]['relevance'] = 0
                }
                //
                article[n['id']]['relevance'] = article[n['id']]['relevance'] + n['theme'][t]
            }
        }
    }
    //TODO: Sort articles by closeness
    return articles
}


function accordion_template(id, title, thumb , description, link, i) {
    markup = '<div class="accordion" id="accordion2">';
    markup += '<div class="accordion-group">';
    markup += '<div class="accordion-heading"><i class="fa fa-chevron-circle-down"></i>';
    markup += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#'+ id +'">'+  title + '</a>';
    markup += '</div>';
    if (i == 1)
        markup += '<div id="'+ id +'" class="accordion-body in collapse" style="height: auto;">';
    else
        markup += '<div id="'+ id +'" class="accordion-body collapse" style="height: 0px;">';
    markup += '<div class="accordion-inner">';
    markup += '<p><img src="'+ thumb +'" width="100%"><br/> '+ description +' <br/><a href="' + link + '" target="_blank">More</a></p>';
    markup += '</div></div></div></div>';
    return markup
}

function more_news_template(node, id) {
    markup = "<div><h4><a href='" + node['link'] + "' target='_blank'>" + node['title'] + "</a></h4>";
    if (node['thumb'] != null) {
        markup += "<img src='" + node['thumb'] +"' style='width:100px;float:left; margin:10px'/><br/>";
    }
    markup += "<div>" + strip_html(node['description']) + "</div><br />";
    markup += '<div class="article-meta">Posted ' + node['timestamp'] + ' | ' + (node['author']);
    markup += "</div><hr/><div>";
    return markup
}

function modal_template(i, app) {
    markup = '<div class="modal-dialog" role="document">';
    markup += '<div class="modal-content">';
    markup += '<div class="modal-header">';
    markup += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
    markup += '<h3>Embed Code for '+ app +' </i></h3>';
    markup += '</div>';
    markup += '<div class="modal-body">';
    markup += 'Copy and paste the following code inside within HTML code';
    markup += '<textarea class="form-control">';
    markup += '<iframe src="http://health.the-star.co.ke/?embed='+ i +'" frameborder="0" scrolling="no" height="400px" width="100%"></iframe>';
    markup += '</textarea>';
    markup += '</div>';
    markup += '<div class="modal-footer">';
    markup += '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>';
    markup += '</div></div></div>';
    return markup
}

function sortProperties(obj) {
    // convert object into array
    var sortable = [];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b) {
        return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function strip_html(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

function to_title_case(text) {
    return text.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

get_feed()