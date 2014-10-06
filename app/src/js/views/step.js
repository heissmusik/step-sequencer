var StepView = Backbone.View.extend({

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

});