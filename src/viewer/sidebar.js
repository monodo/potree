
var createToolIcon = function(icon, title, callback){
	var elImg = document.createElement("img");
	elImg.src = icon;
	elImg.onclick = callback;
	elImg.style.width = "32px";
	elImg.style.height = "32px";
	elImg.classList.add("button-icon");
	elImg.setAttribute("data-i18n", title);
	return elImg;
};

function initToolbar(){
	var elToolbar = document.getElementById("tools");
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/angle.png",
		"[title]tt.angle_measurement",
		function(){viewer.measuringTool.startInsertion({showDistances: false, showAngles: true, showArea: false, closed: true, maxMarkers: 3})}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/point.svg",
		"[title]tt.angle_measurement",
		function(){viewer.measuringTool.startInsertion({showDistances: false, showAngles: false, showCoordinates: true, showArea: false, closed: true, maxMarkers: 1})}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/distance.svg",
		"[title]tt.distance_measurement",
		function(){viewer.measuringTool.startInsertion({showDistances: true, showArea: false, closed: false})}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/area.svg",
		"[title]tt.area_measurement",
		function(){viewer.measuringTool.startInsertion({showDistances: true, showArea: true, closed: true})}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/volume.svg",
		"[title]tt.volume_measurement",
		function(){viewer.volumeTool.startInsertion()}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/profile.svg",
		"[title]tt.height_profile",
		function(){viewer.profileTool.startInsertion()}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/clip_volume.svg",
		"[title]tt.clip_volume",
		function(){viewer.volumeTool.startInsertion({clip: true})}
	));
	
	elToolbar.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/reset_tools.svg",
		"[title]tt.remove_all_measurement",
		function(){
			viewer.measuringTool.reset();
			viewer.profileTool.reset();
			viewer.volumeTool.reset();
		}
	));
}

function initMaterials(){
	
	$( "#optMaterial" ).selectmenu({
		style:'popup',
		position: { 
			my: "top", 
			at: "bottom", 
			collision: "flip" }	
	});
		
	$( "#sldHeightRange" ).slider({
		range: true,
		min:	0,
		max:	1000,
		values: [0, 1000],
		step: 	0.01,
		slide: function( event, ui ) {
			var local = {
				min: viewer.toLocal(new THREE.Vector3(0, 0, ui.values[0])).y,
				max: viewer.toLocal(new THREE.Vector3(0, 0, ui.values[1])).y,
			};
			viewer.setHeightRange(local.min, local.max);
		}
	});

	var updateHeightRange = function(){
		var box = viewer.getBoundingBox();
		var geoMin = viewer.toGeo(box.min).z;
		var geoMax = viewer.toGeo(box.max).z;
		
		var hr = viewer.getHeightRange();
		var hrGeo = {
			min: viewer.toGeo(new THREE.Vector3(0, hr.min, 0)).z,
			max: viewer.toGeo(new THREE.Vector3(0, hr.max, 0)).z,
		};
		
		var vMin = hr.min ? hrGeo.min : geoMin;
		var vMax = hr.max ? hrGeo.max : geoMax;
		
		$( '#lblHeightRange')[0].innerHTML = hrGeo.min.toFixed(2) + " to " + hrGeo.max.toFixed(2);
		$( "#sldHeightRange" ).slider({
			min: geoMin,
			max: geoMax,
			values: [vMin, vMax]
		});
	};
	
	viewer.addEventListener("height_range_changed", function(event){
		updateHeightRange();
		var hr = viewer.getHeightRange();
		var hrGeo = {
			min: viewer.toGeo(new THREE.Vector3(0, hr.min, 0)).z,
			max: viewer.toGeo(new THREE.Vector3(0, hr.max, 0)).z,
		};
		
		$( '#lblHeightRange')[0].innerHTML = hrGeo.min.toFixed(2) + " to " + hrGeo.max.toFixed(2);
		$( "#sldHeightRange" ).slider({values: [hrGeo.min, hrGeo.max]});
	});
	
	viewer.addEventListener("pointcloud_loaded", updateHeightRange);
	
	updateHeightRange();
	
	//var hr = viewer.getHeightRange();
	//$('#lblHeightRange')[0].innerHTML = hr.min.toFixed(2) + " to " + hr.max.toFixed(2);

	var options = [ 
		"RGB", 
		"Color", 
		"Elevation", 
		"Intensity", 
		"Intensity Gradient", 
		"Classification", 
		"Return Number", 
		"Source", 
		"Phong",
		"Level of Detail"	
	];
	
	var elMaterialList = document.getElementById("optMaterial");
	for(var i = 0; i < options.length; i++){
		var option = options[i];
		
		var elOption = document.createElement("option");
		elOption.innerHTML = option;
		elOption.id = "optMaterial_" + option;
		
		elMaterialList.appendChild(elOption);
	}
	
	$("#optMaterial").val(viewer.getMaterialName()).selectmenu("refresh")
	$("#optMaterial").selectmenu({
		change: function(event, ui){
			viewer.setMaterial(ui.item.value);
		}
	});
}

