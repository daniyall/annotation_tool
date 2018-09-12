class AnnotationTool {
	constructor(rootElement, fields) {
		this.rootElement = rootElement;

		var self = this;

		this.fields = [
			{ 
				name: "Start", 
				type: "text", readOnly: true, 
				insertTemplate: function() {
        			var input = this.__proto__.insertTemplate.call(this);
          			input.val(self.wavesurfer.getCurrentTime())
					return input;
				}
			},
			{ 
				name: "End", 
				type: "text", 
				readOnly: true,
				insertTemplate: function() {
        			var input = this.__proto__.insertTemplate.call(this);
          			input.val(self.wavesurfer.getCurrentTime() + 1)
					return input;
				}
			},
		];

		for (var i = 0; i < fields.length; i++) {
			this.fields.push(fields[i]);
		}

		this.annotations = []

		this.root_div = document.getElementById(this.rootElement)

		this.init_wavesurfer()
	}

	init_wavesurfer() {
		this.waveform_id = "waveform"
		this.controls_id = this.waveform_id + "-controls"

		this.waveform_div = document.createElement('div');
		this.waveform_div.className = "waveform"
		this.waveform_div.id = this.waveform_id;

		this.controls_div = document.createElement('div');
		this.controls_div.id = this.controls_id;
		this.controls_div.className = "controls"

		this.play_button = document.createElement("button");
		var self = this
		this.play_button.addEventListener("click", function() {handle_playpause(self)})
		this.play_button.className = "play_button"
		this.play_button.innerHTML = "Play"
		
		this.root_div.appendChild(this.waveform_div);
		this.root_div.appendChild(this.controls_div);
		this.controls_div.appendChild(this.play_button);

		this.wavesurfer = WaveSurfer.create({
			container: "#" + this.waveform_id,
			mediaControls: true,
			plugins: [WaveSurfer.regions.create()]
		});

		this.playing = false;
	}

	init_table() {
		this.datatable_id = "annotation_table"

		this.datatable_div = document.createElement('div');
		this.datatable_div.id = this.datatable_id
		this.datatable_div.className = "annotation_table"

		this.root_div.appendChild(this.datatable_div);

		var self = this;
		this.controller = create_controller(self)
		$(document).ready( function () {
		    self.annotationTable = new jsGrid.Grid($("#" + self.datatable_id), {
		    	controller: self.controller,
		    	fields: self.fields,
				autoload: true,
				editing: true,
				inserting: true,
		    });
		} );


	}

	drawRegions() {
		this.wavesurfer.clearRegions();

		for (var i = 0; i < this.annotations.length; i++) {
			var newRegion = this._createRegion(this.annotations[i]);
			this.wavesurfer.addRegion(newRegion);
		}
	}

	loadAudio(audio, annotations=[]) {
		this.wavesurfer.load(audio);

		for (var i = 0; i < annotations.length; i++) {
			this.annotations.push(annotations[i]);
		}

		var self = this;
		this.wavesurfer.on("ready", function () {
			self.drawRegions();
			self.init_table()
		});
	}

	play() {
		this.wavesurfer.play()
		this.playing = true;
		this.play_button.innerHTML = "Pause"
	}

	pause() {
		this.wavesurfer.pause()	
		this.playing = false;
		this.play_button.innerHTML = "Play"
	}

	playpause() {
		if(this.playing) {
			this.pause();
		} else {
			this.play();
		}
	}

	get_annotations() {
		var res = []
		console.log("get")
		for (var key in this.wavesurfer.regions.list) {
			var region = this.wavesurfer.regions.list[key]

			var annotation = {
				Start: region.start,
				End: region.end
			}

			for (var i = 0; i < this.fields.length; i++) {
				var f = this.fields[i]["name"];

				if (f == "Start" || f == "End") {
					continue
				}
				annotation[f] = region[f]
			}

			console.log(annotation)

			res.push(annotation);
		}

		return res
	}

	_createRegion(annotation) {
		var newRegion = {
			start: annotation.Start,
			end: annotation.End,
			id:annotation.uid,
			loop: true,
			drag: false,
			resize: true
		}

		return newRegion;
	}
}

var create_controller = function(tool) {
	return controller = {
		loadData: function(filter) {
			var regions1 = tool.annotations;
			console.log(regions1)
			// console.log(regions);
			// var regions = [{"Start": 0, "End": 20, "Label": 0, "Source":0}]
			return regions1
			// return {data: regions, totalCount: regions.length}
		},
		instertItem: function(item) {console.log("insert")},
		updateItem: function(item) {console.log("update")},
		deleteItem: function(item) {console.log("del")}
	}
}

var handle_playpause = function(tool) {
	tool.playpause()
}