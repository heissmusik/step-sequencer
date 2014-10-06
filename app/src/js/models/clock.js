var Clock = Backbone.Model.extend({

	initialize: function() {
		// console.log('Clock::initialize()');
		this.engine = 0; // setTimeout id
		this.tempo = 200 // TODO: convert to BPM from milliseconds
		this.count = 0; // counts number of steps
	}, 

	step: function() {
		var self = this;
		this.count += 1;
		this.engine = setTimeout(function() {
			self.trigger('step', {'stepNumber': self.count} );
			self.step();
		}, self.tempo );
	},

	start: function() {
		// console.log('Clock Start');
		this.count = 0;
		this.step();
	},

	stop: function() {
		// console.log('Clock Stop');
		if (this.engine !== 0) { 
			clearTimeout(this.engine); 
		}
		this.engine = 0;
	}

});