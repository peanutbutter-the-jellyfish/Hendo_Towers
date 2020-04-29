// initialize our map
var map = L.map('map', {
    center:[35.317748, -82.460358], //center map on Hendersonville, NC
    zoom:9 //set the zoom level
});

//add openstreet baselayer to the map
var OpenStreetMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 15,
  minZoom: 8,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//add a scale bar
L.control.scale({
  position: 'bottomright'
}).addTo(map);

// Add functions to style the polygons by values
function getColor(d) {
  return d === null ? 'red' :
        'blue';
};

//load the data asynchronously
d3.queue()
  .defer(d3.json, 'data/Henderson_County.geojson') //the Hendo County layer
  .defer(d3.json, 'data/Communications_Towers.geojson') //the Hendo towers layer
  .await(drawMap); //load the layers after the map loads

  //provide instructions for drawing the map
  function drawMap(err, hendoCounty, towerPoints) {

    var county = L.geoJson(hendoCounty, {
      style: function(feature) {
        return {
          stroke: 1,
          color: "grey",
          weight: 1,
          fillOpacity: 0
        };
      }
    }).addTo(map); //add Hendo County layer and style

    var towers = L.geoJson(towerPoints, { //define layer with a variable
      pointToLayer: function(feature, ll) {

        var props = feature.properties;

        //style the points as circle markers
        return L.circleMarker(ll, {
          radius: 4,
          //fillColor: getColor(props.Median_TotalMilesWithinOR),
          fillColor: "blue",
          color: "gray",
          weight: 1,
          opacity: 1.0,
          fillOpacity: 1.0
        })
      }, //end pointToLayer

      //restyle on mouseover, reset style on mouseout
      onEachFeature: function(feature, layer) {

        var props = layer.feature.properties;

        //define what happens on mouseover
        layer.on("mouseover", function(e) {
          layer.setStyle({
            radius: 4,
            fillColor: "yellow",
            color: "gray",
            weight: 1,
            opacity: 1.0,
            fillOpacity: 1.0,
          });
        });

        //bind a popup window to each circle marker
        layer.bindPopup("<h3 style='font-size:20px'>Tower Information</h3>" + "<br>" +
          "<h4 style='font-size:12px'> Address: " + props.TOWERADDRE +
          "<br>Tower Height: " + props.TOWERHEIGH +
          "<br>Permit: " + props.PERMIT_ +
          "<br>Tower Type: " + props.TYPE +
          "<br>Tower Owner: " + props.TOWER_OWNE +
          "<br>Land Owner: " + props.LANDOWNER +
          "<br>Contact: " + props.CONTACT +
          "<br>Owner Phone: " + props.OWNER_PHON +
          "<br>Image: " + "<a href='" +  props.HYPERLINK + "' target='_blank'>See Image</a>" + "</h4>"
        );

        //define what happens on mouseout
        layer.on("mouseout", function(e) {

          //style the points
          layer.setStyle({
            radius: 4,
            fillColor: "blue",
            color: "gray",
            weight: 1,
            opacity: 1.0,
            fillOpacity: 1.0,
          });

        });

      } //end onEachFeature

    }).addTo(map);

    //fit the map to the extent of the circle markers upon drawing
    map.fitBounds(towers.getBounds());

    //define layers
    var overlays = {
      "Henderson County": county,
      "Communication Towers": towers,
    };

    //send the layers to the layer control
    L.control.layers(null, overlays, {
      collapsed: false,
    }).addTo(map);

  }; //end drawMap function