function initClassificationList(){
	var addClassificationItem = function(code, name){
		var elClassificationList = document.getElementById("classificationList");
		
		var elLi = document.createElement("li");
		var elLabel = document.createElement("label");
		var elInput = document.createElement("input");
		var elText = document.createTextNode(" " + name);
		
		elInput.id = "chkClassification_" + code;
		elInput.type = "checkbox";
		elInput.checked = true;
		elInput.onclick = function(event){
			viewer.setClassificationVisibility(code, event.target.checked);
		}
		
		elLabel.style.whiteSpace = "nowrap";
		
		elClassificationList.appendChild(elLi);
		elLi.appendChild(elLabel);
		elLabel.appendChild(elInput);
		elLabel.appendChild(elText);
	};
	
	addClassificationItem(0, "never classified");
	addClassificationItem(1, "unclassified");
	addClassificationItem(2, "ground");
	addClassificationItem(3, "low vegetation");
	addClassificationItem(4, "medium vegetation");
	addClassificationItem(5, "high vegetation");
	addClassificationItem(6, "building");
	addClassificationItem(7, "low point(noise)");
	addClassificationItem(8, "key-point");
	addClassificationItem(9, "water");
	addClassificationItem(12, "overlap");
}

function initAccordion(){
	$('#accordion').accordion({
		autoHeight: true,
		heightStyle: "content",
        collapsible:true,
        beforeActivate: function(event, ui) {
             // The accordion believes a panel is being opened
            if (ui.newHeader[0]) {
                var currHeader  = ui.newHeader;
                var currContent = currHeader.next('.ui-accordion-content');
             // The accordion believes a panel is being closed
            } else {
                var currHeader  = ui.oldHeader;
                var currContent = currHeader.next('.ui-accordion-content');
            }
             // Since we've changed the default behavior, this detects the actual status
            var isPanelSelected = currHeader.attr('aria-selected') == 'true';
            
             // Toggle the panel's header
            currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
            
            // Toggle the panel's icon
            currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
            
             // Toggle the panel's content
            currContent.toggleClass('accordion-content-active',!isPanelSelected)    
            if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }

            return false; // Cancels the default action
        }
    });
    
    // Activate tools tab by default
    $("#accordion").accordion({ active: 2});
}

