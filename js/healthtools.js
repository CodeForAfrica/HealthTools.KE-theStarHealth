// HealthTools


$(document).ready(function() {

  $('#search-type').change(function() {
    s = $(this).val();
    $('#doctorName').attr('placeholder', 'Start typing ' + s + "'s name");
  });

  $('#embed_1_modal').html(modal_template('dodgy-dr', 'Dodgy Doctors'));
  $('#embed_2_modal').html(modal_template('nhif', 'Am I Covered?'));
  $('#embed_3_modal').html(modal_template('nearest-specialist', 'Nearest specialist'));

  $('#main_search').keypress(function(e) {
    if (e.which == 13) {
      $('#site_search_submit').click();
      return false; //<---- Add this line
    }
  });
  $('#income').keypress(function(e) {
    if (e.which == 13) {
      $('#calculate').click();
      return false;
    }
  });
  $('#doctorName').keypress(function(e) {
    if (e.which == 13) {
      $('#grabDetails').click();
      return false;
    }
  });
  $('#areaName').keypress(function(e) {
    if (e.which == 13) {
      $('#facility-search').click();
      return false;
    }
  });

  $('#site_search_submit').click(function() {
    if ($('#main_search').val().length === 0) {
      alert('Please enter a search query!');
    } else {
      window.location = 'http://the-star.co.ke/search/node/' + $('#main_search').val();
    }
  });

  $('#grabDetails').click(function() {
    var name = $('#doctorName').val();
    var search_type = $('#search-type').val();
    var url = '';

    switch (search_type) {
      case 'doctor':
        url = 'https://kg1nox6m9k.execute-api.eu-west-1.amazonaws.com/prod?q=';
        break;
      case 'nurse':
        url = 'https://52ien7p95b.execute-api.eu-west-1.amazonaws.com/prod?q=';
        break;
      default:
        url = 'https://vfblk3b8eh.execute-api.eu-west-1.amazonaws.com/prod?q=';
    }
    name = cloudsearch_remove_keywords(name);
    url = url + encodeURIComponent(cloudsearch_add_fuzzy(name));

    $('#dname').html('<h4>Results for ' + toTitleCase(search_type) + ' search: ' + name + '</h4>');
    $('#mybox').html('');
    $('#loading').show();
    $.ajax({
      url: url,
      success: function(result) {
        $('#doctorName').val('');
        str = '';
        if (search_type == 'doctor') {
          for (var i = 0; i < result.hits.hit.length; i++) {
            str += 'Name: ' + result.hits.hit[i].fields.name + '<br>';
            str += 'Reg no.: ' + result.hits.hit[i].fields.reg_no + '<br>';
            str += 'Qualification: ' + result.hits.hit[i].fields.qualifications + '<br>';
            str += 'Registration date: ' + new Date(result.hits.hit[i].fields.reg_date).toDateString() + '<br>';
            if (i < result.hits.hit.length - 1) str += '<hr>';
          }
        } else if (search_type == 'nurse') {
          for (var j = 0; j < result.hits.hit.length; j++) {
            str += 'Name: ' + result.hits.hit[j].fields.name + '<br>';
            str += 'License: ' + result.hits.hit[j].fields.license + '<br>';
            str += 'Valid until: ' + result.hits.hit[j].fields.valid_until + '<br>';
            if (j < result.hits.hit.length - 1) str += '<hr>';
          }
        } else {
          for (var k = 0; k < result.hits.hit.length; k++) {
            str += 'Name: ' + result.hits.hit[k].fields.name + '<br>';
            str += 'Reg no: ' + result.hits.hit[k].fields.registration_number + '<br>';
            str += 'Reg date: ' + result.hits.hit[k].fields.registration_date + '<br>';
            str += 'Address: ' + result.hits.hit[k].fields.address + '<br>';
            str += 'Qualification: ' + result.hits.hit[k].fields.qualification + '<br>';
            if (k < result.hits.hit.length - 1) str += '<hr>';
          }
        }
        $('#mybox').html(str);
        $('#loading').hide();
      }
    });
  });

  $('#grabNHIFDetails').click(function() {
    var hospital_location = $('#county_select option:selected').text();
    var hospital_type = $('#county_select').val();
    $('#dname').html('<h4>' + hospital_location + '</h4>');
    $('#mybox').html('');
    $('#loading').show();
    url = 'https://t875kgqahj.execute-api.eu-west-1.amazonaws.com/prod?q=' + hospital_location;
    $.ajax({
      url: url,
      success: function(result) {
        str = '';
        for (var i = 0; i < result.hits.hit.length; i++) {
          str += 'Name: ' + result.hits.hit[i].fields.name + '<br>';
          str += 'Service point: ' + result.hits.hit[i].fields.service_point + '<br>';
          str += 'County. :' + result.hits.hit[i].fields.county + '<br>';
          str += '<hr>';
        }
        $('#mybox').html(str);
        $('#hospital_location').val('');
        $('#loading').hide();
      }
    });
  });

  $('#facility-search').click(function() {
    query = $('#areaName').val();
    $('#dname').html('<h4>Results for: ' + query + '</h4>');
    $('#mybox').html('');
    $('#loading').show();
    if (query !== '') {
      get_health_facilites(query);
    }
  });

  $('.filter_feed').click(function() {
    var tag = $(this).attr('data-tag');
    $('#filtered').html('');
    $.ajax({
      url: 'filter_feed?tag=' + tag,
      success: function(result) {
        $('#filtered').html(result);
        $('#loading').hide();
      }
    });
  });

  $('#whatsMyContribution').click(function() {
    $('#myContribution').html('');
  });

  $('#calculate').click(function() {
    var income = $('#income').val();
    if (income === '') {
      $('#myContribution').html('You did not enter your income!');
    } else {
      if (!jQuery.isNumeric(income)) {
        $('#myContribution').html('Only numbers allowed!');
      } else {
        //do the calculations
        var result;

        if (income < 6000) {
          result = '150';
        } else if (income < 8000) {
          result = '300';
        } else if (income < 12000) {
          result = '400';
        } else if (income < 15000) {
          result = '500';
        } else if (income < 20000) {
          result = '600';
        } else if (income < 25000) {
          result = '750';
        } else if (income < 30000) {
          result = '850';
        } else if (income < 35000) {
          result = '900';
        } else if (income < 40000) {
          result = '950';
        } else if (income < 45000) {
          result = '1000';
        } else if (income < 50000) {
          result = '1100';
        } else if (income < 60000) {
          result = '1200';
        } else if (income < 70000) {
          result = '1300';
        } else if (income < 80000) {
          result = '1400';
        } else if (income < 90000) {
          result = '1500';
        } else if (income < 100000) {
          result = '1600';
        } else {
          result = '1700';
        }

        $('#myContribution').html(result + ' KSH per month');
      }
    }
    $('#income').val('');
  });
});


