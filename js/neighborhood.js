/**
  These variables are used to communicate with the Weather Underground API
*/
var wundergroundUrl = "https://api.wunderground.com/api/";
var wundergroundKey = "3f71928e9073dc9f/";
var search;
var terms;
var fullUrl;
var requestTimeout;
var apiAttribution = "(Source: www.wunderground.com)";
/** */

var destinations = [];

var getDestinations;

var defaultMapCenter = "United States";

var cityList = [' ',
                'Atlanta, GA',
                'Baltimore, MD',
                'Boston, MA',
                'Chicago, IL',
                'Cincinnati, OH',
                'Cleveland, OH',
                'Dallas, TX',
                'Denver, CO',
                'Detroit, MI',
                'Houston, TX',
                'Kansas City, MO',
                'Los Angeles, CA',
                'Miami, FL',
                'Milwaukee, WI',
                'Minneapolis, MN',
                'New York, NY',
                'Oakland, CA',
                'Philadelphia, PA',
                'Phoenix, AZ',
                'Pittsburgh, PA',
                'Saint Louis, MO',
                'San Diego, CA',
                'San Francisco, CA',
                'Seattle, WA',
                'Tampa, FL',
                'Washington, DC'
               ];

/**
  maxDestination defines the number of destinations to display for different screen sizes
  mapZoom defines the map zoom factor for different screen sizes
*/
var maxDestinationList = [5, 8, 12];
var mapZoomList = [10, 11, 12];

/**
  Return the screen size level:
    0 for small
    1 for medium
    2 for large

  The level is used to access values in the above arrays
*/
var screenSizeLevel = function()
{
    var mq = window.matchMedia('(min-width: 1000px)');
    if (mq.matches)
    {
        return 2;
    }
    else
    {
        mq = window.matchMedia('(min-width: 650px)');
        if (mq.matches)
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }
};

/**
  Return the city selected by the user
*/

var geoLocation = [{city: null, state: null}];

var getSelectedCity = function()
{
    var cityInput = document.getElementById("selectedCity").value;

    // return if no city was selected
    if (cityInput === null || cityInput.trim().length === 0)
    {
        return null;
    }

    var tokens = cityInput.split(",");

    geoLocation[0].city = tokens[0].trim();
    var state = "";

    if (cityList.length > 1)
    {
        geoLocation[0].state = tokens[1].trim();
    }
};

var getCity = function()
{
    return geoLocation[0].city;
};

var getState = function()
{
    return geoLocation[0].state;
};

var citySelected = function()
{
    return (getCity() !== null && getState() !== null);
};

/**
  Center the passed map on the passed location
*/
var centerMap = function(map, mapCenter)
{
    var geocoder = new google.maps.Geocoder();

    if (mapCenter === null)
    {
        mapCenter = defaultMapCenter;
    }

    geocoder.geocode({'address': mapCenter}, function(results, status)
    {
        if (status == google.maps.GeocoderStatus.OK)
        {
            map.setCenter(results[0].geometry.location);
        }
        else
        {
            alert("Could not find location : " + location);
        }
    });
};

/**
  determine if passed 'string' contains the passed value
*/
var stringContains = function(string, contains)
{
    string = string || "";
    if (contains.length > string.length)
        return false;
    return string.includes(contains);
};

/**
  make the first character of the passed lower case for better display
*/
var cleanupDisplay = function(string)
{
    string = string || "";
    return string.charAt(0).toLowerCase() + string.slice(1);
};

/**
    parse an object from the Wunderground API weather station list
*/
var WeatherStation = function(response)
{
  this.id = response.id;
  this.name = response.neighborhood + ", " + response.city;
  this.latitude = response.lat;
  this.longitude = response.lon;
};


