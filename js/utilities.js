// utilities.js

// Title Case
// URL: http://stackoverflow.com/a/196991/1298144
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Add Commas
// URL: http://stackoverflow.com/a/2901298/1298144
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
