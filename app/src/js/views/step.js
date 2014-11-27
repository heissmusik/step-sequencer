var StepView = Backbone.View.extend({

  className: 'step',

	events: {
    'click .trigger' : 'toggleStep'
	},

  initialize: function() {
    // console.log(this.model);
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
      start: [self.model.get('delta')],
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
      self.setPitch($(this).val());
    });
  },

  setPitch: function(delta) {
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