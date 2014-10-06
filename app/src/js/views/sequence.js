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
    this.model.createAndTriggerOscillator(stepFreq, .2);
    this.flashLed();
    this.stepCount++;
  },

  flashLed: function() {
  	this._stepViews[this.stepCount-1].flashLed();
  }

});