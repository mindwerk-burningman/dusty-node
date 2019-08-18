#!/usr/bin/python
import time
import colorsys
import sys
import argparse
import threading
import math
import random
from datetime import datetime
from LedStrip_WS2801 import *
from random import randrange
from pythonosc import dispatcher
from pythonosc import osc_server
from pythonosc import osc_message_builder
from DmxPy import DmxPy

# copied here to support broadcast
"""Client to send OSC datagrams to an OSC server via UDP."""
import socket

class UDPClient(object):
  """OSC client to send OscMessages or OscBundles via UDP."""

  def __init__(self, address, port):
    """Initialize the client.

    As this is UDP it will not actually make any attempt to connect to the
    given server at ip:port until the send() method is called.
    """
    self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    self._sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1) # added line
    self._sock.setblocking(0)
    self._address = address
    self._port = port
    print("listening on ip    : {0}\n"
          "listening on port  : {1}\n".format(address, port))

  def send(self, content):
    """Sends an OscBundle or OscMessage to the server."""
    self._sock.sendto(content.dgram, (self._address, self._port))
# end copy

# data structure to hold settings data
class setting:
    def __init__(self, timeout=4, leds=25, ups=30, change=0.001234, satlimit=0.5050505, value=1, specialLeds=0):
        self.running = True
        self.timeout = timeout
        self.leds    = leds
        self.ups     = ups
        self.change  = change
        self.satlimit= satlimit
        self.value   = value
        self.specialLeds = specialLeds

def setting_handler(unused_addr, args, value):
    settings = args[1]
    server   = args[0]
    propertyName = args[2]
    setattr(settings, propertyName, value)

def setting_handler_restart(unused_addr, args, value):
    settings = args[1]
    server   = args[0]
    setting_handler(unused_addr, args, value)
    settings.running = False
    server.shutdown()

def send_setting(client, address, val):
    b = osc_message_builder.OscMessageBuilder(address = address)
    b.add_arg(val)
    msg = b.build()
    client.send(msg)

def send_settings(client, settings):
    send_setting(client, "/led/settings/leds", int(settings.leds))
    send_setting(client, "/led/settings/timeout", int(settings.timeout))
    send_setting(client, "/led/settings/change", settings.change)
    send_setting(client, "/led/settings/updates", int(settings.ups))
    send_setting(client, "/led/settings/satlimit", settings.satlimit)
    send_setting(client, "/led/settings/value", settings.value)

# this will trigger a restart as we will actually receive the settings as well
def setting_request_handler(unused_addr, args):
    settings = args[1]
    client   = args[0]
    send_settings(client, settings)

def strobe_render(dmx, freq, intensity):
    print("freq {0} int {1}".format(freq, intensity))
    dmx.setChannel(1, int(freq)%256)
    dmx.setChannel(2, int(intensity)%256)
    dmx.render()

def strobe_handler(unused_addr, args, freq, intensity):
    dmx = args[0]
    strobe_render(dmx, freq, intensity)

def strobe_oneshothandler(unused_addr, args, intensity):
    dmx = args[0]

    if intensity != 0:
        strobe_render(dmx, 255, 255*(intensity%1.0))
        time.sleep(0.038)
        strobe_render(dmx, 0, 0)

def strobe_burstdone(dmx):
    dmx.blackout()
    dmx.render()

def strobe_bursthandler(unused_addr, args, freq, intensity, duration):
    dmx = args[0]
    strobe_render(dmx, freq, intensity)
    threading.Timer(duration, strobe_burstdone, args=dmx).start()

MW_NONE = 0
MW_BOOT = 1
MW_SCANNING = 2
MW_DENIED = 3

# data structure to hold headset data
class mind:
    def __init__(self):
        self.att = 0
        self.med = 0
        self.sig = 0
        self.state = MW_NONE
        self.t   = datetime.now()
        self.program = 0
        self.a   = 0
        self.b   = 0

def mindwave_handler_state(unused_addr, args):
    sharedMindState = args[0]
    state = args[1]
    sharedMindState.state = state
    sharedMindState.t   = datetime.now()

def mindwave_handler(unused_addr, args, value):
    sharedMindState = args[0]
    propertyName    = args[1]
    #print("{0} {1}\n".format(propertyName, value))
    setattr(sharedMindState, propertyName, value)
    sharedMindState.t   = datetime.now()
    sharedMindState.state = MW_NONE

