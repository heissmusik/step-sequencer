var FaderView = Backbone.View.extend({

	template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),
	
	events: { 'drop:dropview': 'dropviewDropHandler'},

	initialize: function () {
		console.log('FaderView::initialize()');
		// this.$el.draggable();
	},

  render: function() {
		this.$el.html(this.template({
      id: this.model.id
		}));
  	return this;
  }

});