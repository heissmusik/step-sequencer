$( document ).ready(function() {

  var sequenceView = new SequenceView();
  $('#seq').append( sequenceView.render().$el );
  
});