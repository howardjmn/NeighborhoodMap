var locations =
[
  { name: 'Surly Brewing',
    address: '520 Malcolm Ave SE, Minneapolis, MN 55414',
    location: {lat: 44.973279, lng: -93.209802},
    website: 'http://www.lakemonsterbrewing.com/',
    marker: ''
  },
  { name: 'Urban Growler Brewing',
    address: '2325 Endicott St, St Paul, MN 55114',
    location: {lat: 44.970632, lng: -93.193282},
    website: 'http://www.urbangrowlerbrewing.com/',
    marker: ''
  },
  { name: 'BlackStack Brewing',
    address: '755 Prior Ave N, St Paul, MN 55104',
    location: {lat: 44.964203, lng: -93.182941},
    website: 'http://www.blackstackbrewing.com/',
    marker: ''
  },
  { name: 'Fulton Brewery',
    address: '414 N 6th Ave, Minneapolis, MN 55401',
    location: {lat: 44.985134, lng: -93.279214},
    website: 'http://www.fultonbeer.com/',
    marker: ''
  },
  { name: 'Eastlake Craft Brewery',
    address: '920 E Lake St, Minneapolis, MN 55407',
    location: {lat: 44.948903, lng: -93.260741},
    website: 'http://www.eastlakemgm.com/',
    marker: ''
  },
  { name: 'Wild Mind Artisan Ales',
    address: '6031 Pillsbury Ave S, Minneapolis, MN 55419',
    location: {lat: 44.893291, lng: -93.281513},
    website: 'http://www.wildmindales.com/',
    marker: ''
  }
];

var NeighborhoodPlace = function(data)
{
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.latitude = ko.observable(data.location.lat);
  this.longitude = ko.observable(data.location.lng);
  this.website = ko.observable(data.website);
  this.marker = ko.observable(data.marker);
};

function initMap()
{
  var ViewModel = function()
  {
    //Self alias
    var self = this;

    //Center map on University of Minnesota east bank
    this.map = new google.maps.Map(document.getElementById('map'),
    {
      zoom: 12,
      center: {lat: 44.978409, lng: -93.234671}
    });
    this.markers = [];
    this.infoWindow = new google.maps.InfoWindow();

    // create list of neighborhood locations
    this.neighborhoodPlaces = ko.observableArray([]);

    locations.forEach(function(neighborhoodItem)
    {
        self.neighborhoodPlaces.push(new NeighborhoodPlace(neighborhoodItem));
    });

    // Link marker to selected list item
    self.selectedMarker = function(marker)
    {
      google.maps.event.trigger(this.marker, 'click');
    };

    // The following loop uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++)
    {
      // Get the position from the location array.
      var position = locations[i].location;
      var name = locations[i].name;
      var address = locations[i].address;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker
      ({
          position: position,
          name: name,
          address: address,
          animation: google.maps.Animation.DROP,
          id: i
      });

      // Create an onclick event to open an infoWindow   at each marker.
      marker.addListener('click', function()
      {
          // Check to make sure the infoWindow   is not already opened on this marker.
          if (self.infoWindow.marker != this)
          {
              self.infoWindow.marker = this;
              self.infoWindow.setContent
                ('<div>' + this.name + '</div>' +
                 '<div>' + this.address + '</div>');
              self.infoWindow.open(self.map, this);
              // Make sure the marker property is cleared if the infoWindow   is closed.
              self.infoWindow.addListener('closeclick', function()
              {
                self.infoWindow.marker = null;
              });
          }
       });

      //show marker
      marker.setMap(self.map);

      // Push the marker to our array of markers.
      self.markers.push(marker);
    };
  };

  //Instantiate the ViewModel
  ko.applyBindings(new ViewModel());
}