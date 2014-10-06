var StepView = Backbone.View.extend({

  // TODO: use an external template mixin
  // template: _.template( $('#step-template').html() ),
	// template: _.template( '<span><%= myVar %></span>' ),

  className: 'step',

	events: {
    'click .step-trigger' : 'toggleStep',
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
  	return this;
	},

  flashLed: function() {
    var $ledEl = $('.led_'+this.model.id);
    $ledEl.css("background", "red");
    // $('.led_'+this.model.id).removeClass("flash");
    // $el.css("background", "red");
    setTimeout(function(){
      $ledEl.css("background", '#999999');
    }, 200);
  },

  toggleStep: function() {
    console.log('toggleStep');
  },

  handleMouseMove: function() {
    // console.log('handleMouseMove');
  }

});