function initMap()
{
    var ViewModel = function()
    {
      //Self alias
      var self = this;

      ko.options.deferUpdates = true;

      //Center map on University of Minnesota east bank
      this.map = new google.maps.Map(document.getElementById('map'),
      {
        zoom: 5,
      });
      centerMap(self.map, defaultMapCenter);

      this.infoWindow = new google.maps.InfoWindow();

      // list of cities
      this.cities = ko.observableArray(cityList);

      // list of map markers
      this.markers = ko.observableArray([]);

      // This filters the display of destinations
      self.filter = ko.observable('');

      /**
        Get a list of weather stations for the city selected by the user
      */
      getDestinations = function()
      {
          getSelectedCity();

          destinations = [];

          var weatherStation;

          var maxDestinations = maxDestinationList[screenSizeLevel()];
          console.log("maxDestinations: " + maxDestinations);

          if (citySelected())
          {
              search = "geolookup/";
              terms = "q/" + getState() + "/" + getCity() + ".json";
              fullUrl = wundergroundUrl + wundergroundKey + search + terms;

              console.log("URL: " + fullUrl);

              var requestTimeout = setTimeout(function()
              {
                 alert("Failed to get Weather Station list within 12 seconds");
              }, 12000);

             $.ajax
             ({
                  url: fullUrl,
                  success: function(response)
                  {
                      this.weatherStations = response.location.nearby_weather_stations.pws.station;

                      // limit number of stations (maxDestinations ) to keep display manageable
                      for (var i = 0; i < this.weatherStations.length && destinations.length < maxDestinations; i++)
                      {
                          // skip stations that have the city name in the station name
                          if (this.weatherStations[i].neighborhood.indexOf(getCity()) < 0)
                          {
                              weatherStation = new WeatherStation(this.weatherStations[i]);

                              // skip stations with duplicate names
                              var found = false;
                              for (var j = 0; j < destinations.length; j++)
                              {
                                  if (destinations[j].name === weatherStation.name)
                                  {
                                      found = true;
                                  }
                              }

                              if (!found)
                              {
                                  destinations.push(weatherStation);
                              }
                          }
                      }

                      console.log("weather stations: " + destinations.length);

                      /**
                        clicking this hidden button triggers the display of markers
                      */
                      $('#seeMarkers').click();

                      clearTimeout(requestTimeout);
                  },
                  error: function(XMLHttpRequest, textStatus, errorThrown)
                  {
                      alert("Status: " + textStatus);
                      alert("Error: " + errorThrown);
                  }
              });
          }
      };

      /**
        Loop through the weather stations and add markers
      */
      this.loadMarkers = function()
      {
          // clear markers if array was already populated
          while (self.markers().length > 0)
          {
              self.markers.pop();
          }

          destinations.forEach(function(destination)
          {
              console.log("add marker for: " + destination.name);
              // Create a marker for each destination
              this.marker = new google.maps.Marker
              ({
                  position: {lat: destination.latitude, lng: destination.longitude},
                  name: destination.name,
                  id: destination.id,
                  animation: google.maps.Animation.DROP
              });

              var currentMarker = this.marker;

              // Create an onclick event to open an infoWindow at each marker.
              google.maps.event.addListener(currentMarker, 'click', function()
              {
                  search = "conditions/";
                  terms = "q/pws:" + currentMarker.id + ".json";
                  fullUrl = wundergroundUrl + wundergroundKey + search + terms;

                  console.log("URL: " + fullUrl);

                  var requestTimeout = setTimeout(function()
                  {
                     alert("Failed to get Weather Station conditions within 8 seconds");
                  }, 8000);

                  $.ajax
                  ({
                      url: fullUrl,
                      success: function(response)
                      {
                          this.observation = response.current_observation;

                          if (self.infoWindow.marker != this)
                          {
                              self.infoWindow.marker = this;
                              self.infoWindow.setContent
                                ('<h5 class="infoWindow">Conditions at ' + currentMarker.name + '</h5>' +
                                 '<p class="infoWindow">It\'s ' + cleanupDisplay(this.observation.weather) + ' and ' + this.observation.temperature_string + '</p>' +
                                 '<p class="infoWindow">The wind is ' + cleanupDisplay(this.observation.wind_string)  + '</p>' +
                                 '<p class="infoWindow">It feels like ' + this.observation.feelslike_string + '</p>' +
                                 '<p class="infoWindow">'+ apiAttribution + '</p>');
                              self.infoWindow.setPosition(currentMarker.position);
                              self.infoWindow.open(self.map);

                              // Make sure the marker property is cleared if the infoWindow is closed.
                              self.infoWindow.addListener('closeclick', function()
                              {
                                  self.infoWindow.marker = null;
                              });
                          }

                          clearTimeout(requestTimeout);
                      },
                      error: function(XMLHttpRequest, textStatus, errorThrown)
                      {
                          alert("Status: " + textStatus);
                          alert("Error: " + errorThrown);
                      }
                  });
              });

              // show marker
              this.marker.setMap(self.map);
              this.marker.setVisible(true);

              // Add the marker to the destination
              destination.marker = this.marker;

              // add the marker to the observable array
              self.markers.push(this.marker);
          });

          self.map.setZoom(mapZoomList[screenSizeLevel()]);
          centerMap(self.map, getCity());
      };

      // This is the search value
      self.filter = ko.observable('');

      /**
        filter the items using the filter text
      */
      self.filterMarkers = function()
      {
          var filter = self.filter().toLowerCase();

          if (!filter)
          {
              // make all markers visible when filter is cleared
              self.markers().forEach(function(marker)
              {
                  marker.setVisible(true);
              });

              return self.markers();
          }
          else
          {
              return ko.utils.arrayFilter(self.markers(), function(marker)
              {
                  marker.setVisible(false);
                  displayMarker = stringContains(marker.name.toLowerCase(), filter);

                  if (displayMarker)
                  {
                      marker.setVisible(true);
                  }

                  return displayMarker;
              });
          }
      };

      self.filteredMarkers = ko.computed(self.filterMarkers);

      /**
       Activate marker when destination selected from list
      */
      self.activateMarker = function(marker)
      {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          google.maps.event.trigger(marker, 'click');

          // stop bouncing after 3 seconds
          setTimeout(function()
          {
              marker.setAnimation(null);
          }, 3000);
      };

      self.updateMarker = function(marker, name)
      {
          marker.name = name;
      };
  };

  // Instantiate the ViewModel
  ko.applyBindings(new ViewModel());
}