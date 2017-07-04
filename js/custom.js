TAGS = [];
var FEED = null;
var TAGS = null;

function get_feed() {
  //Retrieves the feed from the star
  var feed_url = 'https://s3-eu-west-1.amazonaws.com/cfa-healthtools-ke/starhealth-news.json';
  $.ajax({
    method: 'GET',
    url: feed_url,
    success: function(data) {
      var data = JSON.parse(data);
      FEED = prepare_data(data);
      TAGS = data.tags;
      show_data(FEED);

      // TODO: Fix tags(?)
      // show_tags();
    }
  });
}

function prepare_data(data) {
  formatted_nodes = [];
  //Prepare all the nodes in a format we prefer
  for (var i = 0; i < data.nodes.length; i++) {
    node = data.nodes[i].node;
    node = format_node(node);
    formatted_nodes.push(node);
  }
  return formatted_nodes;
}

function show_data(data) {
  //The featured news are the formatted nodes that have thumbnails i.e at least one image attached
  news = [];
  first_item = true;
  for (var n in formatted_nodes) {
    node = formatted_nodes[n];
    tags = node.tags;
    if (node.thumb !== null) {
      if (first_item) {
        node.related_articles = get_story_so_far(formatted_nodes, node.theme, node.id);
      }
      news.push(node);
      first_item = false;
    }
  }

  //Featured section
  $('.story_title').html('<a href="' + news[0].link + '">' + news[0].title + '</a>');
  $('.backstory_desc').html(news[0].description);
  $('.featured_thumb_section').html('<img src="' + news[0].thumb + '" alt="" class="featured_thumb">');
  //related articles
  markup = '';
  count = 3;
  for (var k in news[0].related_articles) {
    if (count === 0) break;
    article = news[0].related_articles[k];
    markup += '<li><i class="fa fa-chevron-circle-right"></i> <a href="' + article.link + '">' + article.title + '</a></li>';
    count -= 1;
  }
  $('#sofar').html(markup);

  //Accordions
  markup = '';
  i = 1;
  while (i < 7) {
    n = news[i];
    markup += accordion_template(n.id, n.title, n.thumb, n.description, n.link, i);
    i++;
  }
  $('.accordions').html(markup);

  display_more_news_section(news, 5);
}

function show_tags() {
  //Display tags
  TAGS = sortProperties(TAGS); // Arrange by descending order
  markup = '<tr><td><span class="filter-feed" data-tag="All">All</span></td></tr>';
  for (var i = 0; i < 10; i++) {
    t = TAGS[i];
    markup += '<tr><td><span class="filter-feed" data-tag="' + t[0] + '">' + t[0] + ' (' + t[1] + ')</span></td></tr>';
  }
  $('.filters').html(markup);
  init_filters(FEED);
}

function init_filters(FEED) {
  /* Load the feed with stories that match the tag - repeated some code */
  $('.filter-feed').click(function() {
    tag = $(this).attr('data-tag');

    news = [];
    first_item = true;
    for (var n in FEED) {
      node = FEED[n];
      tags = node.tags;
      if (tag === '') news.push(node);
      if (tags.indexOf(tag) > -1) news.push(node);
    }
    display_more_news_section(news, 1);
  });
}

function display_more_news_section(news, start) {
  //More news section
  markup = '';
  per_page = 6;
  pages = parseInt(news.length / per_page);
  pstr = '';
  if (pages > 1) {
    pstr = '<li><a>«</a></li>';
    for (var i = 0; i < pages; i++) {
      if (i === 0) {
        pstr += '<li class="active"><a>' + (i + 1) + '</a></li>';
      } else {
        pstr += '<li><a>' + (i + 1) + '</a></li>';
      }
    }
    pstr += '<li><a>»</a></li>';
  }
  $('.pagination').html(pstr);
  for (var j = start; j < news.length; j++) {
    node = news[j];
    page = parseInt((j - 5) / per_page + 1);
    markup += more_news_template(node, page);
  }
  $('.more_news').html(markup);
  for (k = 2; k <= pages; k++) {
    $('.page_' + k).css('display', 'none');
  }
  $('.pagination').css('display', 'block');
  $('.pagination li a').click(function() {
    page = $(this).html();
    if (page == '»')
      page = pages;
    else if (page == '«')
      page = 1;
    else {
      page = parseInt(page);
    }
    $('.pagination li').removeClass('active');
    $(this).parent().addClass('active');
    for (var i = 1; i <= pages; i++) {
      if (i == page) {
        $('.page_' + page).css('display', 'block');
      } else {
        $('.page_' + i).css('display', 'none');
      }
    }
  });
}

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, ''); // Replace spaces with - // Remove all non-word chars // Replace multiple - with single - // Trim - from start of text // Trim - from end of text
}

