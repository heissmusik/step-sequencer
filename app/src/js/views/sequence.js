var SequenceView = Backbone.View.extend({

  className: 'sequence',

	events: {
    'click #start' : 'start',
    'click #stop' : 'stop',
	},

	initialize: function() {
		var self= this;
    this.setNoteMapper();
    console.log (this.noteMapper[12]);

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
      console.log ( 'DELTA', currentStepView.model.get('delta') );

      // TODO: would be cool if by frequency...
      // var HALF_STEP_DELTA = Math.pow(2, 1/12);

      var pitchDelta = currentStepView.model.get('delta');
      var currentNote = this.noteMapper[pitchDelta];
      console.log (currentNote.freq );

      this.model.createAndTriggerOscillator(currentNote.freq, .2);
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


});