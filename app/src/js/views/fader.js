var FaderView = Backbone.View.extend({

	template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),
	
	events: { 'drop:dropview': 'dropviewDropHandler'},

	initialize: function () {
		console.log('FaderView::initialize()');
		
		this.$el.draggable();

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

});