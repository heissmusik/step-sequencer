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
    var volume = .8;
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
	
	initialize: function () {
		console.log('FaderView::initialize()');
		// this.$el.draggable();
	},

  render: function() {
		this.$el.html(this.template({
      id: this.model.id
		}));
  	return this;
  }

});;var StepView = Backbone.View.extend({

  // TODO: use an external template mixin
  // template: _.template( $('#step-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'step',

	events: {
    'click .trigger' : 'toggleStep',
    'mousemove .fader'  : 'handleMouseMove'
	},

	initialize: function(options) {
    // console.log('StepView:initialize()');
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
      start: [12],
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
      self.setPitch($(this).val()-12);
    });
  },

  setPitch: function(delta) {
    console.log('change pitch by', delta);
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
    console.log('toggleStep');
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

  // TODO: use an external template mixin
  // template: _.template( $('#sequence-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'sequence',

	events: {
    'click #start' : 'start',
    'click #stop' : 'stop',
	},

	initialize: function() {
		var self= this;
		this.stepCount = 1;
    this.clock = new Clock();
    this.listenTo(this.clock, 'step', this.stepWasTriggered);

    this.stepCollection = new StepCollection();
    this.stepCollection.fetch().done( function(){
    	self.createAndRenderStepViews();
    });
	  this.model = new Sequence({
	    "tempo": 100,
	    "stepCollection": this.stepCollection
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
    console.log ('step triggered', e);
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
    if (this.stepCount-1 == this.stepCollection.length) {
      this.stepCount = 1;
    }
    // console.log('this.stepCount', this.stepCount);
    var currentStep = this.stepCollection.get(self.stepCount );
    // console.log('currentStep', currentStep);
    var stepFreq = currentStep.get('frequency');
    // console.log ( 'freq of step', pattern.sequence[stepper] );
    console.log ('step', this.stepCount, 'of', this.stepCollection.length, 'at', stepFreq, 'Hz');

    var stepDelta = currentStep.get('delta');
    console.log('stepDelta', stepDelta);

    // Since an octave has a frequency ratio of 2, 
    // a half-step has a frequency ratio of 2^(1/12), or approximately 1.0595. 
    // For example, if the note A has a frequency of 440 Hz, 
    // then one half-step up (A# or Bb) is 440*1.0595 = 466.2 Hz. 
    // One half-step down (G# or Ab) is 440/1.0595 = 415.3 Hz.
    var HALF_STEP_DELTA = Math.pow(2, 1/12);

    if (stepDelta > 0) {
      freq = stepFreq + (stepDelta * HALF_STEP_DELTA);
      console.log('freq', freq);

    } else if (stepDelta < 0) {

    }




    
    if (this._stepViews[this.stepCount-1].isActive() === true) {
    	this.model.createAndTriggerOscillator(stepFreq, .2);
  	}
    
    this.flashLed();
    this.stepCount++;
  },

  flashLed: function() {
  	this._stepViews[this.stepCount-1].flashLed();
  },

  setNoteMapper: function () {
    this.noteMapper = {
      /*
      A3  220.00  
      A#3/Bb3  233.08  
      B3  246.94  
      C4  261.63  
      C#4/Db4  277.18  
      D4  293.66  
      D#4/Eb4  311.13  
      E4  329.63  
      F4  349.23 
      F#4/Gb4  369.99 
      G4  392.00 
      G#4/Ab4  415.30 
      A4  440.00 
      A#4/Bb4  466.16 
      B4  493.88 
      C5  523.25 
      C#5/Db5  554.37 
      D5  587.33 
      D#5/Eb5  622.25 
      E5  659.25 
      F5  698.46 
      F#5/Gb5  739.99 
      G5  783.99 
      G#5/Ab5  830.61 
      A5  880.00 
      */
    }
  }


});;$( document ).ready(function() {

  var sequenceView = new SequenceView();
  $('#seq').append( sequenceView.render().$el );
  
});