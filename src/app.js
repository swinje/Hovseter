var UI = require('ui');
var ajax = require('ajax');


// Create a Card with title 
var card = new UI.Card({
  title:' T-Banen',
  subtitle: 'Henter...'
});

// Display the Card
card.icon('images/ruterhash.PNG');
card.show();

// Construct URL
// Change these for your ID
// Station ID for Hovseter T
var originA='3012430'; 
var originAName='Hovseter';
// Station ID for Jernbanetorget T
var originB='3010011';
var originBName='JernbaneT';

// Make URL to request ReisAPI. Most of the job is to figure out time to send in
function makeURL(oA, oB) {
  var currentdate = new Date(); 
  var currenttime = ('0' + currentdate.getDate()).slice(-2) + "" +
    ('0' + (currentdate.getMonth()+1)).slice(-2) + "" +
    currentdate.getFullYear() + "" +
    ('0' + currentdate.getHours()).slice(-2) + "" +
    ('0' + currentdate.getMinutes()).slice(-2) + "" +
    ('0' + currentdate.getSeconds()).slice(-2);
  //console.log("currenttime " + currenttime);
  var URL = 'http://reisapi.ruter.no/Travel/GetTravels?fromPlace=' + 
    oA + '&toPlace=' + oB +'&isafter=True&time='+currenttime;

  return URL;
}

// Pulling out time for next stop minus time now and result is hours : minutes to next
// Works uhm almost all the time...
var parseFeed = function(data) {
    var dateNow = new Date();
    console.log("systemdate " + dateNow);
    // Not sure if the object from ReisAPI is indeed UTC -- seems local Oslo
    var gmt = new Date(data.TravelProposals[0].DepartureTime);
    var utc = gmt.getTime() + (gmt.getTimezoneOffset() * 60000);
    var nextTravel = new Date(utc);
    console.log("nextraveldate " + nextTravel);
    var diff = new Date(Math.abs(nextTravel - dateNow));
    var hours = diff.getUTCHours();
    var minutes = diff.getUTCMinutes();
    console.log(hours + ":" + minutes);
    return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
};

// Make the request from originA
// Async function
ajax(
  {
    url: makeURL(originA, originB),
    type: 'json'
  },
  function(data) {
    var nextTime= parseFeed(data);
    setBody(nextTime, null);
  },
  function(error) {
    // Failure!
    console.log('Error: ' + error);
  }
);

// Make the request from originB
// Async function
ajax(
  {
    url: makeURL(originB, originA),
    type: 'json'
  },
  function(data) {
    var nextTime= parseFeed(data);
    setBody(null, nextTime);
  },
  function(error) {
    // Failure!
    console.log('Error: ' + error);
  }
);

var stopA = "...";
var stopB = "...";
// Sync function that picks up the results from the two asyncs
function setBody(a, b) {
  if (a !== null) stopA = a;
  if (b !== null) stopB = b;
  card.subtitle(originAName + "\n"+ stopA + "\n" + originBName + "\n" + stopB);

}
