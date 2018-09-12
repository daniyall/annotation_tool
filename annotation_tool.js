class AnnotationTool {
	constructor(rootElement, fields) {
		this.rootElement = rootElement;
		this.fields = fields;

		this.root_div = document.getElementById(this.rootElement)

		this.rand_id = Math.floor(Math.random() * 10000)

		this.init_wavesurfer()
	}

	init_wavesurfer() {
		this.waveform_id = "Waveform-" + this.rand_id
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
		this.datatable_id = "table-" + this.rand_id

		this.datatable_div = document.createElement('div');
		this.datatable_div.id = this.datatable_id
		this.datatable_div.className = "annotation_table"

		this.root_div.appendChild(this.datatable_div);

		var self = this;
		this.controller = create_controller(self)
		$(document).ready( function () {
		    $("#" + self.datatable_id).jsGrid({
		    	controller: self.controller,
		    	fields: self.fields,
				autoload: true,
				editing: true,
				inserting: true,

		    })
		} );
	}


	loadAudio(audio, regions=[]) {
		this.wavesurfer.load(audio);

		var self = this;
		this.wavesurfer.on("ready", function () {
			self._set_regions(regions);
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

	get annotations() {
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
				console.log("FSF " + f + region[f])
				annotation[f] = region[f]
			}

			console.log(annotation)

			res.push(annotation);
		}

		return res
	}

	_add_region(annotation) {
		var newRegion = {
			start: annotation.Start,
			end: annotation.End,
			loop: true,
			drag: false,
			resize: true
		}

		for (var i = 0; i < this.fields.length; i++) {
			var f = this.fields[i]["name"];
			newRegion[f] = annotation[f]
		}

		this.wavesurfer.addRegion(newRegion);
	}

	_set_regions(annotations) {
		this.wavesurfer.clearRegions();

		for (var i = 0; i < annotations.length; i++) {
			this._add_region(annotations[i])
		}
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