function initAppearance(){

	$( "#optPointSizing" ).selectmenu();
	$( "#optQuality" ).selectmenu();
	
	$("#optPointSizing").val(viewer.getPointSizing()).selectmenu("refresh")
	$("#optPointSizing").selectmenu({
		change: function(event, ui){
			viewer.setPointSizing(ui.item.value);
		}
	});
	
	$("#optQuality").val(viewer.getQuality()).selectmenu("refresh")
	$("#optQuality").selectmenu({
		change: function(event, ui){
			viewer.setQuality(ui.item.value);
		}
	});


	$( "#sldPointBudget" ).slider({
		value: viewer.getPointBudget(),
		min: 100*1000,
		max: 5*1000*1000,
		step: 1000,
		slide: function( event, ui ) {viewer.setPointBudget(ui.value);}
	});
	
	$( "#sldPointSize" ).slider({
		value: viewer.getPointSize(),
		min: 0,
		max: 3,
		step: 0.01,
		slide: function( event, ui ) {viewer.setPointSize(ui.value);}
	});
	
	$( "#sldFOV" ).slider({
		value: viewer.getFOV(),
		min: 20,
		max: 100,
		step: 1,
		slide: function( event, ui ) {viewer.setFOV(ui.value);}
	});
	
	$( "#sldOpacity" ).slider({
		value: viewer.getOpacity(),
		min: 0,
		max: 1,
		step: 0.01,
		slide: function( event, ui ) {viewer.setOpacity(ui.value);}
	});
	
	$( "#sldEDLRadius" ).slider({
		value: viewer.getEDLRadius(),
		min: 1,
		max: 4,
		step: 0.01,
		slide: function( event, ui ) {viewer.setEDLRadius(ui.value);}
	});
	
	$( "#sldEDLStrength" ).slider({
		value: viewer.getEDLStrength(),
		min: 0,
		max: 5,
		step: 0.01,
		slide: function( event, ui ) {viewer.setEDLStrength(ui.value);}
	});
	
	viewer.addEventListener("point_budget_changed", function(event){
		$( '#lblPointBudget')[0].innerHTML = Potree.utils.addCommas(viewer.getPointBudget());
		$( "#sldPointBudget" ).slider({value: viewer.getPointBudget()});
	});
	
	viewer.addEventListener("point_size_changed", function(event){
		$('#lblPointSize')[0].innerHTML = viewer.getPointSize().toFixed(2);
		$( "#sldPointSize" ).slider({value: viewer.getPointSize()});
	});
	
	viewer.addEventListener("fov_changed", function(event){
		$('#lblFOV')[0].innerHTML = parseInt(viewer.getFOV());
		$( "#sldFOV" ).slider({value: viewer.getFOV()});
	});
	
	viewer.addEventListener("opacity_changed", function(event){
		$('#lblOpacity')[0].innerHTML = viewer.getOpacity().toFixed(2);
		$( "#sldOpacity" ).slider({value: viewer.getOpacity()});
	});
	
	viewer.addEventListener("edl_radius_changed", function(event){
		$('#lblEDLRadius')[0].innerHTML = viewer.getEDLRadius().toFixed(1);
		$( "#sldEDLRadius" ).slider({value: viewer.getEDLRadius()});
	});
	
	viewer.addEventListener("edl_strength_changed", function(event){
		$('#lblEDLStrength')[0].innerHTML = viewer.getEDLStrength().toFixed(1);
		$( "#sldEDLStrength" ).slider({value: viewer.getEDLStrength()});
	});
	
	
	$('#lblPointBudget')[0].innerHTML = Potree.utils.addCommas(viewer.getPointBudget());
	$('#lblPointSize')[0].innerHTML = viewer.getPointSize().toFixed(2);
	$('#lblFOV')[0].innerHTML = parseInt(viewer.getFOV());
	$('#lblOpacity')[0].innerHTML = viewer.getOpacity().toFixed(2);
	$('#lblEDLRadius')[0].innerHTML = viewer.getEDLRadius().toFixed(1);
	$('#lblEDLStrength')[0].innerHTML = viewer.getEDLStrength().toFixed(1);
}
	
	
function initNavigation(){

	var elNavigation = document.getElementById("navigation");
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/earth_controls_1.png",
        "[title]tt.earth_control",
		function(){viewer.useEarthControls()}
	));
	
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/fps_controls.png",
        "[title]tt.flight_control",
		function(){viewer.useFPSControls()}
	));
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/orbit_controls.svg",
		"[title]tt.orbit_control",
		function(){viewer.useOrbitControls()}
	));
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/focus.svg",
		"[title]tt.focus_control",
		function(){viewer.fitToScreen()}
	));
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/topview.svg",
		"[title]tt.top_view_control",
		function(){viewer.setTopView()}
	));
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/frontview.svg",
		"[title]tt.front_view_control",
		function(){viewer.setFrontView()}
	));
	
	elNavigation.appendChild(createToolIcon(
		Potree.resourcePath + "/icons/leftview.svg",
		"[title]tt.left_view_control",
		function(){viewer.setLeftView()}
	));
	
	var speedRange = new THREE.Vector2(1, 10*1000);
	
	var toLinearSpeed = function(value){
		return Math.pow(value, 4) * speedRange.y + speedRange.x;
	};
	
	var toExpSpeed = function(value){
		return Math.pow((value - speedRange.x) / speedRange.y, 1 / 4);
	};

	$( "#sldMoveSpeed" ).slider({
		value: toExpSpeed( viewer.getMoveSpeed() ),
		min: 0,
		max: 1,
		step: 0.01,
		slide: function( event, ui ) { viewer.setMoveSpeed(toLinearSpeed(ui.value)); }
	});
	
	viewer.addEventListener("move_speed_changed", function(event){
		$('#lblMoveSpeed')[0].innerHTML = viewer.getMoveSpeed().toFixed(1);
		$( "#sldMoveSpeed" ).slider({value: toExpSpeed(viewer.getMoveSpeed())});
	});
	
	$('#lblMoveSpeed')[0].innerHTML = viewer.getMoveSpeed().toFixed(1);
}

