var i = 0;
var tempo = 0;

function step() {
	i = i + 1;
	tempo = setTimeout(function() {

		postMessage('step ' + i); 
		step();

	}, 200);

}

onmessage = function(e) { 

	if (e.data == 'start') { 

		if (!tempo) step();

	} else if (e.data == 'stop') {

		if (tempo) { 
			clearTimeout(tempo); 
		}

		tempo = 0;


	};
}

