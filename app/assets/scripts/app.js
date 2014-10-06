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

});;var Sequence = Backbone.Model.extend({

	initialize: function(attrs) {
		// console.log('Sequence::initialize()', attrs);
		this.context = this.getAudioContext();
		this.get('stepCollection').fetch().done( function() {
		});
	},

	getAudioContext: function() {
    var contextClass = ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
    if (contextClass) { // Web Audio API is available.
      return new contextClass();
    } else {
      alert('Web Audio API not supported by this browser.  :-(   ');
    }
  },

  createAndTriggerOscillator: function (freq, volume) {
    var vco = this.context.createOscillator();
    vco.frequency.value = freq;
    vco.type = "square";
    vco.connect(this.context.destination);

    var vca = this.context.createGain();
    var volume = Math.random();
    vca.gain.value = volume;
    vco.connect(vca);
    vca.connect(this.context.destination);

    vco.start(0);
    var self= this;
    setTimeout(function() {
        vco.stop(0);
        vco.disconnect(self.context.destination);
    }, 100)
  }

});;var Step = Backbone.Model.extend({

	defaults: {
		"frequency": 440
	},

	initialize: function(attrs) {
		// console.log('Step::initialize()', attrs);
	}

});;var StepCollection = Backbone.Collection.extend({
  
  model: Step,
  url: 'assets/json/steps.json',

  initialize: function(models, options) {
  	// console.log('StepCollection:initialize()');
  },

  parse: function(response) {
  	return response.steps
  }

});;var StepView = Backbone.View.extend({

  // TODO: use an external template mixin
  // template: _.template( $('#step-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'step',

	events: {
    'click .step-trigger' : 'toggleStep',
    'mousemove .fader'  : 'handleMouseMove'
	},

	initialize: function() {
	},

	render: function() {
    this.template = _.template( $('#step-template').html() );

		this.$el.html(this.template({

		}));
  	return this;
	},

  toggleStep: function() {
    console.log('toggleStep');
  },

  handleMouseMove: function() {
    // console.log('handleMouseMove');
  }

});;var SequenceView = Backbone.View.extend({

  // TODO: use an external template mixin
  // template: _.template( $('#sequence-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'sequence',

	events: {
    'click #start' : 'start',
    'click #stop' : 'stop',
	},

	initialize: function() {
    this.clock = new Clock();
    this.listenTo(this.clock, 'step', this.stepWasTriggered);

    this.stepCollection = new StepCollection();
	  this.model = new Sequence({
	    "tempo": 100,
	    "stepCollection": this.stepCollection
	  });
	  this.stepCount = 1;
	},

	render: function() {
    this.template = _.template( $('#sequence-template').html() );
		this.$el.html(this.template({

		}));
  	return this;
	},

  stepWasTriggered: function(e) {
    console.log ('step triggered', e, this.clock);
    this.playNote();
  },

  start: function() {
  	console.log('SequenceView::start()');
    this.clock.start();
  },

  stop: function() {
  	console.log('SequenceView::stop()');
    this.clock.stop();
  },

  playNote: function() {
  	var self = this;
    if (this.stepCount == this.stepCollection.length) {
      this.stepCount = 1;
    }
    // console.log('this.stepCount', this.stepCount);
    var currentStep = this.stepCollection.get(self.stepCount );
    // console.log('currentStep', currentStep);
    var stepFreq = currentStep.get('frequency');
    // console.log ( 'freq of step', pattern.sequence[stepper] );
    console.log ('step', this.stepCount, 'of', this.stepCollection.length, 'at', stepFreq, 'Hz');
    this.stepCount++;
    this.model.createAndTriggerOscillator(stepFreq, .2);
  }

});;$( document ).ready(function() {

  var sequenceView = new SequenceView();
  $('#seq').append( sequenceView.render().$el );
  
});