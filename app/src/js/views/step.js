var StepView = Backbone.View.extend({

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
    // this.fader = new FaderView({ model: this.model });
  },

	render: function() {
    this.template = _.template( $('#step-template').html() );
		this.$el.html(this.template({
      id: this.model.id
		}));
    // this.$('.fader-view').html( this.fader.render().$el );
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

});