var StepCollection = Backbone.Collection.extend({
  
  model: Step,
  url: 'assets/json/steps.json',

  initialize: function(models, options) {
  	// console.log('StepCollection:initialize()');
  },

  parse: function(response) {
  	return response.steps
  }

});