const createAnalyser = require("web-audio-analyser");

module.exports = function initAnalyser(callback, options = { fftSize: 64 }) {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then(function(stream) {
      const analyser = createAnalyser(stream, { stereo: false, audible: false });
      analyser.analyser.fftSize = options.fftSize;

      callback(analyser);
    })
    .catch(function(error) {
      console.error(error);
    });
};
