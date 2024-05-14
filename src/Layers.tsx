import React, { useState, useEffect, useRef } from 'react';
import { TileLayer, LayersControl, GeoJSON, Marker, Popup, useMapEvents } from 'react-leaflet';
// Refernce: https://javascript.plainenglish.io/react-leaflet-v3-creating-a-mapping-application-d5477f19bdeb
import L from 'leaflet';
import './App.css';
import './index.css';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Responsive from '@amcharts/amcharts5/themes/Responsive';

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

const Layers = (props: any) => {
  // Chart
  const barSeriesRef = useRef<unknown | any | undefined>({});
  const yAxisRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [lotData, setLotData] = useState([]);
  const [selectedStateChart, setSelectedStateChart] = useState<any>();

  const chartID = 'pie-two';

  useEffect(() => {
    if (props.chartdata !== undefined) {
      setLotData(props.chartdata);
    }
  }, [props.chartdata]);

  useEffect(() => {
    // Dispose previously created root element

    maybeDisposeRoot(chartID);

    var root2 = am5.Root.new(chartID);
    root2.container.children.clear();
    root2._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root2.setThemes([am5themes_Animated.new(root2), am5themes_Responsive.new(root2)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root2.container.children.push(
      am5xy.XYChart.new(root2, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        //height: am5.percent(81),
      }),
    );
    chartRef.current = chart;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yRenderer = am5xy.AxisRendererY.new(root2, {
      minGridDistance: 5,
      strokeOpacity: 1,
      strokeWidth: 1,
      inversed: true,
      stroke: am5.color('#ffffff'),
    });
    yRenderer.grid.template.set('location', 1);

    var yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root2, {
        maxDeviation: 0,
        categoryField: 'category',
        renderer: yRenderer,
      }),
    );

    // Remove grid lines
    yAxis.get('renderer').grid.template.set('forceHidden', true);

    var xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root2, {
        maxDeviation: 0,
        min: 0,
        strictMinMax: true,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root2, {
          visible: true,
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: am5.color('#ffffff'),
        }),
      }),
    );
    // Remove grid lines
    xAxis.get('renderer').grid.template.set('forceHidden', true);

    // Label properties for yAxis (category axis)
    yAxis.get('renderer').labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: 'center',
      fill: am5.color('#ffffff'),
      //maxWidth: 150,
      fontSize: 12,
    });

    xAxis.get('renderer').labels.template.setAll({
      fill: am5.color('#ffffff'),
      fontSize: 10,
    });

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.ColumnSeries.new(root2, {
        name: 'Series 1',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'value',
        sequencedInterpolation: true,
        categoryYField: 'category',
      }),
    );
    barSeriesRef.current = series;
    chart.series.push(series);

    var columnTemplate = series.columns.template;

    columnTemplate.setAll({
      draggable: true,
      cursorOverStyle: 'pointer',
      tooltipText: '{value}',
      cornerRadiusBR: 10,
      cornerRadiusTR: 10,
      strokeOpacity: 0,
    });

    // Add Label bullet
    series.bullets.push(function () {
      return am5.Bullet.new(root2, {
        locationY: 1,
        sprite: am5.Label.new(root2, {
          text: '{value}',
          fill: root2.interfaceColors.get('alternativeText'),
          centerY: 8,
          centerX: am5.p50,
          fontSize: 13,
          populateText: true,
        }),
      });
    });

    series.columns.template.events.on('click', (ev) => {
      const selected: any = ev.target.dataItem?.dataContext;
      const stateSelected: string = selected.category;
      setSelectedStateChart(stateSelected);
    });

    yAxisRef.current = yAxis;
    yAxis.data.setAll(lotData);
    series.data.setAll(lotData);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root2.dispose();
    };
  }, [chartID, lotData]);

  useEffect(() => {
    barSeriesRef.current?.data.setAll(lotData);
    yAxisRef.current?.data.setAll(lotData);
  });
  //////////////////// End of Chart ////////////////////////////////

  ////////////////////// Layers ////////////////////////////////////
  const [usaData, setUsaData] = useState<any | null>([]);
  const [legendClick, setLegendClicked] = useState<any>();
  const [borderSelected, setBorderSelected] = useState<L.GeoJSON | any>(
    L.geoJSON(props.data, {
      style: highlightStyle,
    }),
  );
  const [resetClick, setResetClick] = useState<boolean>(false);

  // Call useMap
  // const map = useMap();
  const map = useMapEvents({
    zoomend: () => {
      // console.log(map.getZoom());
    },
    moveend: () => {
      // console.log(map.getBounds());
    },
  });
  // console.log('Map Bounds:', map.getBounds());
  // console.log('Zoom Level:', map.getZoom());

  // Polygon color style
  function defaultStyle(feature: any) {
    var density = feature.properties.density;
    return {
      fillColor: getColor(density),
      fillOpacity: 0.7,
      weight: 1,
      opacity: 0.7,
      dashArray: 3,
      color: 'black',
    };
  }

  function highlightStyle(feature: any) {
    return {
      fillColor: '#00FFFF',
      fillOpacity: 0.9,
      weight: 4,
      stroke: true,
      color: '#00FFFF',
    };
  }

  function noStyle(feature: any) {
    return {
      fillColor: 'rgb(0, 0, 0, 0)',
      stroke: false,
    };
  }

  // Popup
  // var popup = L.popup({
  //   closeOnClick: false,
  // });

  useEffect(() => {
    if (selectedStateChart) {
      // Filter props.data based on selected props.state
      const filtered_data = props.data.filter((a: any) => a.properties.name === selectedStateChart);
      borderSelected.removeFrom(map);
      const border = L.geoJSON(filtered_data, {
        style: highlightStyle,
      }).addTo(map);
      setBorderSelected(border);

      // Zoom to the selected states
      map.fitBounds(border.getBounds());
    }
  }, [selectedStateChart]);

  useEffect(() => {
    if (props.state && props.state !== 'All') {
      setUsaData(props.state);

      // Filter props.data based on selected props.state
      const filtered_data = props.data.filter((a: any) => a.properties.name === props.state);
      borderSelected.removeFrom(map);
      const border = L.geoJSON(filtered_data[0]);
      setBorderSelected(border);

      // Zoom to the selected states
      map.fitBounds(border.getBounds());

      // If i want to open popup, when a state is selected from the drop-down list
      // const popup_name = filtered_data[0].properties.name;
      // popup.setLatLng(border.getBounds().getCenter());
      // const state_name = `<b>${popup_name}</b>`;
      // popup.setContent(state_name);
      // popup.openOn(map);

      //  const zoomGeometry = filtered_data[0].geometry.coordinates[0];
      // map.flyToBounds(zoomGeometry);
    } else if (props.state === 'All') {
      borderSelected.removeFrom(map);
      const border_all = L.geoJSON(props.data);
      setBorderSelected(border_all);

      map.fitBounds(border_all.getBounds());
    }
  }, [props.state]);

  // Click legend
  useEffect(() => {
    // Remove border selected style when 'reset' is clicked.
    // borderSelected.removeFrom(map);
    if (legendClick) {
      const clicked_value = Number(legendClick);
      const lowest_value = 200;
      const highest_value = 1000;
      const interval = 200;
      const lower_bound = clicked_value - interval;

      // Zoom and Style
      const filtered_data = props.data.filter((a: any) =>
        clicked_value === lowest_value
          ? a.properties.density < clicked_value
          : clicked_value === highest_value
            ? a.properties.density > highest_value
            : a.properties.density >= lower_bound && a.properties.density < clicked_value,
      );

      // Highlight selected polygons
      borderSelected.removeFrom(map);
      const border = L.geoJSON(filtered_data, {
        style: highlightStyle,
      }).addTo(map);
      setBorderSelected(border);
      map.fitBounds(border.getBounds());

      // The code below tries to clear style of the unselected polygons
      // it does not work.
      // const result = props.data.filter((env: any) =>
      //   filtered_data.some((id: any) => env.id !== id),
      // );
      // L.geoJSON(props.data, {
      //   style: noStyle,
      //   filter: function (feature: any) {
      //     return result;
      //   },
      // }).addTo(map);

      // Filter

      // Calculate total density
      // const total = filtered_data.map((densities: any, sum = 0) => {
      //   sum = sum + densities.properties.density;
      //   return sum;
      // });
      // const grand_total = total.reduce((value: any, sum = 0) => {
      //   return sum + value;
      // });
    }
  }, [legendClick]);

  // Reset style when clicking anywhere on the map
  useEffect(() => {
    borderSelected.removeFrom(map);
  }, [resetClick]);

  // Label
  function onEachFeature(feature: any, layer: any) {
    // does this feature have a property named popupContent?

    if (feature.properties) {
      layer.bindTooltip(feature.properties.name, {
        permanent: true,
        direction: 'center',
        className: 'my-labels',
      });
      layer.on('click', (event: any) => {
        const popup_name = feature.properties.name;
        const popup_density = feature.properties.density;
        const popup_contents = `<b style="color:blue">${popup_name}</b> </br>
                                    Populatin density: ${popup_density}
                                    `;
        layer.bindPopup(popup_contents);
      });
    }
  }

  // Polygon color
  const break_numbers = [1000, 800, 600, 400, 200];
  const break_colors = ['#f16913', '#fd8d3c', '#fdae6b', '#fdd0a2', '#fee6ce'];
  function getColor(density: any) {
    return density > break_numbers[0]
      ? break_colors[0]
      : density > break_numbers[1]
        ? break_colors[1]
        : density > break_numbers[2]
          ? break_colors[2]
          : density > break_numbers[3]
            ? break_colors[3]
            : density > break_numbers[4]
              ? break_colors[4]
              : '#fff5eb';
  }

  // L.geoJSON(props.data, {
  //   onEachFeature: onEachFeature,
  // }).addTo(map);

  // Popup
  // useEffect(() => {
  //   if (props.data[0]) {
  //     const filtered_data = props.data.filter((a: any) => a.properties.name === popupText);
  //     const border = L.geoJSON(filtered_data[0]);
  //     const popup_name = filtered_data[0].properties.name;
  //     const popup_density = filtered_data[0].properties.density;
  //     popup.setLatLng(border.getBounds().getCenter());
  //     const popup_contents = `<b>${popup_name}</b> </br>
  //                             Populatin density: ${popup_density}
  //                             `;
  //     popup.setContent(popup_contents);
  //     popup.openOn(map);
  //   }
  // }, [popupText, popupClicked]);

  // filter geoJson layer
  // make sure to use props.state instead of useState
  // otherwise, it will not be updated properly.
  const filterGeo = (feature: any) => {
    if (props.state === 'All') {
      return props.data;
    } else {
      return props.state.includes(feature.properties.name);
    }
  };

  // Initial state is display all states
  const initialFilterGeo = () => {
    return props.data;
  };

  return (
    <>
      <div
        id={chartID}
        // tailwind
        className="bg-slate-800 border border-slate-500"
        style={{
          position: 'absolute',
          zIndex: '900',
          height: '100%',
          width: '20vw',
          // backgroundColor: '#000',
          color: 'white',
        }}
      ></div>

      <button
        className="bg-slate-800 text-md"
        style={{
          position: 'absolute',
          zIndex: '900',
          height: '5%',
          width: '5%',

          color: 'white',
          bottom: '4%',
          right: '11.5%',
        }}
        onClick={() => setResetClick(resetClick === false ? true : false)}
      >
        Reset
      </button>
      <GeoJSON
        key={JSON.stringify(props.data, usaData, props.state)}
        data={props.data}
        eventHandlers={{
          click: (event: any) => {
            const id = event.layer.feature.properties.name;
            // setPopupText(id);
            // setPopupClicked(popupClicked === false ? true : false); // this ensures popupClicked is changed when clicked
          },
        }}
        filter={props.state === null ? initialFilterGeo : filterGeo}
        style={
          (!props.state && !legendClick && defaultStyle) ||
          (props.state && legendClick && defaultStyle) ||
          (props.state && !legendClick && defaultStyle)
        }
        onEachFeature={onEachFeature}
      />

      {/* Legend */}
      {/* Reference: https://docs.maptiler.com/leaflet/examples/choropleth-geojson/ */}
      <div id="state-legend" className="bg-slate-800">
        <h4>Population Density of USA </h4>
        {break_numbers.map((number: any, index: any) => {
          return (
            <div key={index} onClick={(event) => setLegendClicked(event.currentTarget.innerText)}>
              <span style={{ backgroundColor: break_colors[index] }}></span>
              {number}
            </div>
          );
        })}
      </div>

      <Marker position={[44.0011, -92.92177]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Basic Map">
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Topo Map">
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
    </>
  );
};

export default Layers;
