var locations =
[
  { name: 'Surly Brewing',
    address: '520 Malcolm Ave SE, Minneapolis, MN 55414',
    latitude: 44.973279,
    longitude: -93.209802,
    website: 'http://surlybrewing.com/',
    marker: ''
  },
  { name: 'Lake Monster Brewing',
    address: '550 Vandalia St #160, St Paul, MN 55114',
    latitude: 44.957913,
    longitude: -93.191392,
    website: 'http://www.lakemonsterbrewing.com/',
    marker: ''
  },
  { name: 'Urban Growler Brewing',
    address: '2325 Endicott St, St Paul, MN 55114',
    latitude: 44.970632,
    longitude: -93.193282,
    website: 'http://www.urbangrowlerbrewing.com/',
    marker: ''
  },
  { name: 'BlackStack Brewing',
    address: '755 Prior Ave N, St Paul, MN 55104',
    latitude: 44.964203,
    longitude: -93.182941,
    website: 'http://www.blackstackbrewing.com/',
    marker: ''
  },
  { name: 'Fulton Brewery',
    address: '414 N 6th Ave, Minneapolis, MN 55401',
    latitude: 44.985134,
    longitude: -93.279214,
    website: 'http://www.fultonbeer.com/',
    marker: ''
  },
  { name: 'Eastlake Craft Brewery',
    address: '920 E Lake St, Minneapolis, MN 55407',
    latitude: 44.948903,
    longitude: -93.260741,
    website: 'http://www.eastlakemgm.com/',
    marker: ''
  },
  { name: 'Wild Mind Artisan Ales',
    address: '6031 Pillsbury Ave S, Minneapolis, MN 55419',
    latitude: 44.893291,
    longitude: -93.281513,
    website: 'http://www.wildmindales.com/',
    marker: ''
  }
];

var NeighborhoodPlace = function(data)
{
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.latitude = ko.observable(data.latitude);
  this.longitude = ko.observable(data.longitude);
  this.website = ko.observable(data.website);
  this.marker = ko.observable(data.marker);
};

function initMap()
{
  var ViewModel = function()
  {
    //Self alias
    var self = this;

    // create list of neighborhood locations
    this.neighborhoodPlaces = ko.observableArray([]);

    locations.forEach(function(neighborhoodItem)
    {
        self.neighborhoodPlaces.push(new NeighborhoodPlace(neighborhoodItem));
    });

    //Center map on University of Minnesota east bank
    var map = new google.maps.Map(document.getElementById('map'),
    {
      zoom: 12,
      center: {lat: 44.978409, lng: -93.234671}
    });

    // Link marker to selected list item
    self.selectedMarker = function(marker)
    {
      google.maps.event.trigger(this.marker, 'click');
    };
  };

  //Instantiate the ViewModel
  ko.applyBindings(new ViewModel());
}