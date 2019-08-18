# DustMore #

## Running

* `npm run startup`
* make sure logic tracks are all in record mode (the R in arrange track is "armed" or red)
* make sure control surfaces are for "from Max 1" (option + shift + k)
* in Logic, de-mix midi channels via `Preferences > Recording > Recording Project Settings > "Auto demix by channel..."`

---

## MindWave (lighting script) ##

OSC Addresses the light script is listening for

`/sean/alpha 0.0`
`/sean/beta 0.0`
`/sean/gamma 0.0`
`/sean/alphaavg 0.0`
`/sean/betaavg 0.0`

**setup mac network manually**

* set IP to 10.0.1.6 (slightly different than pi)
* set Subnet Mask to 255.255.0.0

```sh
ssh pi@10.0.1.5 # password is pi
cat /etc/rc.local # startup script

~/pi/run/srv3.py.mindwerk # the one I want

# copy script to run on startup
cp srv3.py.mindwerk srv3.py

# manual run
python3 /home/pi/run/srv3.py --leds 250 --ip 10.0.1.5 --port 9001

# ssh without password (copy ssh key from computer to pi)
ssh-copy-id pi@10.0.1.5
```

## MuseIO ##

* Install and setup the `museresearchtools` (contains muse-io and muse-player) according to [instructions here](http://developer.choosemuse.com/tools/mac-tools)
* if using something different than `bash`, need to add the following lines to your profile:
  - `export PATH="$PATH:/Applications/Muse"`
  - `export DYLD_FALLBACK_LIBRARY_PATH="$DYLD_FALLBACK_LIBRARY_PATH:/Applications/Muse"`

* pair headset with computer via bluetooth (turn off headset and then turn on holding button for 5 seconds until all 5 lights blink in unison)
* after it is paired, it will show as `disconnected` until a program starts streaming to it
* run `muse-io` like below to stream OSC

`muse-io --device Muse-98A9`

sending from device to some port for other program
`muse-io --device Muse-98A9 --osc osc.udp://localhost:9000`

reading file over TCP
`muse-player -f muselab_recording.muse -s osc.tcp://127.0.0.1:9000`

read file to mindwave (lighting script)
`muse-player -f muselab_recording.muse -s osc.udp://10.0.1.5:9000`

read file to local Max (udp instead of tcp)
`muse-player -f muselab_recording.muse -s osc.udp://127.0.0.1:9001`