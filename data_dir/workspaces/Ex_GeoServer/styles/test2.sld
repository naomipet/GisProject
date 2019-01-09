<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="2.18.17" minimumScale="inf" maximumScale="1e+08" hasScaleBasedVisibilityFlag="0">
  <pipe>
    <rasterrenderer opacity="1" alphaBand="0" classificationMax="80" classificationMinMaxOrigin="CumulativeCutFullExtentEstimated" band="1" classificationMin="10" type="singlebandpseudocolor">
      <rasterTransparency/>
      <rastershader>
        <colorrampshader colorRampType="EXACT" clip="0">
          <item alpha="255" value="10" label="A" color="#ffffff"/>
          <item alpha="255" value="20" label="b" color="#ffffff"/>
          <item alpha="255" value="30" label="c" color="#ffffff"/>
          <item alpha="255" value="60" label="d" color="#ffffff"/>
          <item alpha="255" value="80" label="e" color="#ffffff"/>
        </colorrampshader>
      </rastershader>
    </rasterrenderer>
    <brightnesscontrast brightness="-3" contrast="0"/>
    <huesaturation colorizeGreen="128" colorizeOn="0" colorizeRed="255" colorizeBlue="128" grayscaleMode="0" saturation="0" colorizeStrength="100"/>
    <rasterresampler maxOversampling="2" zoomedOutResampler="bilinear"/>
  </pipe>
  <blendMode>0</blendMode>
</qgis>