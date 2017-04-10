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
        // Clincal Officers is default
        url = 'https://2tm3hso2d9.execute-api.eu-west-1.amazonaws.com/prod?q=';
    }
    search_query = cloudsearch_remove_keywords(name);
    url = url + encodeURIComponent(cloudsearch_add_fuzzy(search_query));

    $('#dname').html('<h4>Results for ' + toTitleCase(search_type) + ' search: ' + name + '</h4>');
    $('#mybox').html('');
    $('#loading').show();

    $.ajax({
      url: url,
      success: function(result) {
        var response_html = '';
        if (search_type == 'doctor') {
          for (var i = 0; i < result.hits.hit.length; i++) {
            response_html += 'Name: ' + result.hits.hit[i].fields.name + '<br>';
            response_html += 'Reg no.: ' + result.hits.hit[i].fields.reg_no + '<br>';
            response_html += 'Qualification: ' + result.hits.hit[i].fields.qualifications + '<br>';
            response_html += 'Registration date: ' + new Date(result.hits.hit[i].fields.reg_date).toDateString() + '<br>';
            if (i < result.hits.hit.length - 1) response_html += '<hr>';
          }
        } else if (search_type == 'nurse') {
          for (var j = 0; j < result.hits.hit.length; j++) {
            response_html += 'Name: ' + result.hits.hit[j].fields.name + '<br>';
            response_html += 'License: ' + result.hits.hit[j].fields.license + '<br>';
            response_html += 'Valid until: ' + result.hits.hit[j].fields.valid_until + '<br>';
            if (j < result.hits.hit.length - 1) response_html += '<hr>';
          }
        } else {
          // Clinical Officers
          for (var k = 0; k < result.hits.hit.length; k++) {
            response_html += 'Name: ' + result.hits.hit[k].fields.name + '<br>';
            response_html += 'Reg no: ' + result.hits.hit[k].fields.reg_no + '<br>';
            response_html += 'Reg date: ' + new Date(result.hits.hit[k].fields.reg_date).toDateString() + '<br>';
            response_html += 'Address: ' + result.hits.hit[k].fields.address + '<br>';
            response_html += 'Qualification: ' + result.hits.hit[k].fields.qualifications + '<br>';
            if (k < result.hits.hit.length - 1) response_html += '<hr>';
          }
        }

        // Not found
        if (result.hits.found === 0) {
          response_html += '<p style="text-align: center;">';
          response_html += 'Oops. We could not find any ' + toTitleCase(search_type) + ' by that name.';
          response_html += '</p><p style="text-align: center;">';
          response_html += '<small><em><a href="mailto:starhealth@codeforkenya.org" target="_blank">E-mail us</a></em></small>';
          response_html += '</p>';
        }

        // Google Analytics Events
        ga('send', 'event', 'DodgyDr', 'search', name, result.hits.found);
        ga('theStar.send', 'event', 'DodgyDr', 'search', name, result.hits.found);
        ga('theStarHealth.send', 'event', 'DodgyDr', 'search', name, result.hits.found);
        ga('CfAFRICA.send', 'event', 'DodgyDr', 'search', name, result.hits.found);

        $('#mybox').html(response_html);
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
        var response_html = '';
        for (var i = 0; i < result.hits.hit.length; i++) {
          response_html += 'Name: ' + result.hits.hit[i].fields.name + '<br>';
          response_html += 'Service point: ' + result.hits.hit[i].fields.service_point + '<br>';
          response_html += 'County: ' + result.hits.hit[i].fields.county + '<br>';
          response_html += '<hr>';
        }

        // Google Analytics Events
        ga('send', 'event', 'InsuranceHospital', 'search', hospital_location, result.hits.found);
        ga('theStar.send', 'event', 'InsuranceHospital', 'search', hospital_location, result.hits.found);
        ga('theStarHealth.send', 'event', 'InsuranceHospital', 'search', hospital_location, result.hits.found);
        ga('CfAFRICA.send', 'event', 'InsuranceHospital', 'search', hospital_location, result.hits.found);

        $('#mybox').html(response_html);
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
        var result = 1700;

        if (income < 6000) {
          result = 150;
        } else if (income < 8000) {
          result = 300;
        } else if (income < 12000) {
          result = 400;
        } else if (income < 15000) {
          result = 500;
        } else if (income < 20000) {
          result = 600;
        } else if (income < 25000) {
          result = 750;
        } else if (income < 30000) {
          result = 850;
        } else if (income < 35000) {
          result = 900;
        } else if (income < 40000) {
          result = 950;
        } else if (income < 45000) {
          result = 1000;
        } else if (income < 50000) {
          result = 1100;
        } else if (income < 60000) {
          result = 1200;
        } else if (income < 70000) {
          result = 1300;
        } else if (income < 80000) {
          result = 1400;
        } else if (income < 90000) {
          result = 1500;
        } else if (income < 100000) {
          result = 1600;
        }

        // Google Analytics Events
        ga('send', 'event', 'InsuranceContribution', 'search', income.toString(), result);
        ga('theStar.send', 'event', 'InsuranceContribution', 'search', income.toString(), result);
        ga('theStarHealth.send', 'event', 'InsuranceContribution', 'search', income.toString(), result);
        ga('CfAFRICA.send', 'event', 'InsuranceContribution', 'search', income.toString(), result);

        $('#myContribution').html('KSH.' + numberWithCommas(result) + ' per month');
      }
    }
  });
});