function initMeasurementDetails(){
	
	var id = 0;
	
	var callback = function(event){
	
		id++;
	
		var measurement = event.measurement;
		var profile = event.profile;
		var volume = event.volume;
	
		var elLi = document.createElement("li");
		var elPanel = document.createElement("div");
		var elPanelHeader = document.createElement("div");
		var elPanelBody = document.createElement("div");
		var elPanelIcon = document.createElement("img");
		var elPanelStretch = document.createElement("span");
		var elPanelRemove = document.createElement("img");
		
		elPanel.classList.add("potree-panel", "panel-default");
		elPanelHeader.classList.add("potree-panel-heading", "pv-panel-heading");
		
		if(measurement){
			if(measurement.showDistances && !measurement.showArea && !measurement.showAngles){
				elPanelIcon.src = Potree.resourcePath + "/icons/distance.svg";
				elPanelStretch.innerHTML = "Distance";
			}else if(measurement.showDistances && measurement.showArea && !measurement.showAngles){
				elPanelIcon.src = Potree.resourcePath + "/icons/area.svg";
				elPanelStretch.innerHTML = "Area";
			}else if(measurement.maxMarkers === 1){
				elPanelIcon.src = Potree.resourcePath + "/icons/point.svg";
				elPanelStretch.innerHTML = "Coordinate";
			}else if(!measurement.showDistances && !measurement.showArea && measurement.showAngles){
				elPanelIcon.src = Potree.resourcePath + "/icons/angle.png";
				elPanelStretch.innerHTML = "Angle";
			}
			
			elPanelRemove.onclick = function(){viewer.measuringTool.removeMeasurement(measurement);};
		}else if(profile){
			elPanelIcon.src = Potree.resourcePath + "/icons/profile.svg";
			elPanelRemove.onclick = function(){viewer.profileTool.removeProfile(profile);};
			
			elPanelStretch.innerHTML = "Profile";
		}else if(volume){
			elPanelIcon.src = Potree.resourcePath + "/icons/volume.svg";
			elPanelRemove.onclick = function(){viewer.measuringTool.removeVolume(volume);};
			
			elPanelStretch.innerHTML = "Volume";
		}
		
		elPanelIcon.style.width = "16px";
		elPanelIcon.style.height = "16px";
		elPanelStretch.style.flexGrow = 1;
		elPanelStretch.style.textAlign = "center";
		elPanelRemove.src = Potree.resourcePath + "/icons/remove.svg";
		elPanelRemove.style.width = "16px";
		elPanelRemove.style.height = "16px";
		elPanelBody.classList.add("panel-body");
		
		elLi.appendChild(elPanel);
		elPanel.appendChild(elPanelHeader);
		elPanelHeader.appendChild(elPanelIcon);
		elPanelHeader.appendChild(elPanelStretch);
		elPanelHeader.appendChild(elPanelRemove);
		elPanel.appendChild(elPanelBody);
		
		document.getElementById("measurement_details").appendChild(elLi);
		
		var widthListener;
		var updateDisplay = function(event){
		
			if(profile){
				if(widthListener){
					profile.removeEventListener("width_changed", widthListener);
				}
			}

			$(elPanelBody).empty();
			
			if(profile){
				//<li>Point Budget: <span id="lblPointBudget"></span> <div id="sldPointBudget"></div>	</li>
				
				var elLi = $('<li style="margin-bottom: 5px">');
				var elText = document.createTextNode("width: ");
				var elWidthLabel = $('<span id="lblProfileWidth_' + id + '">');
				var elWidthSlider = $('<div id="sldProfileWidth_' + id + '">');
				
				elWidthSlider.slider({
					value: Math.pow((profile.getWidth() / 1000), 1/4).toFixed(3),
					min: 0,
					max: 1,
					step: 0.01,
					slide: function(event, ui){
						var val = Math.pow(ui.value, 4) * 1000;
						profile.setWidth(val);
					}
				});
				if(profile.getWidth()){
					elWidthLabel.html(Potree.utils.addCommas(profile.getWidth().toFixed(3)));
				}else{
					elWidthLabel.html("-");
				}
				
				widthListener = function(event){
					var val = Math.pow((event.width / 1000), 1/4);
					elWidthLabel.html(Potree.utils.addCommas(event.width.toFixed(3)));
					elWidthSlider.slider({value: val});
				};
				profile.addEventListener("width_changed", widthListener);
				
				elLi.append(elText);
				elLi.append(elWidthLabel);
				elLi.append(elWidthSlider);
				
				elPanelBody.appendChild(elLi[0]);
			}
			
			var positions = [];
			var points;
			if(measurement){
				points = measurement.points;
				for(var i = 0; i < points.length; i++){
					positions.push(points[i].position);
				}
			}else if(profile){
				positions = profile.points;
			}else if(volume){
				positions = [volume.getWorldPosition()];
			}
			
			for(var i = 0; i < positions.length; i++){
				var point = positions[i];
				var geoCoord = viewer.toGeo(point);
	
				var txt = geoCoord.x.toFixed(2) + ", ";
				txt += geoCoord.y.toFixed(2) + ", ";
				txt += geoCoord.z.toFixed(2);
				
				var elNodeMarker = $('<div>').addClass("measurement-detail-node-marker");
				elNodeMarker.html(txt);
				
				$(elPanelBody).append(elNodeMarker);
				
				if(i < positions.length - 1){
					if(measurement && measurement.showDistances){
						
						var elEdge = $('<div>').addClass("measurement-detail-edge");
						$(elPanelBody).append(elEdge);
						
						var nextPoint = positions[i+1];
						var nextGeo = viewer.toGeo(nextPoint);
						var distance = nextGeo.distanceTo(geoCoord);
						var txt = Potree.utils.addCommas(distance.toFixed(2));
						
						var elNodeDistance = $('<div>').addClass("measurement-detail-node-distance");
						elNodeDistance.html(txt);
						
						$(elPanelBody).append(elNodeDistance);
						
						//var elEdge = $('<div>').addClass("measurement-detail-edge");
						//$(elPanelBody).append(elEdge);
					}
				}
				
				if(measurement && measurement.showAngles){
					var elEdge = $('<div>').addClass("measurement-detail-edge");
					$(elPanelBody).append(elEdge);
					
					var angle = measurement.getAngle(i);
					var txt = Potree.utils.addCommas((angle*(180.0/Math.PI)).toFixed(1)) + '\u00B0';
					var elNodeAngle = $('<div>').addClass("measurement-detail-node-angle");
					elNodeAngle.html(txt);
					$(elPanelBody).append(elNodeAngle);

				}
				
				if(i < positions.length - 1){
					var elEdge = $('<div>').addClass("measurement-detail-edge");
					$(elPanelBody).append(elEdge);
				}
			}

			if(points && points.length === 1){
				var point = points[0];
				
				var elTable = $('<table>').css("width", "100%");
				$(elPanelBody).append(elTable);
				
				if(point.color){
					var color = point.color;
					
					var elTr = $('<tr>');
					var elKey = $('<td>').css("padding", "1px 5px");
					var elValue = $('<td>').css("width", "100%").css("padding", "1px 5px");
					
					var value = parseInt(color[0] * 255) 
						+ ", " + parseInt(color[1] * 255) 
						+ ", " + parseInt(color[2] * 255);
					
					elKey.html("rgb");
					elValue.html(value);
					
					elTable.append(elTr);
					elTr.append(elKey);
					elTr.append(elValue);
				}
				
				if(typeof point.intensity !== "undefined"){
					var intensity = point.intensity;
					
					var elTr = $('<tr>');
					var elKey = $('<td>').css("padding", "1px 5px");
					var elValue = $('<td>').css("width", "100%").css("padding", "1px 5px");
					
					elKey.html("intensity");
					elValue.html(intensity);
					
					elTable.append(elTr);
					elTr.append(elKey);
					elTr.append(elValue);
				}
				
				if(typeof point.classification !== "undefined"){
					var classification = point.classification;
					
					var elTr = $('<tr>');
					var elKey = $('<td>').css("padding", "1px 5px");
					var elValue = $('<td>').css("width", "100%").css("padding", "1px 5px");
					
					elKey.html("classification");
					elValue.html(classification);
					
					elTable.append(elTr);
					elTr.append(elKey);
					elTr.append(elValue);
				}
				
				if(typeof point.returnNumber !== "undefined"){
					var returnNumber = point.returnNumber;
					
					var elTr = $('<tr>');
					var elKey = $('<td>').css("padding", "1px 5px");
					var elValue = $('<td>').css("width", "100%").css("padding", "1px 5px");
					
					elKey.html("return nr.");
					elValue.html(returnNumber);
					
					elTable.append(elTr);
					elTr.append(elKey);
					elTr.append(elValue);
				}
				
				if(typeof point.pointSourceID !== "undefined"){
					var source = point.pointSourceID;
					
					var elTr = $('<tr>');
					var elKey = $('<td>').css("padding", "1px 5px");
					var elValue = $('<td>').css("width", "100%").css("padding", "1px 5px");
					
					elKey.html("source");
					elValue.html(source);
					
					elTable.append(elTr);
					elTr.append(elKey);
					elTr.append(elValue);
				}
				
				
			}
			
			if(measurement && measurement.showArea){
				var txt = Potree.utils.addCommas(measurement.getArea().toFixed(1)) + "²";
				
				var elNodeArea = $('<div>').addClass("measurement-detail-node-area");
				elNodeArea.html(txt);
				
				$(elPanelBody).append(elNodeArea);
			}

			if(profile){
				// show 2d profile button
				var elOpenProfileWindow = $('<input type="button" value="show 2d profile">')
					.addClass("measurement-detail-button");
				elOpenProfileWindow[0].onclick = function(){
					viewer._2dprofile.show();
					viewer._2dprofile.draw(profile);
				};
				$(elPanelBody).append(elOpenProfileWindow);
			}
			
		};

		updateDisplay();

		if(measurement){
			viewer.measuringTool.addEventListener("marker_added", updateDisplay);
			viewer.measuringTool.addEventListener("marker_removed", updateDisplay);
			viewer.measuringTool.addEventListener("marker_moved", updateDisplay);
			viewer.measuringTool.addEventListener("measurement_removed", function(event){
				if(event.measurement === measurement){
					viewer.measuringTool.removeEventListener("marker_added", updateDisplay);
					viewer.measuringTool.removeEventListener("marker_removed", updateDisplay);
					viewer.measuringTool.removeEventListener("marker_moved", updateDisplay);
					$(elLi).remove();
				}
			});
		}else if(profile){
			viewer.profileTool.addEventListener("marker_added", function(){
                viewer._2dprofile.show();
                viewer._2dprofile.draw(profile);
                updateDisplay();
            });
			viewer.profileTool.addEventListener("marker_removed", updateDisplay);
			viewer.profileTool.addEventListener("marker_moved", updateDisplay);
			viewer.profileTool.addEventListener("profile_removed", function(event){
				if(event.profile === profile){
					viewer.profileTool.removeEventListener("marker_added", updateDisplay);
					viewer.profileTool.removeEventListener("marker_removed", updateDisplay);
					viewer.profileTool.removeEventListener("marker_moved", updateDisplay);
					$(elLi).remove();
				}
			});
		}
	};
	
	for(var i = 0; i < viewer.measuringTool.measurements.length; i++){
		callback({measurement: viewer.measuringTool.measurements[i]});
	}
	
	for(var i = 0; i < viewer.profileTool.profiles.length; i++){
		callback({profile: viewer.profileTool.profiles[i]});
	}

	viewer.measuringTool.addEventListener("measurement_added", callback);
	viewer.profileTool.addEventListener("profile_added", callback);
	viewer.volumeTool.addEventListener("volume_added", callback);
};

