TAGS = []
$('#embed_1_modal').html(modal_template('doctor-nurse-search', 'Dodgy Doctors'))
$('#embed_2_modal').html(modal_template('nhif-facilities-search', 'Am I Covered'))
$('#embed_3_modal').html(modal_template('nearest-specialist', 'Nearest specialist'))

$('#search-type').change(function() {
    s = $(this).val()
    $('#doctorName').attr('placeholder', 'Start typing ' + s + '\'s name')
});

FEED = null;
TAGS = null;
function get_feed() {
    //Retrieves the feed from the star
    feed_url = 'https://c6maz9prs8.execute-api.eu-west-1.amazonaws.com/starhealthfeed'
    $.ajax({
        method: "GET",
        url: feed_url,
        success: (function( data ) {
            FEED = prepare_data(data);
            TAGS = data.tags;
            show_data(FEED);
            show_tags();
        })
    })
}

function prepare_data(data) {
    formatted_nodes = []
    //Prepare all the nodes in a format we prefer
    for (var i = 0; i < data.nodes.length; i++) {
        node = data.nodes[i].node
        node = format_node(node)
        formatted_nodes.push(node)
    }
    return formatted_nodes
}

function show_data(data) {
    //The featured news are the formatted nodes that have thumbnails i.e at least one image attached
    news = []
    first_item = true
    for (n in formatted_nodes) {
        node = formatted_nodes[n]
        tags = node['tags']
        if (node['thumb'] != null) {
            if ( first_item ) {
                node['related_articles'] = get_story_so_far(formatted_nodes, node['theme'], node['id'])
            }
            news.push(node);
            first_item = false;
        }
    }

    //Featured section
    $('.story_title').html('<a href="' + news[0]['link'] + '">' + news[0]['title'] + '</a>')
    $('.backstory_desc').html(news[0]['description'])
    $('.featured_thumb_section').html('<img src="' + news[0]['thumb'] + '" alt="" class="featured_thumb">')
    //related articles
    markup = ''
    count = 3
    for (k in news[0]['related_articles']) {
        if (count == 0) break;
        article = news[0]['related_articles'][k];
        markup += '<li><i class="fa fa-chevron-circle-right"></i> <a href="'+ article['link'] +'">'+ article['title']+ '</a></li>';
        count -= 1
    }
    $('#sofar').html(markup)

    //Accordions
    markup = ''
    i = 1
    while (i < 7) {
        n = news[i]
        markup += accordion_template(n.id, n.title, n.thumb , n.description, n.link, i)
        i++
    }
    $('.accordions').html(markup)

    display_more_news_section(news, 5);
}

function show_tags() {
    //Display tags
    TAGS = sortProperties(TAGS); // Arrange by descending order
    markup = '<tr><td><span class="filter-feed" data-tag="All">All</span></td></tr>';
    for (var i = 0; i < 10; i++) {
        t = TAGS[i]
        markup += '<tr><td><span class="filter-feed" data-tag="'+ t[0] +'">'+ t[0] +' ('+ t[1] +')</span></td></tr>';
    }
    $('.filters').html(markup);
    init_filters(FEED)
}
function init_filters(FEED) {
    /* Load the feed with stories that match the tag - repeated some code */
    $('.filter-feed').click(function() {
        tag = $(this).attr('data-tag');

        news = []
        first_item = true
        for (n in FEED) {
            node = FEED[n]
            tags = node['tags']
            if (tag == '') news.push(node)
            if (tags.indexOf(tag) > -1)news.push(node)
        }
        display_more_news_section(news, 1)

    });
}

