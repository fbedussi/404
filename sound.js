const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGainNode = audioContext.createGain();
masterGainNode.connect(audioContext.destination);
masterGainNode.gain.value = 20;
let sineTerms = new Float32Array([0, 0, 1, 0, 1]);
let cosineTerms = new Float32Array(sineTerms.length);
let customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);

export function playTone(freq, duration = 500) {
  let osc = audioContext.createOscillator();
  osc.connect(masterGainNode);

  let type = 'square';

  if (type == 'custom') {
    osc.setPeriodicWave(customWaveform);
  } else {
    osc.type = type;
  }

  osc.frequency.value = freq;
  osc.start();

  return new Promise(res => {
    setTimeout(() => {
      osc.stop();
      res();
    }, duration);
  });
}

export function play200sound() {
  return playTone(300, 200).then(() => playTone(500, 100));
}

export function play404sound() {
  return playTone(300, 150)
    .then(() => playTone(250, 200))
    .then(() => playTone(150, 250));
}
