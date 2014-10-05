$( document ).ready(function() {

  var stepView = new StepView();
  $('#seq').append( stepView.render().$el );
  
  var pattern, context, osc, tempoWorker, stepper, numSteps, stepFreq;

  pattern = {
    "tempo":100,
    "sequence": [
      220, 
      440, 
      293, 
      246, 
      261, 
      293, 
      246, 
      261
    ]
  };

  function getAudioContext() {
    var contextClass = ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
    if (contextClass) { // Web Audio API is available.
      return new contextClass();
    } else {
      alert('Web Audio API not supported by this browser.  :-(   ');
    }
  }

  context = getAudioContext();
  // console.log('created AudioContext', context);

  tempoWorker = new Worker("assets/scripts/_tempo-worker.js");
  tempoWorker.onmessage = function(e) {
    // console.log(e);
    playNote();
  };
  $('#start').on('click', function(e) {
    tempoWorker.postMessage('start');
    console.log('started tempoWorker');
  });

  $('#stop').on('click', function(e) {
    tempoWorker.postMessage("stop");
    console.log('stopped tempoWorker');
  });


  stepper = 0;
  function playNote() {
    numSteps = pattern.sequence.length;
    if (stepper == numSteps) {
      stepper = 0;
    }
    stepFreq = pattern.sequence[stepper];
    // console.log ( 'freq of step', pattern.sequence[stepper] );
    console.log ('step', stepper, 'of', numSteps, 'at', stepFreq, 'Hz');
    stepper++;
    createAndTriggerOscillator(stepFreq, .2);
  }

  function createAndTriggerOscillator(freq, volume) {
    vco = context.createOscillator();
    vco.frequency.value = freq;
    vco.type = "square";
    vco.connect(context.destination);

    var vca = context.createGain();
    volume = Math.random();
    vca.gain.value = volume;
    vco.connect(vca);
    vca.connect(context.destination);

    vco.start(0);
    setTimeout(function() {
        vco.stop(0);
        vco.disconnect(context.destination);
    }, 100)
  }

});