// APP 3: Health Facilities

function get_health_facilites(query) {
  url = 'https://187mzjvmpd.execute-api.eu-west-1.amazonaws.com/prod?q=' + query + '~2';
  $.ajax({
    method: 'GET',
    url: url
  }).success(function(data) {
    display_health_facilities(data.hits.hit, data.hits.found);
  });
}

function display_health_facilities(list, found_no) {
  var response_html = '';
  for (var i = 0; i < list.length; i++) {
    data = list[i].fields;
    response_html += '<div class="row">';
    response_html += '<div class="col-md-12">';
    response_html += 'Name: ' + data.name + '<br>';
    response_html += 'KEPH level name: ' + data.keph_level_name + '<br>';
    response_html += 'Facility type: ' + data.facility_type_name + '<br>';
    response_html += 'Owner: ' + data.owner_name + '<br>';
    response_html += 'County: ' + data.county_name + '<br>';
    response_html += 'Constituency: ' + data.constituency_name + '<br>';
    response_html += 'Ward: ' + data.ward_name + '<br>';
    response_html += '</div>';
    response_html += '</div>';
    response_html += '<hr>';
  }

  // Not found
  if (found_no === 0) {
    response_html += '<p style="text-align: center;">';
    response_html += 'Oops... We could not find any hospital that matches your search.';
    response_html += '</p><p style="text-align: center;">';
    response_html += '<small><em><a href="mailto:starhealth@codeforkenya.org" target="_blank">E-mail us</a></em></small>';
    response_html += '</p>';
  }

  // Google Analytics Events
  ga('send', 'event', 'HospitalFinder', 'search', query, found_no);
  ga('theStar.send', 'event', 'HospitalFinder', 'search', query, found_no);
  ga('theStarHealth.send', 'event', 'HospitalFinder', 'search', query, found_no);
  ga('CfAFRICA.send', 'event', 'HospitalFinder', 'search', query, found_no);

  $('#mybox').html(response_html);
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
  search_query = search_query.trim();
  var search_terms = search_query.split(' ');

  search_query += '|'; // Start with the exact match

  // TODO: Update to loop through combinations like a matrix
  for (var i = search_terms.length - 1; i >= 0; i--) {
    search_query += search_terms[i] + '|';
    search_query += search_terms[i] + '~1|';
    search_query += search_terms[i] + '~2|';
  }
  // Remove last or (|) operator
  search_query = search_query.substring(0, search_query.length - 1);
  return search_query.trim();
}

// Function to remove keywords
function cloudsearch_remove_keywords(search_query) {
  search_query = search_query.trim();
  search_query = search_query.toLowerCase();
  var keywords = ['dr', 'dr.', 'doctor', 'nurse', 'co', 'c.o.', 'c.o', 'clinical officer'];
  for (var i = keywords.length - 1; i >= 0; i--) {
    search_query = search_query.replace(new RegExp('^' + keywords[i]), '');
  }
  return search_query.trim();
}