// APP 3: Health Facilities

function get_health_facilites(query) {
  url = 'https://187mzjvmpd.execute-api.eu-west-1.amazonaws.com/prod?q=' + query + '~2';
  $.ajax({
    method: 'GET',
    url: url
  }).success(function(data) {
    display_health_facilities(data.hits.hit);
  });
}

function display_health_facilities(list) {
  html = '';
  for (var i = 0; i < list.length; i++) {
    data = list[i].fields;
    html += '<div class="row">';
    html += '<div class="col-md-12">';
    html += 'Name: ' + data.name + '<br>';
    html += 'KEPH level name: ' + data.keph_level_name + '<br>';
    html += 'Facility type: ' + data.facility_type_name + '<br>';
    html += 'Owner: ' + data.owner_name + '<br>';
    html += 'County: ' + data.county_name + '<br>';
    html += 'Constituency: ' + data.constituency_name + '<br>';
    html += 'Ward: ' + data.ward_name + '<br>';
    html += '</div>';
    html += '</div>';
    html += '<hr>';
  }
  $('#mybox').html(html);
  $('#areaname').val('');
  $('#loading').hide();
}


// TODO: Update this

function modal_template(i, app) {
  markup = '<div class="modal-dialog" role="document">';
  markup += '<div class="modal-content">';
  markup += '<div class="modal-header">';
  markup += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
  markup += '<h3>Embed Code for ' + app + ' </i></h3>';
  markup += '</div>';
  markup += '<div class="modal-body">';
  markup += 'Copy and paste the following code inside within HTML code';
  markup += '<textarea class="form-control">';
  markup += '<iframe src="' + window.location.protocol + '//' + window.location.host + '/' + i + '" frameborder="0" scrolling="no" height="400px" width="100%"></iframe>';
  markup += '</textarea>';
  markup += '</div>';
  markup += '<div class="modal-footer">';
  markup += '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>';
  markup += '</div></div></div>';
  return markup;
}




// Add Fuzzy Matching for CloudSearch to work well
function cloudsearch_add_fuzzy(search_query) {
  search_query.trim();
  var search_terms = search_query.split(' ');
  search_query = ''; // Reset to re-use
  for (var i = search_terms.length - 1; i >= 0; i--) {
    search_query += search_terms[i] + '|';
    search_query += search_terms[i] + '~1|';
    search_query += search_terms[i] + '~2|';
  }
  // Remove last or (|) operator
  search_query = search_query.substring(0, search_query.length - 1);
  console.log(search_query);
  return search_query.trim();
}

// Function to remove keywords
function cloudsearch_remove_keywords(search_query) {
  search_query = search_query.trim();
  var keywords = ['dr', 'dr.', 'doctor', 'nurse', 'co', 'c.o.', 'c.o', 'clinical officer'];
  for (var i = keywords.length - 1; i >= 0; i--) {
    search_query = search_query.replace(new RegExp('^' + keywords[i]), '');
    search_query = search_query.replace(new RegExp('^' + keywords[i].toUpperCase), '');
    search_query = search_query.replace(new RegExp('^' + toTitleCase(keywords[i])), '');
  }
  return search_query.trim();
}
