var Clock = Backbone.Model.extend({

	initialize: function() {
		// console.log('Clock::initialize()');
		this.isRunning = false;
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
		if (this.isRunning == false) {
			this.isRunning = true;
			this.count = 0;
			this.step();
		} else {
			return
		}
	},

	stop: function() {
		// console.log('Clock Stop');
		this.isRunning = false;
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
    // var volume = Math.random();
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

});;var FaderView = Backbone.View.extend({

	template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),
	
  render: function() {
		this.$el.html(this.template({
      id: this.model.id
		}));
  	return this;
  }

});;var StepView = Backbone.View.extend({

  className: 'step',

	events: {
    'click .trigger' : 'toggleStep'
	},

  initialize: function() {
    // console.log(this.model);
  },

	render: function() {
    this.template = _.template( $('#step-template').html() );
		this.$el.html(this.template({
      id: this.model.id
		}));
    this.initSlider();

  	return this;
	},

  initSlider: function() {
    var self = this;

    this.$('.slider').noUiSlider({
      start: [self.model.get('delta')],
      direction: "rtl",
      step: 1,
      connect: false,
      orientation: "vertical",
      range: {
        'min': [0],
        'max': [24]
      },
      format: wNumb({
        decimals: 0
      })
    }).on('slide', function(e){
      self.setPitch($(this).val());
    });
  },

  setPitch: function(delta) {
    this.model.set({"delta": delta});
  },

  flashLed: function() {
    var $ledEl = $('.led_'+this.model.id);
    $ledEl.addClass('lit');
    setTimeout(function(){
      $ledEl.removeClass('lit');
    }, 200);
  },

  toggleStep: function() {
    var $triggerEl = $('.trigger_'+this.model.id);
    $triggerEl.toggleClass('step-active');

  },

  isActive: function() {
    var $triggerEl = $('.trigger_'+this.model.id);
    if ($triggerEl.hasClass('step-active')) {
      return true
    } else {
      return false;
    }
  }

});;var SequenceView = Backbone.View.extend({

  className: 'sequence',

	events: {
    'click #start' : 'start',
    'click #stop' : 'stop',
	},

	initialize: function() {
		var self= this;
    this.setNoteMapper();
		this.stepCount = 1;
    this.clock = new Clock();
    this.listenTo(this.clock, 'step', this.stepWasTriggered);
    this.stepCollection = new StepCollection();
    this.stepCollection.fetch().done( function(){
    	self.createAndRenderStepViews();
    });
	  this.model = new Sequence({
	    'tempo': 100,
      'rootPitch': 'A4',
	    'stepCollection': this.stepCollection
	  });
	},

	render: function() {
    this.template = _.template( $('#sequence-template').html() );
		this.$el.html(this.template({

		}));
  	return this;
	},

	createAndRenderStepViews: function() {
		var self = this;
		this._stepViews = [];
		_.each(this.stepCollection.models, function (stepModel){
			var stepView = new StepView({model: stepModel});
			self._stepViews.push( stepView );
		});
		this.renderStepViews();
	},

	removeStepViews: function() {
		_.invoke(this.stepCollection, 'remove');
	},

	renderStepViews: function() {
		_.each(this._stepViews, function (stepView) {
			$('#step-views').append(stepView.render().$el);
		});
	},

  stepWasTriggered: function (e) {
    this.triggerStep();
  },

  start: function(e) {
  	console.log('SequenceView::start()');
    this.clock.start();
    $(e.currentTarget).addClass('started');
  },

  stop: function() {
  	console.log('SequenceView::stop()');
    this.clock.stop();
    this.$('.play').removeClass('started');
  },

  triggerStep: function() {
    var self = this;
    if (this.stepCount-1 == this.stepCollection.length) {
      this.stepCount = 1;
    }

    var currentStepView = this._stepViews[this.stepCount-1];
    if (currentStepView.isActive() === true) {

      // TODO: would be cool if by frequency...
      // var HALF_STEP_DELTA = Math.pow(2, 1/12);

      var pitchDelta = currentStepView.model.get('delta');
      var currentNote = this.noteMapper[pitchDelta];
      console.log (currentNote.freq );

      this.model.createAndTriggerOscillator(currentNote.freq, .1);
    }
    this.flashLed();
    this.stepCount++;
  },

  flashLed: function() {
  	this._stepViews[this.stepCount-1].flashLed();
  },

  setNoteMapper: function () {
    this.noteMapper = [
      {'name' : 'A3',  'freq' : 220.00},
      {'name' : 'A#3', 'freq' : 233.08},
      {'name' : 'B3',  'freq' : 246.94},
      {'name' : 'C4',  'freq' : 261.63},
      {'name' : 'C#4', 'freq' : 277.18},
      {'name' : 'D4',  'freq' : 293.66},
      {'name' : 'D#4', 'freq' : 311.13},
      {'name' : 'E4',  'freq' : 329.63},
      {'name' : 'F4',  'freq' : 349.23},
      {'name' : 'F#4', 'freq' : 369.99},
      {'name' : 'G4',  'freq' : 392.00},
      {'name' : 'G#4', 'freq' : 415.30},
      {'name' : 'A4',  'freq' : 440.00},
      {'name' : 'A#4', 'freq' : 466.16},
      {'name' : 'B4',  'freq' : 493.88}, 
      {'name' : 'C5' , 'freq' : 523.25},
      {'name' : 'C#5', 'freq' : 554.37},
      {'name' : 'D5',  'freq' : 587.33},
      {'name' : 'D#5', 'freq' : 622.25}, 
      {'name' : 'E5' , 'freq' : 659.25},
      {'name' : 'F5' , 'freq' : 698.46},
      {'name' : 'F#5', 'freq' : 739.99}, 
      {'name' : 'G5' , 'freq' : 783.99},
      {'name' : 'G#5', 'freq' : 830.61}, 
      {'name' : 'A5',  'freq' : 880.00}
    ]
  }


});;$( document ).ready(function() {

  var sequenceView = new SequenceView();
  $('#seq').append( sequenceView.render().$el );
  
});