function initSceneList(){

	var scenelist = $('#sceneList');
	
	var id = 0;
	// this works but it looks so wrong. any better way to create a closure around pointcloud?
	var addPointcloud = function(pointcloud){
		(function(pointcloud){
			var elLi = $('<li>');
			var elLabel = $('<label>');
			var elInput = $('<input type="checkbox">');
			if (id==0){
                elInput[0].checked = true;
            } else {
                pointcloud.visible = false;
            }
			elInput[0].id = "scene_list_item_pointcloud_" + id;
			elLabel[0].id = "scene_list_item_label_pointcloud_" + id;
			elLabel[0].htmlFor = "scene_list_item_pointcloud_" + id;
			elLabel.addClass("menu-item");
			elInput.click(function(event){
				pointcloud.visible = event.target.checked;
				if(viewer._2dprofile){
					viewer._2dprofile.redraw();
				}
			});
			
			elLi.append(elLabel);
			elLabel.append(elInput);
			var pointcloudName = " " + (pointcloud.name ? pointcloud.name : "point cloud " + id);
			var elPointCloudName = document.createTextNode(pointcloudName);
			elLabel.append(elPointCloudName);
			
			scenelist.append(elLi);
			
			pointcloud.addEventListener("name_changed", function(e){
				if(e.name){
					elPointCloudName.textContent = " " + e.name;
				}else{
					elPointCloudName.textContent = " point cloud " + id;
				}
			});
			
			id++;
		})(pointcloud);
	};
	
	for(var i = 0; i < viewer.pointclouds.length; i++){
		var pointcloud = viewer.pointclouds[i];
		addPointcloud(pointcloud);
	}
	
	viewer.addEventListener("pointcloud_loaded", function(event){
		addPointcloud(event.pointcloud);
	});
};

