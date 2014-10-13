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

});;var FaderView = Backbone.View.extend({

	template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),
	
	events: { 'drop:dropview': 'dropviewDropHandler'},

	initialize: function () {
		console.log('FaderView::initialize()');
		
		// this.$el.draggable({ axis: "y" });
		// var axis = $( ".selector" ).draggable( "option", "axis" );
		// console.log(axis);

		// this.$el.drags();

		// $(this.el).bind("dragStart",
		// 	function() {
		// 		window.dragging = this.model;
		// 	}, this);

		//remove reference for garbage collection purpose
		// $(this.el).bind("dragStop",
		// 	function() {
		// 		delete window.dragging;
		// 	}, this);

	},

	dropviewDropHandler: function() { console.log('drag'); },

  render: function() {
  	// $('.fader-view').append(stepView.render().$el);
  	// this.template = _.template( $('#step-template').html() );
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
    this.fader = new FaderView({ model: this.model });
  },

	render: function() {
    this.template = _.template( $('#step-template').html() );
		this.$el.html(this.template({
      id: this.model.id
		}));
    this.$('.fader-view').html( this.fader.render().$el );
  	return this;
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
    
    if (this._stepViews[this.stepCount-1].isActive() === true) {
    	this.model.createAndTriggerOscillator(stepFreq, .2);
  	}
    
    this.flashLed();
    this.stepCount++;
  },

  flashLed: function() {
  	this._stepViews[this.stepCount-1].flashLed();
  }

});;$( document ).ready(function() {

  var sequenceView = new SequenceView();
  $('#seq').append( sequenceView.render().$el );
  
});