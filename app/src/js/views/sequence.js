var SequenceView = Backbone.View.extend({

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

});