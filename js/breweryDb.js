// These varibles are used to communicate with the BreweryDB API
var breweryDbUrl = "https://api.brewerydb.com/v2";
var breweryDbKey = "&key=0d1c7bd898b81732618aa3295f808828";
var search;
var terms;
var fullUrl;
var requestTimeout;
var apiRequest ;
var apiAttribution = "(Source: www.brewerydb.com)";

// parse an object from the BreweryDB API brewery list
var Brewery = function(response)
{
  this.id = response.breweryId;
  this.name = response.brewery.name;
  this.address = response.streetAddress;
  this.latitude = response.latitude;
  this.longitude = response.longitude;
  this.website = response.website;
};

/**
    Sample API call:
    http://api.brewerydb.com/v2/locations?locality=Minneapolis&key=0d1c7bd898b81732618aa3295f808828, http://jfuerst92.github.io/How-To-Guide/requests.html, http://api.brewerydb.com/v2/breweries?ids=rdrfPw&key=0d1c7bd898b81732618aa3295f808828)
*/

var getBreweries = function()
{
    destinations = [];

    // clear destinations and return if no city was selected
    if (selectedCity() == null)
    {
        $('#seeBreweries').click();
        return;
    }

    // call the API to get a list of breweries
    search = "/locations?";
    terms = "locality=" +  selectedCity();
    fullUrl = breweryDbUrl + search + terms + breweryDbKey;

    console.log("URL: " + fullUrl);

    requestTimeout = setTimeout(function()
    {
      alert("Unable to retrieve brewery list within 12 seconds");
    }, 12000);

    breweryRequest = new XMLHttpRequest();
    breweryRequest.open("GET", this.fullUrl, true);

    breweryRequest.addEventListener('load', function()
    {
        var response = JSON.parse(breweryRequest.responseText);

        if (response.data.length > 0)
        {
            // limit number of breweries (maxDestinations ) to keep display manageable
            for (var i = 0; i < response.data.length && destinations.length < maxDestinations; i++)
            {
                this.brewery = response.data[i];

                // store brewery only if it's open and has full mapping info
                if (this.brewery.isClosed == 'N'
                &&  this.brewery.isPrimary == 'Y'
                &&  this.brewery.streetAddress != null
                &&  this.brewery.latitude != null
                &&  this.brewery.longitude != null)
                {
                    console.log("ID: " + this.brewery.breweryId);
                    console.log("Name: " + this.brewery.brewery.name);

                    if (this.brewery.website == null)
                    {
                        this.brewery.website = "no website";
                    }

                    destinations.push(new Brewery(this.brewery));
                }
            };

            console.log("destinations: " + destinations.length);
            console.log(destinations);

            clearTimeout(requestTimeout);

            /**
                clicking this hidden button triggers the display of breweries
            */
            $('#seeBreweries').click();
      }
      else
      {
            alert("No breweries found");
      }
    });

    breweryRequest.send();
}