/**
  These variables are used to communicate with the Weather Underground API
*/
var wundergroundUrl = "https://api.wunderground.com/api/";
var wundergroundKey = "3f71928e9073dc9f/";
var search;
var terms;
var fullUrl;
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
                'Oak Harbor, WA',
                'Oakland, CA',
                'Philadelphia, PA',
                'Phoenix, AZ',
                'Pittsburgh, PA',
                'St. Louis, MO',
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

// default location, displays when map loads
var geoLocation = [{city: 'Minneapolis', state: 'MN'}];

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
    parse an object from the Wunderground API weather station list
*/
var WeatherStation = function(response)
{
  this.id = response.id;
  this.name = response.neighborhood + ", " + response.city;
  this.latitude = response.lat;
  this.longitude = response.lon;
};

var ViewModel = function()
{
    //Self alias
    var self = this;

    ko.options.deferUpdates = true;

    this.map = new google.maps.Map(document.getElementById('map'),
    {
      zoom: 5,
    });
    centerMap(self.map, defaultMapCenter);

    this.infoWindow = new google.maps.InfoWindow();

    // list of cities
    this.cities = ko.observableArray(cityList);

    // This is the city selected by the user
    this.selectedCity = ko.observable(geoLocation);

    self.getCitySelected = function()
    {
        // return if no city was selected
        if (self.selectedCity === null || self.selectedCity().trim().length === 0)
        {
            return null;
        }

        var tokens = self.selectedCity().split(",");

        geoLocation[0].city = tokens[0].trim();
        var state = "";

        if (cityList.length > 1)
        {
            geoLocation[0].state = tokens[1].trim();
        }
    };

    // list of map markers
    this.markers = ko.observableArray([]);

    // This filters the display of destinations
    self.filter = ko.observable('');

    /**
      when a city has been selected call the function that loads the destination array
    */
    self.getDestinations = function()
    {
        /**
          'subscribe' forces a wait until the selected city value changes
        */
        var subscription = self.selectedCity.subscribe(function(newValue)
        {
            self.selectedCity(newValue);
            self.getCitySelected();

            console.log("city: " + self.selectedCity());

            if (citySelected())
            {
                self.loadDestinations();
            }

            this.dispose();
        });
    };

    /**
      Load the list of weather stations for the city selected by the user
    */
    self.loadDestinations = function()
    {
        search = "geolookup/";
        terms = "q/" + getState() + "/" + getCity() + ".json";
        self.callApi(search, terms, self.parseWeatherStations);
    };

    self.parseWeatherStations = function(response)
    {
        destinations = [];

        var weatherStation;

        var maxDestinations = maxDestinationList[screenSizeLevel()];
        console.log("maxDestinations: " + maxDestinations);

        if (destinations.length === 0)
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
              trigger the display of markers
            */
            self.loadMarkers();
        }
    };

    /**
      Loop through the weather stations and add markers
    */
    self.loadMarkers = function()
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
                self.animateMarker(currentMarker);

                search = "conditions/";
                terms = "q/pws:" + currentMarker.id + ".json";
                fullUrl = wundergroundUrl + wundergroundKey + search + terms;
                console.log("URL: " + fullUrl);
                console.log("name " + currentMarker.name);

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
                               '<p class="infoWindow">It\'s ' + this.observation.weather.toLowerCase() + ' and ' + this.observation.temperature_string + '</p>' +
                               '<p class="infoWindow">The wind is ' + this.observation.wind_string + '</p>' +
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
        self.animateMarker(marker);
        google.maps.event.trigger(marker, 'click');
    };

    /**
     Center the map on the marker then animate it
    */
    self.animateMarker = function(marker)
    {
        self.map.panTo(marker.position);

        marker.setAnimation(google.maps.Animation.BOUNCE);

        // stop bouncing after timeout
        setTimeout(function()
        {
            marker.setAnimation(null);
        }, 2800);
    };

    self.updateMarker = function(marker, name)
    {
        marker.name = name;
    };


    self.callApi = function(search, terms, successFunction)
    {
        fullUrl = wundergroundUrl + wundergroundKey + search + terms;
        console.log("URL: " + fullUrl);

        $.ajax
        ({
            url: fullUrl,
            success: function(response)
            {
                successFunction(response);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown)
            {
                alert("Status: " + textStatus);
                alert("Error: " + errorThrown);
            }
        });
    };
};

/**
  Instantiate the ViewModel
*/
function initMap()
{
    console.log("initMap");
    ko.applyBindings(new ViewModel());
}

/**
  Google map error handler
*/
 function mapApiError()
 {
    alert("Sorry, Google map failed to load.  Error detail can be found in Javascript console.");
 }