initSettings = function(){
	
	$( "#sldMinNodeSize" ).slider({
		value: viewer.getMinNodeSize(),
		min: 0,
		max: 1000,
		step: 0.01,
		slide: function( event, ui ) {viewer.setMinNodeSize(ui.value);}
	});
	
	viewer.addEventListener("minnodesize_changed", function(event){
		$('#lblMinNodeSize')[0].innerHTML = parseInt(viewer.getMinNodeSize());
		$( "#lblMinNodeSize" ).slider({value: viewer.getMinNodeSize()});
	});
	
	
	var toClipModeCode = function(string){
		if(string === "No Clipping"){
			return Potree.ClipMode.DISABLED;
		}else if(string === "Highlight Inside"){
			return Potree.ClipMode.HIGHLIGHT_INSIDE;
		}else if(string === "Clip Outside"){
			return Potree.ClipMode.CLIP_OUTSIDE;
		}
	};
	
	var toClipModeString = function(code){
		if(code === Potree.ClipMode.DISABLED){
			return "No Clipping";
		}else if(code === Potree.ClipMode.HIGHLIGHT_INSIDE){
			return "Highlight Inside";
		}else if(code === Potree.ClipMode.CLIP_OUTSIDE){
			return "Clip Outside";
		}
	};

	$("#optClipMode").selectmenu();
	$("#optClipMode").val(toClipModeString(viewer.getClipMode())).selectmenu("refresh")
	$("#optClipMode").selectmenu({
		change: function(event, ui){
			viewer.setClipMode(toClipModeCode(ui.item.value));
		}
	});
};


$(document).ready( function() {

	initAccordion();
	initAppearance();
	initToolbar();
	initNavigation();
	initMaterials();
	initClassificationList();
	initMeasurementDetails();
	initSceneList();
	initSettings()

	$('#potree_version_number').html(Potree.version.major + "." + Potree.version.minor + Potree.version.suffix);

});