function display_more_news_section(news, start) {
    //More news section
        markup = '';
        per_page = 6
        pages = parseInt(news.length / per_page)
        pstr = ''
        if (pages > 1) {
            pstr = '<li><a>«</a></li>'
            for (var i = 0; i < pages; i++) {
                if (i == 0) {
                    pstr += '<li class="active"><a>'+ (i + 1) +'</a></li>'
                } else {
                    pstr += '<li><a>'+ (i + 1) +'</a></li>'
                }
            }
            pstr += '<li><a>»</a></li>';
        }
        $('.pagination').html(pstr)
        for (var i = start; i < news.length; i++) {
            node = news[i]
            page = parseInt(((i - 5) / per_page) + 1)
            markup += more_news_template(node, page)
        }
        $('.more_news').html(markup);
        for (var i = 2; i <= pages; i++) {
            $('.page_' + i).css('display','none')
        }
        $('.pagination').css('display', 'block')
        $('.pagination li a').click(function() {
        page = $(this).html()
        if (page == '»') page = pages
        else if (page == '«') page = 1
        else {
            page = parseInt(page)
        }
        $('.pagination li').removeClass('active')
        $(this).parent().addClass('active')
        for (var i = 1; i <= pages; i++) {
            if (i == page) {
                $('.page_' + page).css('display','block')
            } else {
                $('.page_' + i).css('display','none')
            }
        }
    });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function format_node(node) {
    //rename keys and add missing ones
    new_node = {}

    new_node['id'] = node.nid;

    new_node['relevance'] = 0;

    new_node['similar_tags'] = 0;

//    new_node['link'] = "http://the-star.co.ke/node/" + node.nid;
//    new_node['link'] = window.location.href + "story?id=" + node.nid;
    new_node['link'] = window.location.href + "story?" + slugify(node.title);

    new_node['title'] = node.title;

    new_node['tags'] = node.sorted_tags;

    new_node['description'] = first_paragraph(node.body);

    new_node['body'] = node.body;

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
        for (n in nodes) {
            //Does this story have this theme?
            n = nodes[n]
            if (t in n['theme']) {
                //Check if we have already added this article
                if (!(n['id'] in articles)) {
                    //If the news story does not exist in articles add it and set closeness
                    articles[n['id']] = n
                    articles[n['id']]['similar_tags'] = 0
                    articles[n['id']]['relevance'] = 0
                }
                articles[n['id']]['relevance'] = parseFloat(articles[n['id']]['relevance']) + parseFloat(n['theme'][t])
            }
        }
    }
    //sort articles by closeness or relevance
    arr = []
    for (k in articles) {
        r = articles[k]['relevance']
        arr.push(r)
    }
    v = arr.sort().reverse()
    v = v.slice(0, 3)
    relevant_articles = []
    for (k in articles) {
        if (v.indexOf(articles[k]['relevance']) ) {
            relevant_articles[k] = articles[k]
        }
    }
    return relevant_articles
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
    markup += '<p><img src="'+ thumb +'" width="100%"><br/> '+ description +' <br/><a href="' + link + '">More</a></p>';
    markup += '</div></div></div></div>';
    return markup
}

