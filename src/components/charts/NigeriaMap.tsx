import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// TopoJSON URL for Nigeria boundaries (Level 1 - States)
// Reliable TopoJSON link for Nigeria states
const geoUrl = '/geoboundaries.json';

const NigeriaMap = () => {
      const [hoveredState, setHoveredState] = useState('');

      const handleStateClick = (stateName: string) => {
            alert(`You clicked on ${stateName}`);
      };

      return (
            <div
                  style={{
                        width: '100%',
                        height: 'auto',
                        textAlign: 'center',
                        zIndex: '10000',
                  }}
            >
                  <h2>{hoveredState || 'Hover over a state'}</h2>
                  <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                              scale: 4000, // Zoom level for Nigeria
                              center: [8.5, 9.0], // Center coordinates for Nigeria [lon, lat]
                        }}
                        style={{ width: '100%', height: '700px' }}
                  >
                        <Geographies geography={geoUrl}>
                              {({ geographies }) =>
                                    geographies.map((geo) => {
                                          return (
                                                <Geography
                                                      key={geo.rsmKey}
                                                      geography={geo}
                                                      onMouseEnter={() =>
                                                            setHoveredState(
                                                                  geo.properties
                                                                        .shapeName
                                                            )
                                                      }
                                                      onMouseLeave={() =>
                                                            setHoveredState('')
                                                      }
                                                      onClick={() =>
                                                            handleStateClick(
                                                                  geo.properties
                                                                        .shapeName
                                                            )
                                                      }
                                                      style={{
                                                            default: {
                                                                  fill: '#D6D6DA',
                                                                  outline: 'none',
                                                                  stroke: '#FFFFFF',
                                                                  strokeWidth: 0.5,
                                                            },
                                                            hover: {
                                                                  fill: '#008751', // Nigerian green
                                                                  outline: 'none',
                                                                  cursor: 'pointer',
                                                            },
                                                            pressed: {
                                                                  fill: '#005a36',
                                                                  outline: 'none',
                                                            },
                                                      }}
                                                />
                                          );
                                    })
                              }
                        </Geographies>
                  </ComposableMap>
            </div>
      );
};

export default NigeriaMap;
