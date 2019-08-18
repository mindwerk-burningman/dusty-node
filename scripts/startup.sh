#!/bin/bash

open router/dust_more.maxpat &
open sound-engine/sound-engine.logicx

node index.js &
P1=$!
muse-io --device Muse-98A9 --osc osc.udp://localhost:4224 &
P2=$!

ssh "pi@10.0.1.5" <<END_SCRIPT
python3 /home/pi/run/srv3.py --leds 250 --ip 10.0.1.5 --port 9001
END_SCRIPT
P3=$!

wait $P1 $P2 $P3