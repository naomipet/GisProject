(window.webpackJsonp=window.webpackJsonp||[]).push([[158],{377:function(e,a,t){"use strict";t.r(a);var n=t(3),i=t(2),w=t(150),o=t(46),r=t(6),p=t(102),s=1<o.b,c=s?"bmaphidpi":"geolandbasemap",b=s?2:1,l=new n.a({target:"map",view:new i.a({center:[1823849,6143760],zoom:11})});fetch("https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml").then(function(e){return e.text()}).then(function(e){var a=(new w.a).read(e),t=Object(p.b)(a,{layer:c,matrixSet:"google3857",style:"normal"});t.tilePixelRatio=b,l.addLayer(new r.a({source:new p.a(t)}))})}},[[377,0]]]);
//# sourceMappingURL=wmts-hidpi.js.map