gamma = [
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,
    1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,
    2,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  5,  5,
    5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10,
   10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
   17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
   25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
   37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
   51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
   69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
   90, 92, 93, 95, 96, 98, 99,101,102,104,105,107,109,110,112,114,
  115,117,119,120,122,124,126,127,129,131,133,135,137,138,140,142,
  144,146,148,150,152,154,156,158,160,162,164,167,169,171,173,175,
  177,180,182,184,186,189,191,193,196,198,200,203,205,208,210,213,
  215,218,220,223,225,228,231,233,236,239,241,244,247,249,252,255]

def corrected(c):
    try:
        return [gamma[int(c[0])], gamma[int(c[1])], gamma[int(c[2])]]
    except IndexError:
        print("{0} {1} {2}".format(int(c[0]), int(c[1]), int(c[2])))
        pass
    return [0,0,0]

def feedRunner(l, nLEDs, c):
    # copy in reverse or all leds will have the same color
    for n in range(nLEDs-1,0,-1):
        l.copyPixel(n-1, n)
    l.setPixel(0, corrected(c))
    l.update()

def drawBox(l, nLEDs, nSpecial, i):
    j = int(i) % 6
    if nSpecial > 0:
        for n in range(nLEDs, nLEDs+nSpecial):
            l.setPixel(n, corrected([0,0,0]))

        for n in range(nLEDs + int(i*nSpecial/6), nLEDs + int((i+1)*nSpecial/6) ):
            #x=colorsys.hsv_to_rgb(0.7785714285714286, 1, 1)
            x=colorsys.hsv_to_rgb(0.8, 1, 1)
            l.setPixel(+n, corrected([255*x[0], 255*x[1], 255*x[2]]))
        l.update()

def updateStringByM(l, m, nLEDs, satLimiter=0.5050505, value=1):
    # colorsys works with range 0.0 to 1.0
    # attention for HUE, meditation for LUM
    x=colorsys.hls_to_rgb(m.att,m.med*satLimiter,value)
    #x=colorsys.hsv_to_rgb(m.att, value, m.med) #*satLimiter,value)
    #l.setAll([255*x[0], 255*x[1], 255*x[2]])
    feedRunner(l, nLEDs, [255*x[0], 255*x[1], 255*x[2]])

def updateStringNoData(l, nLEDs):
    #time = (((time*10)//1)%255)+1
    #feedRunner(l, nLEDs, [randrange(0,time,1), randrange(0,time,1), randrange(0,time, 1)])
    hue = (1 + math.cos(time.time()/5)) / 2
    v = (1 + math.cos(time.time()/3)) / 2
    #hue = (time/60)%1.0
    #x=colorsys.hls_to_rgb(hue, 0.3, 1)
    #x=colorsys.hsv_to_rgb(hue, 1, v)
    x=colorsys.hsv_to_rgb(hue, 1, 0.5+v/2 )
    feedRunner(l, nLEDs, [255*x[0], 255*x[1], 255*x[2]])

def updateStringOffline(l, nLEDs):
    for n in range (nLEDs):
        l.setPixel(n, corrected([10 + randrange(0,240,1), 0, 0]))
    l.update()

def updateStringOff(l):
    l.setAll(corrected([0,0,0]))
    l.update()

def updateStringState(state):
    if state == MW_BOOT:
        l.setAll(corrected([0,255,0]))
    elif state == MW_SCANNING:
        l.setAll(corrected([0,0,255]))
    elif state == MW_DENIED:
        l.setAll(corrected([255,0,0]))
    l.update()

def vecMag(x, y):
    return math.sqrt(x*x+y*y)

def scalVegMag(x, y):
    return vecMag(x,y)/math.sqrt(2)

def vecAngleTo01(a, b):
    #(a*0+b*1)/(vecMag(a, b)*vecMag(0, 1))
    #vecMag(0,1) == 1
    mag = vecMag(a, b)
    if mag == 0 :
        return 0
    else:
        return math.acos((b)/mag)

def scalVecAngleTo01(a, b):
    return 2*vecAngleTo01(a, b)/math.pi

def updateStringAB(l, m, nLEDs, magLimit):
    # colorsys works with range 0.0 to 1.0
    # attention for HUE, meditation for LUM
    #x=colorsys.hls_to_rgb(m.att,m.med*satLimiter,value)
    # div by one to get a subset
    mag = scalVegMag(m.a, m.b)
    #rad = scalVecAngleTo01(m.a, m.b)/2.8
    rad = scalVecAngleTo01(m.a, m.b)*10/11
    #print("a {0} b {1} rad {2} rad+ {3}".format( m.a, m.b, rad, 0.6+rad))
    x=colorsys.hsv_to_rgb(rad, 1, 0.1+ mag)
    #feedRunner(l, nLEDs, [255*x[0], 255*x[1], 255*x[2]])
    for n in range (nLEDs):
        l.setPixel(n, corrected([255*x[0], 255*x[1], 255*x[2]]))
    l.update()


