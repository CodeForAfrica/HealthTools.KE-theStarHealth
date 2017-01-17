TAGS = []
$('#embed_1_modal').html(modal_template('doctor-nurse-search', 'Dodgy Doctors'))
$('#embed_2_modal').html(modal_template('nhif-facilities-search', 'Am I Covered'))
$('#embed_3_modal').html(modal_template('nearest-specialist', 'Nearest specialist'))

$('#search-type').change(function() {
    s = $(this).val()
    $('#doctorName').attr('placeholder', 'Start typing ' + s + '\'s name')
});

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
    //related articles
    markup = ''
    count = 3
    for (k in news[0]['related_articles']) {
        if (count == 0) break;
        article = news[0]['related_articles'][k];
        markup += '<li><i class="fa fa-chevron-circle-right"></i> <a href="'+ article['link'] +'" target="_blank">'+ article['title']+ '</a></li>';
        count -= 1
    }
    $('#sofar').html(markup)

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
    per_page = 6
    pages = parseInt(news.length / per_page)
    pstr = '<li><a>«</a></li>'
    for (var i = 0; i < pages; i++) {
        if (i == 0) {
            pstr += '<li class="active"><a>'+ (i + 1) +'</a></li>'
        } else {
            pstr += '<li><a>'+ (i + 1) +'</a></li>'
        }
    }
     pstr += '<li><a>»</a></li>'
    $('.pagination').html(pstr)
    for (var i = (per_page - 1); i < news.length; i++) {
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
    new_node['link'] = window.location.href + "story#" + slugify(node.title);

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
    markup += '<p><img src="'+ thumb +'" width="100%"><br/> '+ description +' <br/><a href="' + link + '" target="_blank">More</a></p>';
    markup += '</div></div></div></div>';
    return markup
}

function more_news_template(node, page) {
    markup = "<div class='more-news-item page_"+ page +"'><h4><a href='" + node['link'] + "' target='_blank'>" + node['title'] + "</a></h4>";
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
    markup += '<iframe src="'+ window.location.href +'/'+ i +'" frameborder="0" scrolling="no" height="400px" width="100%"></iframe>';
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
            url = "https://szfs458b3b.execute-api.eu-west-1.amazonaws.com/prod?q=" + name
        }
        else if (search_type  == 'nurse') {
            url = "https://52ien7p95b.execute-api.eu-west-1.amazonaws.com/prod?q=" + name
        } else {
            //TODO Clinical officers cloudsearch url
            url = "" + name
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
                } else {
                    for (var i = 0; i < result.hits.hit.length; i++) {
                        str += 'Name: ' + result.hits.hit[i].fields.name + '<br>'
                        str += 'Role:Nurse<br>'
                        str += 'License: ' + result.hits.hit[i].fields.license + '<br>'
                        str += 'Valid until :' + result.hits.hit[i].fields.valid_until + '<br>'
                        if ( i < result.hits.hit.length - 1)str += '<hr>'
                    }
                }
                $("#mybox").html(str);
                $("#loading").hide();
            }
        });
    });

    //Check if hospital is registered
    $("#clinicName").autocomplete("getClinics", {
        matchContains: true,
        selectFirst: false
    });


    $("#grabClinicDetails").click(function(){
        var name = $("#clinicName").val();
        $("#dname").html("<h4>Results for: " + name + "</h4>");
        $("#mybox").html("");
        $("#loading").show();
        $.ajax({url:"singleClinic?q=" + name,success:function(result){
            $("#clinicName").val("");
            $("#mybox").html(result);
            $("#loading").hide();
        }});
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

    $("#grabSpecialists").click(function(){
        var hospital_location_gps = $("#hospital_location_gps_sp").val();
        var hospital_location = $("#hospital_location_sp").val();
        var specialty = $("#specialist").val();
        if(specialty == "0"){
            $("#dname").html("<h4>"+hospital_location + "</h4>");
        }else{
            if(hospital_location != "")
                $("#dname").html("<h4>"+specialty+" in " + hospital_location + "</h4>");
        }
        $("#mybox").html("");
        $("#loading").show();
        $.ajax({url:"specialty?specialty=" + specialty + "&gps=" + hospital_location_gps + "&address=" + hospital_location,success:function(result){
            $("#mybox").html(result);
            $("#hospital_location_gps_sp").val("");
            $("#hospital_location_sp").val("");
            $("#loading").hide();
        }});
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
    jQuery(".near_me").click(initiate_geolocation);
});


function initiate_geolocation() {
    $("#hospital_location").css("background", "white url('ajax-autocomplete/indicator.gif') right center no-repeat");
    $("#hospital_location_sp").css("background", "white url('ajax-autocomplete/indicator.gif') right center no-repeat");
    navigator.geolocation.getCurrentPosition(handle_geolocation_query);
}

function handle_geolocation_query(position){
    //Get cordinates on complete
    var autoCords = position.coords.latitude + ',' + position.coords.longitude;
    $("#hospital_location_gps").val(autoCords);
    $("#hospital_location_gps_sp").val(autoCords);
    //make ajax request to reverse geocode coordinates
    $.ajax({url:"reverse_geocode?q=" + autoCords,success:function(result){
        $("#hospital_location").val(result);
        $("#hospital_location_sp").val(result);
        //$("#loading_hospitals").hide();
        $("#hospital_location").css("background", "none");
        $("#hospital_location_sp").css("background", "none");
    }});
}

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