function more_news_template(node, page) {
    markup = "<div class='more-news-item page_"+ page +"'><h4><a href='" + node['link'] + "'>" + node['title'] + "</a></h4>";
    if (node['thumb'] != null) {
        markup += "<img src='" + node['thumb'] +"' style='width:100px;float:left; margin:10px'/><br/>";
    }
    markup += "<div>" + strip_html(node['description']) + "</div><br />";
    markup += '<div class="article-meta">Posted ' + node['timestamp'] + ' | ' + (node['author']);
    markup += "</div><hr/></div>";
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
    markup += '<iframe src="'+ window.location.protocol + '//' + window.location.host + '/' + i +'" frameborder="0" scrolling="no" height="400px" width="100%"></iframe>';
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

$(document).ready(function() {
    get_feed(); // fetches all stories and displays them

    $('#embed_1_modal').html(modal_template('doctor-nurse-search', 'Dodgy Doctors'))
    $('#embed_2_modal').html(modal_template('nhif-facilities-search', 'Am I Covered'))
    $('#embed_3_modal').html(modal_template('nearest-specialist', 'Nearest specialist'))

    $('#main_search').keypress(function (e) {
        if (e.which == 13) {
            $('#site_search_submit').click();
            return false;    //<---- Add this line
        }
    });
    $('#income').keypress(function (e) {
        if (e.which == 13) {
            $("#calculate").click();
            return false;
        }
    });
    $('#doctorName').keypress(function (e) {
        if (e.which == 13) {
            $("#grabDetails").click();
            return false;
        }
    });
    $('#areaName').keypress(function (e) {
        if (e.which == 13) {
            $("#facility-search").click();
            return false;
        }
    });

    $('#site_search_submit').click(function() {
        if ($('#main_search').val().length == 0) {
            alert('Please enter a search query!');
        } else {
            window.location = "http://the-star.co.ke/search/node/" + $('#main_search').val();
        }
    });

    $("#grabDetails").click(function(){
        var name = $("#doctorName").val();
        var search_type = $('#search-type').val();
        if (search_type  == 'doctor') {
            //url = "https://szfs458b3b.execute-api.eu-west-1.amazonaws.com/prod?q=" + name
            url = 'https://6ujyvhcwe6.execute-api.eu-west-1.amazonaws.com/prod?q=' + name
        }
        else if (search_type  == 'nurse') {
            url = "https://52ien7p95b.execute-api.eu-west-1.amazonaws.com/prod?q=" + name
        } else {
            //CO search url
            url = "https://vfblk3b8eh.execute-api.eu-west-1.amazonaws.com/prod?q=" + name
        }
        $("#dname").html("<h4>Results for " + search_type + " search: " + name + "</h4>");
        $("#mybox").html("");
        $("#loading").show();
        $.ajax({
            url:url,
             success:function(result) {
                $("#doctorName").val("");
                str = ''
                if (search_type == 'doctor') {
                    for (var i = 0; i < result.hits.hit.length; i++) {
                        str += 'Name: ' + result.hits.hit[i].fields.name + '<br>'
                        str += 'Role:Doctor<br>'
                        str += 'Reg no. :' + result.hits.hit[i].fields.registration_number + '<br>'
                        str += 'Qualification: ' + result.hits.hit[i].fields.qualification + '<br>'
                        str += 'Registration date:' + result.hits.hit[i].fields.registration_date + '<br>'
                        if ( i < result.hits.hit.length - 1) str += '<hr>'
                    }
                } else if (search_type == "nurse") {
                    for (var i = 0; i < result.hits.hit.length; i++) {
                        str += 'Name: ' + result.hits.hit[i].fields.name + '<br>'
                        str += 'Role: Nurse<br>'
                        str += 'License: ' + result.hits.hit[i].fields.license + '<br>'
                        str += 'Valid until :' + result.hits.hit[i].fields.valid_until + '<br>'
                        if ( i < result.hits.hit.length - 1)str += '<hr>'
                    }
                } else {
                    for (var i = 0; i < result.hits.hit.length; i++) {
                        str += 'Name: ' + result.hits.hit[i].fields.name + '<br>'
                        str += 'Role: Clinical Officer<br>'
                        str += 'Reg no: ' + result.hits.hit[i].fields.registration_number + '<br>'
                        str += 'Reg date: ' + result.hits.hit[i].fields.registration_date + '<br>'
                        str += 'Address: ' + result.hits.hit[i].fields.address + '<br>'
                        str += 'Qualification: ' + result.hits.hit[i].fields.qualification + '<br>'
                        if ( i < result.hits.hit.length - 1)str += '<hr>'
                    }
                }
                $("#mybox").html(str);
                $("#loading").hide();
            }
        });
    });

    $("#grabNHIFDetails").click(function() {
        var hospital_location = $("#county_select option:selected").text();
        var hospital_type = $("#county_select").val();
        $("#dname").html("<h4>"+hospital_location+"</h4>");
        $("#mybox").html("");
        $("#loading").show();
        url = 'https://t875kgqahj.execute-api.eu-west-1.amazonaws.com/prod?q=' + hospital_location
        $.ajax({url:url,success:function(result){
            str = ''
            for (var i = 0; i < result.hits.hit.length; i++) {
                    str += 'Name: ' + result.hits.hit[i].fields.name + '<br>'
                    str += 'Service point: ' + result.hits.hit[i].fields.service_point + '<br>'
                    str += 'County. :' + result.hits.hit[i].fields.county + '<br>'
                    str += '<hr>'
                }
            $("#mybox").html(str);
            $("#hospital_location").val("");
            $("#loading").hide();
        }});
    });

    $("#facility-search").click(function(){
        query = $('#areaName').val()
        $("#dname").html("<h4>Results for: " + query + "</h4>");
        $("#mybox").html("");
        $("#loading").show();
        if (query != '') {
            get_access_token_and_search_health_facilites(query)
        }
    });

    $(".filter_feed").click(function(){
        var tag = $(this).attr("data-tag");
        $("#filtered").html("");
        $.ajax({url:"filter_feed?tag=" + tag,success:function(result){
            $("#filtered").html(result);
            $("#loading").hide();
        }});
    });

    $("#whatsMyContribution").click(function(){
        $("#myContribution").html("");
    });

    $("#calculate").click(function() {

        var income = $("#income").val();
        if(income == ""){
            $("#myContribution").html("You did not enter your income!");
        } else {
            if (!jQuery.isNumeric(income)) {
                $("#myContribution").html("Only numbers allowed!");
            } else {
                //do the calculations
                var result;

                if(income<6000){
                    result = "150";
                }else if(income<8000){
                    result = "300";
                }else if(income<12000){
                    result = "400";
                }else if(income<15000){
                    result = "500";
                }else if(income<20000){
                    result = "600";
                }else if(income<25000){
                    result = "750";
                }else if(income<30000){
                    result = "850";
                }else if(income<35000){
                    result = "900";
                }else if(income<40000){
                    result = "950";
                }else if(income<45000){
                    result = "1000";
                }else if(income<50000){
                    result = "1100";
                }else if(income<60000){
                    result = "1200";
                }else if(income<70000){
                    result = "1300";
                }else if(income<80000){
                    result = "1400";
                }else if(income<90000){
                    result = "1500";
                }else if(income<100000){
                    result = "1600";
                }else{
                    result = "1700";
                }

                $("#myContribution").html(result + " KSH per month");
            }
        }
        $("#income").val("")
    });
});


function filter_feed(section) {
    document.getElementById("filtered").innerHTML = "";
    var file = "/filter_feed";
    var request =  get_XmlHttp();
    document.getElementById("filtered").innerHTML = "";
    var the_data = 'section='+section;
    request.open("POST", file, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send(the_data);
    document.getElementById("filtered").innerHTML = "<div style='text-align:center'><img src='img/preloader.gif'></div>";
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            document.getElementById("filtered").innerHTML = request.responseText;
        }
    }
}