def serve_osc(l, sharedMindState, setting):
    m = mind() # local copy of shared state
    c = mind() # current value which was set already
    print("Drawing")
    i=0
    unchangedSince = 0
    nLEDs  = int(setting.leds)
    nSpecial = int(setting.specialLeds)

    progstart = time.time()
    boxtime = 0

    while setting.running:
        update = True

        drawRandomBox = True

        ups    = int(setting.ups)
        change = setting.change
        timeout= int(setting.timeout)
        satLimit= setting.satlimit
        value  = setting.value
        print_time = int(time.time())

        m.program = sharedMindState.program
        m.a = sharedMindState.a
        m.b = sharedMindState.b

        m.att = sharedMindState.att
        m.med = sharedMindState.med
        m.sig = sharedMindState.sig
        m.t   = sharedMindState.t
        m.state = sharedMindState.state

        try:
            if m.a <0:
                m.a = abs(m.a)
            if m.a > 1:
                m.a = 1
            #if m.a < 0:
            #    m.a = 0

            if m.b <0:
                m.b = abs(m.b)
            if m.b > 1:
                m.b = 1
            #if m.b < 0:
            #    m.b = 0

            if c.program != m.program:
                c.program = m.program
                progstart = time.time()
                print("starting program {0}\n".format(c.program))

            if m.program == 10:
                #i=i+1
                #if i%ups == 0:
                #    print("sec is over {0} unchanged {1} attention {2} meditation {3} "
                #          "signal {4} update {5} change {6} satLimit {7} value {8} "
                #          .format(i, unchangedSince, m.att, m.med, m.sig, ups, change, satLimit, value))

                if c.att > m.att:
                    c.att = c.att-change
                    if c.att < 0:
                        c.att = 0
                    elif c.att < m.att:
                        c.att = m.att
                elif c.att < m.att:
                    c.att = c.att+change
                    if c.att > 1:
                        c.att = 1
                    elif c.att > m.att:
                        c.att = m.att
                else:
                    update = False

                if c.med > m.med:
                    c.med = c.med-change
                    if c.med < 0:
                        c.med = 0
                    elif c.med < m.med:
                        c.med = m.med
                elif c.med < m.med:
                    c.med = c.med+change
                    if c.med > 1:
                        c.med = 1
                    elif c.med > m.med:
                        c.med = m.med
                # no else cause if update is either still true
                # and thus change is warranted or false alread

                if not update:
                    unchangedSince = unchangedSince + 1
                else:
                    unchangedSince = 0

                c.sig = m.sig
                c.t   = datetime.now()

                if m.state != MW_NONE:
                    if timeout and (c.t-m.t).seconds > timeout:
                        updateStringNoData(l, nLEDs)
                    else:
                        updateStringState(m.state)
                elif c.sig == 0:
                    updateStringNoData(l, nLEDs)
                    #updateStringOffline(l, nLEDs)
                else:
                    if timeout and (c.t-m.t).seconds > timeout:
                        updateStringNoData(l, nLEDs)
                        #updateStringOffline(l, nLEDs)
                    else:
                        updateStringByM(l,c, nLEDs, satLimit, value)

                time.sleep(1/ups)
            elif m.program == 1:
                dur = time.time()-progstart
                if dur > 60:
                    dur = 60
                updateStringAB(l, m, nLEDs, dur/60)
            elif m.program == 0:
                #m.a = 0
                #m.b = 1
                updateStringAB(l, m, nLEDs, 1)
                if int(time.time()) != print_time:
                    print("a {0}  b {1}\n".format(m.a, m.b))
                    print_time = time.time()
                time.sleep(0.01)
            elif m.program == 3:
                dur = time.time()-progstart
                if dur > 30:
                    dur = 30
                updateStringAB(l, m, nLEDs, 1-dur/30)
            elif m.program > 3:
                drawRandomBox = False
                updateStringOff(l)
                drawBox(l, nLEDs, nSpecial, m.program - 3)
                #print("placeholder for state 4")

            if drawRandomBox:
                if time.time()-boxtime > 3:
                    boxtime = time.time()
                    drawBox(l, nLEDs, nSpecial, random.randrange(6))
        except ValueError:
            pass

    print("thread exited")
    sys.stdout.flush()

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument("--ip", default="10.0.1.255", help="The ip to listen on")
  parser.add_argument("--port", type=int, default=9000, help="The port to listen on")
  parser.add_argument("--leds", type=int, default=250, help="The number of adressable leds")
  # 190 looks ok with --change 0.001234
  parser.add_argument("--ups", type=float, default=50, help="Leds updates per second, if < 0 more than a second")
  parser.add_argument("--change", type=float, default=0.01234, help="Maximum change per led update")
  parser.add_argument("--timeout", type=float, default=4, help="Number of seconds before we detect no signal while signal=1")
  # good limiter default 0.76923076923
  parser.add_argument("--satlimit", type=float, default=0.5050505, help="saturation limit (value*limit)")
  parser.add_argument("--value", type=float, default=1, help="third component of color scheme (saturation)")
  parser.add_argument("--specialLeds", type=int, default=1, help="special leds")
  args = parser.parse_args()

  setting = setting(args.timeout, args.leds, args.ups, args.change, args.satlimit, args.value, args.specialLeds)

  sharedMindState = mind()

  disp = dispatcher.Dispatcher()

  # handlers for mindwave signals
  # disp.map("/mindwave/1/signal",     mindwave_handler, sharedMindState, "sig")
  # disp.map("/mindwave/1/attention",  mindwave_handler, sharedMindState, "att")
  # disp.map("/mindwave/1/meditation", mindwave_handler, sharedMindState, "med")

  disp.map("/muse/elements/touching_forehead",     mindwave_handler, sharedMindState, "sig")
  disp.map("/muse/elements/experimental/concentration",  mindwave_handler, sharedMindState, "att")
  disp.map("/muse/elements/experimental/mellow", mindwave_handler, sharedMindState, "med")

  disp.map("/sean/alpha",       mindwave_handler, sharedMindState, "a")
  disp.map("/sean/beta",       mindwave_handler, sharedMindState, "b")
  #disp.map("/sean/alphaavg",       mindwave_handler, sharedMindState, "a")
  #disp.map("/sean/betaavg",       mindwave_handler, sharedMindState, "b")
  disp.map("/sean/phase", mindwave_handler, sharedMindState, "program")

  disp.map("/mindwave/1/boot",     mindwave_handler_state, sharedMindState, MW_BOOT)
  disp.map("/mindwave/1/scanning", mindwave_handler_state, sharedMindState, MW_SCANNING)
  disp.map("/mindwave/1/denied",   mindwave_handler_state, sharedMindState, MW_DENIED)
  client = UDPClient(args.ip, args.port)
  send_settings(client, setting)

  dmx = None
  try:
      dmx = DmxPy('/dev/serial/by-id/usb-DMXking.com_DMX_USB_PRO_6AYP9P66-if00-port0')
  except:
      print("no dmx")

  server = osc_server.ThreadingOSCUDPServer((args.ip, args.port), disp)
  # handlers for settings
  disp.map("/led/settings", setting_request_handler, client, setting)
  disp.map("/led/settings/timeout", setting_handler, server, setting, "timeout")
  disp.map("/led/settings/updates", setting_handler, server, setting, "ups")
  disp.map("/led/settings/change", setting_handler, server, setting, "change")
  disp.map("/led/settings/leds", setting_handler_restart, server, setting, "leds")
  disp.map("/led/settings/satlimit", setting_handler, server, setting, "satlimit")
  disp.map("/led/settings/value", setting_handler, server, setting, "value")

  if dmx is not None:
      disp.map("/strobe/1", strobe_handler, dmx)
      disp.map("/strobe/1/oneshot", strobe_oneshothandler, dmx)
      disp.map("/storbe/1/burst", strobe_bursthandler, dmx)

  running = True
  while running:
      setting.running = True
      print("Settings choosen:")
      print("updates per second    : {0}\n"
            "Max change per update : {1}\n"
            "Timeout               : {2}\n"
            "Number of leds        : {3}\n"
            "Saturation limit      : {4}\n"
            "value                 : {5}\n"
            "has strobe            : {6}\n"
            .format(setting.ups, setting.change, setting.timeout, setting.leds, setting.satlimit, setting.value, (dmx is not None)))

      l = LedStrip_WS2801(int(setting.leds+setting.specialLeds))

      if dmx is not None:
          dmx.blackout()
          dmx.render()

      t = threading.Thread(name="led thread", target=serve_osc, args = (l, sharedMindState, setting))
      t.daemon = True

      sharedMindState.t = datetime.now()
      t.start()

      print("Serving on {}".format(server.server_address))
      sys.stdout.flush()
      try:
          server.serve_forever()
      except KeyboardInterrupt:
          running = False
          server.shutdown()
          print("Bye")

      setting.running = False
      t.join(5)
      updateStringOff(l)
      l.close()

      if dmx is not None:
          dmx.blackout()
          dmx.render()

      print("End of loop, reinit={0}".format(running))
      sys.stdout.flush()
  print("-- Bye --")
  sys.stdout.flush()