function format_node(node) {
  //rename keys and add missing ones
  new_node = {};

  new_node.id = node.nid;

  new_node.relevance = 0;

  new_node.similar_tags = 0;

  //    new_node['link'] = "http://the-star.co.ke/node/" + node.nid;
  //    new_node['link'] = window.location.href + "story?id=" + node.nid;
  new_node.link = window.location.href + 'story?' + slugify(node.title);

  new_node.title = node.title;

  new_node.tags = node.sorted_tags;

  new_node.description = first_paragraph(node.body);

  new_node.body = node.body;

  new_node.timestamp = node.date;

  new_node.author = node.byline;

  new_node.theme = node.theme;

  if (node.image !== null) {
    field_image = node.image;

    field_image = field_image.split('|ALT|');

    new_node.thumb = field_image[0];
  } else {
    new_node.thumb = null;
  }
  return new_node;
}

function first_paragraph(text) {
  var str = '';
  if (text != null) {
    arr = text.split('.');
    if (arr.length > 1) {
      str = arr[0] + '. ' + arr[1] + '.';
    } else {
      str = arr[0] + '.';
    }
  }
  return str;
}

function get_story_so_far(nodes, theme, id) {
  articles = {};
  total_tags = Object.keys(theme).length;
  for (var t in theme) {
    //Loop through each theme in the top story
    for (var n in nodes) {
      //Does this story have this theme?
      n = nodes[n];
      if (t in n.theme) {
        //Check if we have already added this article
        if (!(n.id in articles)) {
          //If the news story does not exist in articles add it and set closeness
          articles[n.id] = n;
          articles[n.id].similar_tags = 0;
          articles[n.id].relevance = 0;
        }
        articles[n.id].relevance = parseFloat(articles[n.id].relevance) + parseFloat(n.theme[t]);
      }
    }
  }
  //sort articles by closeness or relevance
  arr = [];
  for (var k in articles) {
    r = articles[k].relevance;
    arr.push(r);
  }
  v = arr.sort().reverse();
  v = v.slice(0, 3);
  relevant_articles = [];
  for (k in articles) {
    if (v.indexOf(articles[k].relevance)) {
      relevant_articles[k] = articles[k];
    }
  }
  return relevant_articles;
}

function accordion_template(id, title, thumb, description, link, i) {
  markup = '<div class="accordion" id="accordion2">';
  markup += '<div class="accordion-group">';
  markup += '<div class="accordion-heading"><i class="fa fa-chevron-circle-down"></i>';
  markup += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#' + id + '">' + title + '</a>';
  markup += '</div>';
  if (i == 1) {
    markup += '<div id="' + id + '" class="accordion-body in collapse" style="height: auto;">';
  } else {
    markup += '<div id="' + id + '" class="accordion-body collapse" style="height: 0px;">';
  }
  markup += '<div class="accordion-inner">';
  markup += '<p><img src="' + thumb + '" width="100%"><br/> ' + description + ' <br/><a href="' + link + '">More</a></p>';
  markup += '</div></div></div></div>';
  return markup;
}

function more_news_template(node, page) {
  markup = "<div class='more-news-item page_" + page + "'><h4><a href='" + node.link + "'>" + node.title + '</a></h4>';
  if (node.thumb !== null) {
    markup += "<img src='" + node.thumb + "' style='width:100px;float:left; margin:10px'/><br/>";
  }
  markup += '<div>' + strip_html(node.description) + '</div><br />';
  markup += '<div class="article-meta">Posted ' + node.timestamp + ' | ' + node.author;
  markup += '</div><hr/></div>';
  return markup;
}

function sortProperties(obj) {
  // convert object into array
  var sortable = [];
  for (var key in obj)
    if (obj.hasOwnProperty(key)) sortable.push([key, obj[key]]); // each item is an array in format [key, value]

  // sort items by value
  sortable.sort(function(a, b) {
    return b[1] - a[1]; // compare numbers
  });
  return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function strip_html(html) {
  var tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}


function filter_feed(section) {
  document.getElementById('filtered').innerHTML = '';
  var file = '/filter_feed';
  var request = get_XmlHttp();
  document.getElementById('filtered').innerHTML = '';
  var the_data = 'section=' + section;
  request.open('POST', file, true);
  request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  request.send(the_data);
  document.getElementById('filtered').innerHTML = "<div style='text-align:center'><img src='img/preloader.gif'></div>";
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      document.getElementById('filtered').innerHTML = request.responseText;
    }
  };
}

$(document).ready(function() {
  get_feed(); // fetches all stories and displays them
});



