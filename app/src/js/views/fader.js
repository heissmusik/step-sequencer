var FaderView = Backbone.View.extend({

	template: _.template('<span id="fader_<%=id%>" class="fader"></span>'),
	
	events: { 'drop:dropview': 'dropviewDropHandler'},

	initialize: function () {
		
		this.$el.draggable({ axis: "y" });
		var axis = $( ".selector" ).draggable( "option", "axis" );
		console.log(axis);

		// this.$el.drags();

		// $(this.el).bind("dragStart",
		// 	function() {
		// 		window.dragging = this.model;
		// 	}, this);

		//remove reference for garbage collection purpose
		// $(this.el).bind("dragStop",
		// 	function() {
		// 		delete window.dragging;
		// 	}, this);

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