const EasyMidi = require('easymidi');
const input = new EasyMidi.Output('From DustyNode', true);

setInterval(() => {
  const d = new Date();
  console.log(`still open at ${d.toString()}`);
}, 5000);