function get_access_token_and_search_health_facilites(search_query) {
    url = 'http://api.kmhfl.health.go.ke/o/token/'
    $.ajax({
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: {
            username: 'public@mfltest.slade360.co.ke',
            password:'public',
            grant_type:'password',
            client_id:'xMddOofHI0jOKboVxdoKAXWKpkEQAP0TuloGpfj5',
            client_secret:'PHrUzCRFm9558DGa6Fh1hEvSCh3C9Lijfq8sbCMZhZqmANYV5ZP04mUXGJdsrZLXuZG4VCmvjShdKHwU6IRmPQld5LDzvJoguEP8AAXGJhrqfLnmtFXU3x2FO1nWLxUx'
        }
    }).success(function (data) {
         get_health_facilites(data.access_token, search_query)
    })
}

function get_health_facilites(token, query) {
    url = 'http://api.kmhfl.health.go.ke/api/facilities/material/?'
    url += 'fields=id,code,name,regulatory_status_name,facility_type_name,owner_name,county,constituency,ward_name,keph_level,operation_status_name&format=json&search='
    url += '{"query":{"query_string":{"default_field":"name","query":'+ query +'}}}'
    $.ajax({
        method: 'GET',
        url: url,
        headers: {'Authorization': 'Bearer ' + token},
    }).success(function (data) {
         display_health_facilities(data.results)
    })
}
function display_health_facilities(list) {
    html = ''
    for(var i = 0; i < list.length; i++) {
        html += '<div class="row">'
        html += '<div class="col-md-12">'
        html += "Name: " + list[i].name + '<br>'
        html += "KEPH level name: " + list[i].keph_level_name + '<br>'
        html += "Facility type: " + list[i].facility_type_name + '<br>'
        html += "Owner: " + list[i].owner_name+ '<br>'
        html += "County: " + list[i].county_name+ '<br>'
        html += "Constituency: " + list[i].constituency_name+ '<br>'
        html += "Ward: " + list[i].ward_name+ '<br>'
        html += '</div>'
        html += '</div>'
        html += '<hr>'
    }
    $("#mybox").html(html);
    $("#areaname").val("");
    $("#loading").hide();
}


