<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>glc30</Name>
    <UserStyle>
      <Name>glc30</Name>
      <Title>GLC30</Title>
      <Abstract>style for GlobeLand30 (GLC30) land cover map</Abstract>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <ColorMap>
              <ColorMapEntry color="#ffffff" opacity="0.0" quantity="0" label="No data" /> 
              <ColorMapEntry color="#f9f3c1" opacity="1.0" quantity="10" label="Cultivated land" /> 
	      <ColorMapEntry color="#147749" opacity="1.0" quantity="20" label="Forest" /> 
	      <ColorMapEntry color="#a9d05f" opacity="1.0" quantity="30" label="Grassland" /> 
	      <ColorMapEntry color="#3eb370" opacity="1.0" quantity="40" label="Shrubland" />
	      <ColorMapEntry color="#7ecef4" opacity="1.0" quantity="50" label="Wetland" />
	      <ColorMapEntry color="#00449a" opacity="1.0" quantity="60" label="Water body" />
	      <ColorMapEntry color="#646432" opacity="1.0" quantity="70" label="Tundra" /> 
	      <ColorMapEntry color="#932f14" opacity="1.0" quantity="80" label="Artificial surface" />
	      <ColorMapEntry color="#cacaca" opacity="1.0" quantity="90" label="Bare land" /> 
	      <ColorMapEntry color="#d3edfb" opacity="1.0" quantity="100" label="Permanent snow and ice" />
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>

