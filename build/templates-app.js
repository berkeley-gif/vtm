angular.module('templates-app', ['about/about.citations.tpl.html', 'about/about.overview.tpl.html', 'about/about.publications.tpl.html', 'about/about.tpl.html', 'data/data.mapsheets.tpl.html', 'data/data.overview.tpl.html', 'data/data.photos.tpl.html', 'data/data.plots.tpl.html', 'data/data.tpl.html', 'data/data.vegetation.tpl.html', 'home/home.tpl.html']);

angular.module("about/about.citations.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.citations.tpl.html",
    "<div class=\"row\" id=\"citation\">\n" +
    "	<div class=\"col-sm-12\">\n" +
    "	    <p>If you are using the VTM digital vegetation data downloaded from this site in your study, please cite the following papers in your work:</p>\n" +
    "\n" +
    "	    <p>Kelly, M., B. Allen-Diaz, and N. Kobzina. 2005. <a href=\"http://kellylab.berkeley.edu/publications/2005/9/30/digitization-of-the-wieslander-california-vegetation-type-ma.html\" target=\"_blank\">Digitization of a historic dataset: the Wieslander California vegetation type mapping project.</a> Madro&ntildeo 52(3):191-201.</p>\n" +
    "\n" +
    "	    <p>Kelly, M., K. Ueda and B. Allen-Diaz. 2008. <a href=\"http://kellylab.berkeley.edu/publications/2008/10/31/historic-map-analysis-spatial-error-in-the-ca-vtm-dataset.html\" target=\"_blank\"> Considerations for ecological reconstruction of historic vegetation: Analysis of the spatial uncertainties in the California Vegetation Type Map dataset.</a> Plant Ecology 194 (1): 37-49.</p>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("about/about.overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.overview.tpl.html",
    "<div class=\"row\" id=\"#about\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "        <p>In the 1930s, forester A. E. Wieslander spearheaded a U. S. Forest Service survey of California vegetation, called the Vegetation Type Mapping Project. Originally, the project was slated to include detailed vegetation type maps of 220 USGS quadrangles, but the survey was halted by World War II, and only 23 maps were published. The project continued after the war under state funding, but no more quads were published. However, much of the unpublished data survives today and exists in storage at the University of California, Berkeley, and at other map libraries and research labs around California. The VTM dataset has been recognized as an invaluable window into the state of California flora in the early 20th century, has provided data for several graduate theses at several Universities, and has been the focus of numerous journal articles. However, the dataset's physical fragility has made it largely inaccessible to the broader scientific community. Researchers at U. C. Berkeley Department of Environmental Science, Policy, and Management (ESPM), in conjunction with the Marian Koshland Bioscience and Natural Resources Library, sought funding to digitize all of the published and unpublished dataset, for use in modern geographic information systems and to facilitate its distribution via the Internet.</p>           \n" +
    "\n" +
    "        <p>The ultimate goal of the original VTM project was to create vegetation type maps, but in the process the surveyors collected several other kinds of data as well. In order to validate some of the broad zones of vegetation they designated from high vantage points, the surveyors also ran vegetation transects, collecting data on species composition, depth of leaf litter, and tree size, among other things. They marked the location of these plots on USGS topographic maps, which today provide us with point occurrences of the individual species they found. Addtionally, they collected sample specimens and placed them in the University Herbarium (now the Jepson Herbarium), many of which remain there today. They also took photos of many vegetatively distinct locations, and marked the locations of these photos on maps (unfortunately most of these photos maps have been lost). And finally, of course, they created vegetation maps, drawing broad zones of single or mixed stands in crayon over USGS topographic quads.</p>\n" +
    "\n" +
    "        <p>The VTM collection - vegetation maps, plot data, plot maps, and photographs have been digitized and are being served as a complete collection via the new UC Berkeley <a href=\"http://holos.berkeley.edu/\" target=\"_blank\">HOLOS ecoengine</a>. The digitization of the parts of the collection was a multi-lab effort. The VTM photo digitization was led by the <a href=\"http://www.lib.berkeley.edu/BIOS/\" target=\"_blank\">Marian Koshland Bioscience and Natural Resources Library</a>, and is complete. The <a href=\"http://kellylab.berkeley.edu/\">Kelly Lab</a> in ESPM led the plot map digitization and georeferencing. The <a href=\"http://nature.berkeley.edu/allen-diazlab/\" target=\"_blank\">Allen-Diaz Lab</a> in ESPM led the entering all of the plot data, which the original surveyors recorded by hand, in the field, on thin sheets of paper in faint pencil. Researchers at the <a href=\"http://ice.ucdavis.edu/\" target=\"_blank\">Information Center for the Environment</a> at U. C. Davis led the digitization of all the unpublished vegetation maps.</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("about/about.publications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.publications.tpl.html",
    "\n" +
    "<div class=\"row\" id=\"#about\">\n" +
    "    <div class=\"col-sm-12\">\n" +
    "\n" +
    "                <p>Kelly, M., 2005  VTM Newsletter 2005.  <a href=\"media/docs/VTMnewsletter7-2005.pdf\">PDF</a>.</p>\n" +
    "    \n" +
    "        <p>Kelly, M., B. Allen-Diaz, and N. Kobzina. 2005. <a href=\"http://kellylab.berkeley.edu/publications/2005/9/30/digitization-of-the-wieslander-california-vegetation-type-ma.html\" target=\"_blank\">Digitization of a historic dataset: the Wieslander California vegetation type mapping project.</a> Madro&ntildeo 52(3):191-201.</p>\n" +
    "\n" +
    "        <p>Kelly, M., K. Ueda and B. Allen-Diaz. 2008. <a href=\"http://kellylab.berkeley.edu/publications/2008/10/31/historic-map-analysis-spatial-error-in-the-ca-vtm-dataset.html\" target=\"_blank\"> Considerations for ecological reconstruction of historic vegetation: Analysis of the spatial uncertainties in the California Vegetation Type Map dataset.</a> Plant Ecology 194 (1): 37-49.</p>\n" +
    "\n" +
    "        <p>Ertter, B., 2000. Our undiscovered heritage: Past and future prospects for species-level botanical inventory. Madro&ntildeo , 47(4): 237-252.</p>\n" +
    "\n" +
    "        <p>Allen, B.H., Holzman, C.A. and Evett, R.R., 1991. A classification system for California's hardwood rangelands. Hilgardia, 59(2): 1-45. Allen-Diaz, B.H. and B.A. Holzman., 1991. Blue oak communities in California. Madro&ntildeo , 38: 80-95.</p>\n" +
    "\n" +
    "        <p>Wieslander, A.E., 1961. California's vegetation maps: Recent advances in botany, University of Toronto Press, Toronto.</p>\n" +
    "\n" +
    "        <p>Wieslander, A.E., 1935. A vegetation type map of California. Madro&ntildeo , 3(3): 140-144.</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("about/about.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("about/about.tpl.html",
    "<div class=\"container learn-more\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"page-header\">\n" +
    "                <h3>\n" +
    "                    <span class=\"title\">{{pageTitle | split:'|':0}}</span>\n" +
    "                </h3>\n" +
    "                <h5 class=\"sub-nav-links\">\n" +
    "                    <a href ui-sref=\"about.overview\">History</a> |\n" +
    "                    <a href ui-sref=\"about.publications\">Publications</a> |\n" +
    "                    <a href ui-sref=\"about.citations\">Suggested Citations</a>\n" +
    "                </h5>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div ui-view></div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("data/data.mapsheets.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.mapsheets.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"page-header\">\n" +
    "            <h3><span class=\"title\">Mapsheets</span></h3>\n" +
    "            <h5 class=\"sub-nav-links\">\n" +
    "                <a href ui-sref=\"data.vegetation\">Vegetation</a> |\n" +
    "                <a href ui-sref=\"data.plots\">Plots</a> |\n" +
    "                <a href ui-sref=\"data.photos\">Photos</a> |\n" +
    "                <a href ui-sref=\"data.mapsheets\">Mapsheets</a>\n" +
    "            </h5>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-9\">\n" +
    "        <div id=\"map\" style=\"height: 600px\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "        <h2>Info box</h2>\n" +
    "        <p><div id=\"info-box\">Please click on the map to get more information about the vegetation map.</div></p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Summary</h2>\n" +
    "        <p>Something about this map.</p>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Suggested Citations</h2>\n" +
    "        <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Method</h2>\n" +
    "        <p>How did we create this map?</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("data/data.overview.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.overview.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"page-header\">\n" +
    "            <h3><span class=\"title\">Available Datasets</span></h3>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-xs-12 col-sm-6 col-md-6\">\n" +
    "        <div class=\"thumbnail\">\n" +
    "            <a href ui-sref=\"data.vegetation\">\n" +
    "                <img class=\"img-polaroid img-datasets\" src=\"assets/img/data_vegpolygons.png\" />\n" +
    "                <div class=\"caption\">\n" +
    "                    <h4>Vegetation Polygons</h3>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 col-sm-6 col-md-6\">\n" +
    "        <div class=\"thumbnail\">\n" +
    "            <a href ui-sref=\"data.plots\">\n" +
    "                <img class=\"img-polaroid img-datasets\" src=\"assets/img/data_plots.png\" />\n" +
    "                <div class=\"caption\">\n" +
    "                    <h4>VTM Plots</h3>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 col-sm-6 col-md-6\">\n" +
    "        <div class=\"thumbnail\">\n" +
    "            <a href ui-sref=\"data.photos\">\n" +
    "                <img class=\"img-polaroid img-datasets\" src=\"assets/img/data_photolocations.png\" />\n" +
    "                <div class=\"caption\">\n" +
    "                    <h4>Photo Locations</h3>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"col-xs-12 col-sm-6 col-md-6\">\n" +
    "        <div class=\"thumbnail\">\n" +
    "            <a href ui-sref=\"data.mapsheets\">\n" +
    "                <img class=\"img-polaroid img-datasets\" src=\"assets/img/data_mapsheets.png\" />\n" +
    "                <div class=\"caption\">\n" +
    "                    <h4>Original Mapsheet Images</h3>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("data/data.photos.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.photos.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"page-header\">\n" +
    "            <h3><span class=\"title\">Photos</span></h3>\n" +
    "            <h5 class=\"sub-nav-links\">\n" +
    "                <a href ui-sref=\"data.vegetation\">Vegetation</a> |\n" +
    "                <a href ui-sref=\"data.plots\">Plots</a> |\n" +
    "                <a href ui-sref=\"data.photos\">Photos</a> |\n" +
    "                <a href ui-sref=\"data.mapsheets\">Mapsheets</a>\n" +
    "            </h5>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-9\">\n" +
    "        <div id=\"map\" style=\"height: 600px\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "        <h2>Info box</h2>\n" +
    "        <p><div id=\"info-box\">Please click on the map to get more information about the vegetation map.</div></p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Summary</h2>\n" +
    "        <p>Something about this map.</p>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Suggested Citations</h2>\n" +
    "        <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Method</h2>\n" +
    "        <p>How did we create this map?</p>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("data/data.plots.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.plots.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"page-header\">\n" +
    "        <h3><span class=\"title\">Plots</span></h3>\n" +
    "        <h5 class=\"sub-nav-links\">\n" +
    "            <a href ui-sref=\"data.vegetation\">Vegetation</a> |\n" +
    "            <a href ui-sref=\"data.plots\">Plots</a> |\n" +
    "            <a href ui-sref=\"data.photos\">Photos</a> |\n" +
    "            <a href ui-sref=\"data.mapsheets\">Mapsheets</a>\n" +
    "        </h5>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-9\">\n" +
    "        <leaflet id=\"map\" center=\"center\" layers=\"layers\" geojson=\"geojson\" defaults=\"defaults\" controls=\"controls\" style=\"height: 600px\"></leaflet>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "        <h2>Info box</h2>\n" +
    "        <div class=\"info-box\" ng-hide=\"layerProp\">Additional information about hte vegetation polygons will be displayed here when you click on them on the map.</div>\n" +
    "        <div class=\"info-box\" ng-show=\"layerProp\">\n" +
    "            <p><b>Vegetation name</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.mcv}}\n" +
    "            </p>\n" +
    "            <p><b>Primary species</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.primary_species}}\n" +
    "            </p>\n" +
    "            <p><b>Associated species</b>:\n" +
    "                <span ng-hide=\"layerProp.observations.length\">\n" +
    "                    <br />\n" +
    "                    No associated species found\n" +
    "                </span>\n" +
    "                <span ng-show=\"layerProp.observations.length\">\n" +
    "                    <ul>\n" +
    "                        <li ng-repeat=\"obs in layerProp.observations\">\n" +
    "                            {{obs.scientific_name}}\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </span>\n" +
    "\n" +
    "            </p>\n" +
    "            <p><b>API URL</b>:\n" +
    "                <br/>\n" +
    "                <a ng-href=\"{{layerProp.url}}\" target=\"_blank\">{{layerProp.url}}</a>\n" +
    "            </p>\n" +
    "            <p><b>WHR</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.whr}}\n" +
    "            </p>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-5\">\n" +
    "        <h2>General information</h2>\n" +
    "        <p>What is this map about? When was this map produced (1920s-1940s)? Who produced it? Who digitized it? How was it digitized? How to assess accuracy?</p>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Suggested Citations</h2>\n" +
    "        <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "		<h2>Download</h2>\n" +
    "		<p>Download all plots data in shapefile. </p>\n" +
    "		<p><img src=\"assets/img/vtmveg.png\" width=\"200px\" height=\"200px\" class=\"img-responsive img-thumbnail\"/></p>\n" +
    "		<a href=\"https://dev-ecoengine.berkeley.edu/data/vtm-plots.zip\" class=\"btn btn-primary\">Click here</a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("data/data.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.tpl.html",
    "<div class=\"container\" id=\"data-grid\">\n" +
    "\n" +
    "    <div ui-view></div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("data/data.vegetation.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("data/data.vegetation.tpl.html",
    "<div class=\"row\">\n" +
    "    <div class=\"page-header\">\n" +
    "            <h3><span class=\"title\">Vegetation Type Map</span></h3>\n" +
    "            <h5 class=\"sub-nav-links\">\n" +
    "                <a href ui-sref=\"data.vegetation\">Vegetation</a> |\n" +
    "                <a href ui-sref=\"data.plots\">Plots</a> |\n" +
    "                <a href ui-sref=\"data.photos\">Photos</a> |\n" +
    "                <a href ui-sref=\"data.mapsheets\">Mapsheets</a>\n" +
    "            </h5>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-9\">\n" +
    "        <leaflet id=\"map\" center=\"center\" layers=\"layers\" geojson=\"geojson\" defaults=\"defaults\" controls=\"controls\" style=\"height: 600px\"></leaflet>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "        <h2>Info box</h2>\n" +
    "        <div class=\"info-box\" ng-hide=\"layerProp\">Additional information about hte vegetation polygons will be displayed here when you click on them on the map.</div>\n" +
    "        <div class=\"info-box\" ng-show=\"layerProp\">\n" +
    "            <p><b>Vegetation name</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.mcv}}\n" +
    "            </p>\n" +
    "            <p><b>Primary species</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.primary_species}}\n" +
    "            </p>\n" +
    "            <p><b>Associated species</b>:\n" +
    "                <span ng-hide=\"layerProp.observations.length\">\n" +
    "                    <br />\n" +
    "                    No associated species found\n" +
    "                </span>\n" +
    "                <span ng-show=\"layerProp.observations.length\">\n" +
    "                    <ul>\n" +
    "                        <li ng-repeat=\"obs in layerProp.observations\">\n" +
    "                            {{obs.scientific_name}}\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </span>\n" +
    "\n" +
    "            </p>\n" +
    "            <p><b>API URL</b>:\n" +
    "                <br/>\n" +
    "                <a ng-href=\"{{layerProp.url}}\" target=\"_blank\">{{layerProp.url}}</a>\n" +
    "            </p>\n" +
    "            <p><b>WHR</b>:\n" +
    "                <br/>\n" +
    "                {{layerProp.whr}}\n" +
    "            </p>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"row\">\n" +
    "    <div class=\"col-md-5\">\n" +
    "        <h2>General information</h2>\n" +
    "        <p>What is this map about? When was this map produced (1920s-1940s)? Who produced it? Who digitized it? How was it digitized? How to assess accuracy?</p>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-4\">\n" +
    "        <h2>Suggested Citations</h2>\n" +
    "        <ng-include src=\"'about/about.citations.tpl.html'\"></ng-inlcude>\n" +
    "    </div>\n" +
    "    <div class=\"col-md-3\">\n" +
    "		<h2>Download</h2>\n" +
    "		<p>Download the entire vegetation layer in shapefile (~1.3G). </p>\n" +
    "		<p><img src=\"assets/img/vtmveg.png\" width=\"200px\" height=\"200px\" class=\"img-responsive img-thumbnail\"/></p>\n" +
    "		<a href=\"https://dev-ecoengine.berkeley.edu/data/Wieslander_Statewide_CANAD83.zip\" class=\"btn btn-primary\">Click here</a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);

angular.module("home/home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home/home.tpl.html",
    "<div class=\"container\">\n" +
    "\n" +
    "    <div class=\"banner\">\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-12\">\n" +
    "\n" +
    "            <div class=\"vtm-carousel\">\n" +
    "              <div ng-controller=\"AboutCtrl\">\n" +
    "                <div>\n" +
    "                  <carousel interval=\"myInterval\">\n" +
    "                    <slide ng-repeat=\"slide in slides\" active=\"slide.active\">\n" +
    "                      <img class=\"img-responsive\" ng-src=\"{{slide.image}}\" style=\"margin:auto;height:40em;\">\n" +
    "                    </slide>\n" +
    "                  </carousel>\n" +
    "                </div>\n" +
    "              </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"row\">\n" +
    "                <div class=\"col-sm-2 col-sm-offset-1\" id=\"portrait\">\n" +
    "                    <img  src=\"assets/img/Wieslander_Portrait.png\"></img>\n" +
    "                </div>\n" +
    "                <div class=\"col-sm-8 col-sm-offset-3\" id=\"slogan\">\n" +
    "                    <h3><span class=\"title\"><span class=\"title-first-letter\">W</span>ieslander <span class=\"title-first-letter\">V</span>egetation <span class=\"title-first-letter\">T</span>ype <span class=\"title-first-letter\">M</span>apping</span></h3>\n" +
    "                    <h4>This project is a collection of datasets that provides a snapshot of California's vegetation in the early 20th century.</h4>\n" +
    "                </div>\n" +
    "            </div> <!-- end second level row -->\n" +
    "\n" +
    "        </div> <!-- end col-md-12 -->\n" +
    "\n" +
    "\n" +
    "    </div> <!-- end first level row -->\n" +
    "    \n" +
    "\n" +
    "</div> <!-- end banner -->\n" +
    "\n" +
    "    <div class=\"row\">\n" +
    "        <div class=\"col-md-4 section\">\n" +
    "            <a href ui-sref=\"data.overview\" class=\"section-link\">\n" +
    "                <div class=\"overlay\">\n" +
    "                    <div class=\"overlay-content\">\n" +
    "                        <i class=\"fa fa-search-plus fa-3x\"></i>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"section-content\">\n" +
    "                    <h4><span class=\"title\">Data Access</span></h4>\n" +
    "                    <p>View and download vegetation maps, plot data and photos. </p>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-4 section\">\n" +
    "            <a href ui-sref=\"about.overview\" class=\"section-link\">\n" +
    "                <div class=\"overlay\">\n" +
    "                    <div class=\"overlay-content\">\n" +
    "                        <i class=\"fa fa-search-plus fa-3x\"></i>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"section-content\">\n" +
    "                    <h4><span class=\"title\">Learn More</span></h4>\n" +
    "                    <p>Learn more about the Wieslander's Vegetation Type Mapping project. </p>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"col-md-4 section\">\n" +
    "            <a href class=\"section-link\">\n" +
    "                <div class=\"overlay\">\n" +
    "                    <div class=\"overlay-content\">\n" +
    "                        <i class=\"fa fa-search-plus fa-3x\"></i>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"section-content\">\n" +
    "                  <h4><span class=\"title\">Explore</span></h4>\n" +
    "                  <p>Explore the VTM photo collection using the Historic Photo Hunt app.</p>\n" +
    "                </div>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "");
}]);
