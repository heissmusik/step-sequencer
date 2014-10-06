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

  toggleStep: function() {
    console.log('toggleStep');
  },

  handleMouseMove: function() {
    // console.log('handleMouseMove');
  }

});