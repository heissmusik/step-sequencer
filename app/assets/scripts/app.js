var Clock = Backbone.Model.extend({

	initialize: function() {
		console.log('Clock::initialize()');
		this.engine = 0; // for setTimeout
		this.tempo = 200 // TODO: convert to BPM from milliseconds
		this.count = 0; // counts number of steps
	}, 

	step: function() {
		var self = this;
		this.count += 1;
		this.engine = setTimeout(function() {
			// postMessage('step ' + i); 
			self.trigger('step', {'count!': self.count} );
			self.step();
		}, self.tempo );
	},

	start: function() {
		console.log('Clock Start');
		this.count = 0;
		this.step();
	},

	stop: function() {
		console.log('Clock Stop');
		if (this.engine !== 0) { 
			clearTimeout(this.engine); 
		}
		this.engine = 0;
	}

});;var StepView = Backbone.View.extend({

  // TODO: use an external template mixin
  // template: _.template( $('#step-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'step',

	events: {
    'click .start-seq' : 'start',
    'click .stop-seq' : 'stop',

    'click .step-trigger' : 'toggleStep',
    'mousemove .fader'  : 'handleMouseMove'
	},

	initialize: function() {
    this.model = new Clock();
    this.listenTo(this.model, 'step', this.stepWasTriggered);
	},

	render: function() {
    this.template = _.template( $('#step-template').html() );

		this.$el.html(this.template({

		}));
  	return this;
	},

  stepWasTriggered: function(e) {
    console.log ('step triggered', e);
  },

  start: function() {
    console.log('starting...');
    this.model.start();
  },

  stop: function() {
    this.model.stop();
  },

  toggleStep: function() {
    console.log('toggleStep');
  },

  handleMouseMove: function() {
    // console.log('handleMouseMove');
  }

});;$( document ).ready(function() {

  var stepView = new StepView();
  $('#seq').append( stepView.render().$el );
  
  var pattern, context, osc, tempoWorker, stepper, numSteps, stepFreq;

  pattern = {
    "tempo":100,
    "sequence": [
      220, 
      440, 
      293, 
      246, 
      261, 
      293, 
      246, 
      261
    ]
  };

  function getAudioContext() {
    var contextClass = ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
    if (contextClass) { // Web Audio API is available.
      return new contextClass();
    } else {
      alert('Web Audio API not supported by this browser.  :-(   ');
    }
  }

  context = getAudioContext();
  // console.log('created AudioContext', context);

  tempoWorker = new Worker("assets/scripts/_tempo-worker.js");
  tempoWorker.onmessage = function(e) {
    // console.log(e);
    playNote();
  };
  $('#start').on('click', function(e) {
    tempoWorker.postMessage('start');
    console.log('started tempoWorker');
  });

  $('#stop').on('click', function(e) {
    tempoWorker.postMessage("stop");
    console.log('stopped tempoWorker');
  });


  stepper = 0;
  function playNote() {
    numSteps = pattern.sequence.length;
    if (stepper == numSteps) {
      stepper = 0;
    }
    stepFreq = pattern.sequence[stepper];
    // console.log ( 'freq of step', pattern.sequence[stepper] );
    console.log ('step', stepper, 'of', numSteps, 'at', stepFreq, 'Hz');
    stepper++;
    createAndTriggerOscillator(stepFreq, .2);
  }

  function createAndTriggerOscillator(freq, volume) {
    vco = context.createOscillator();
    vco.frequency.value = freq;
    vco.type = "square";
    vco.connect(context.destination);

    var vca = context.createGain();
    volume = Math.random();
    vca.gain.value = volume;
    vco.connect(vca);
    vca.connect(context.destination);

    vco.start(0);
    setTimeout(function() {
        vco.stop(0);
        vco.disconnect(context.destination);
    }, 100)
  }

});