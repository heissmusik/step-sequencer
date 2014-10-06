var Tempo = Backbone.Model.extend({


	initialize: function() {
		console.log('Tempo::initialize()');
		this.tempo = 0; // timeout
	}, 

	step: function() {
		var self = this;
		// i = i + 1;
		this.tempo = setTimeout(function() {
			// postMessage('step ' + i); 
			self.trigger('step', {} );
			self.step();
		}, 200);
	},

	start: function() {

		console.log('Tempo Start');

		this.step();

	},

	stop: function() {
		console.log('Tempo Stop');
		if (this.tempo !== 0) { 
			clearTimeout(this.tempo); 
		}
		this.tempo = 0;
	}



});