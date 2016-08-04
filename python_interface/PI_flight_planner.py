import urllib
from XPLMPlugin import *
from XPLMProcessing import *
from XPLMDataAccess import *
from XPLMDefs import *

class PythonInterface:
  def XPluginStart(self):
    self.Name = "Flight Planner"
    self.Sig = "OndrejBrinkel.Python.X-Plane-Flight-Planner"
    self.Desc = "Provides in game connection to the X-Plane Flight Planner."
    return self.Name, self.Sig, self.Desc

  def XPluginStop(self):
    XPLMUnregisterFlightLoopCallback(self,self.FlightLoopCB,0)
    pass

  def XPluginEnable(self):
    self.FlightLoopCB = self.Update
    XPLMRegisterFlightLoopCallback(self,self.FlightLoopCB,1.0,0)
    return 1

  def XPluginDisable(self):
    XPLMUnregisterFlightLoopCallback(self,self.FlightLoopCB,0)

  def XPluginReceiveMessage(self, inFromWho, inMessage, inParam):
    pass

  def Update(self,inFlightLoopCallback, inInterval,inRelativeToNow, inRefcon):
    lat_dref = XPLMFindDataRef('sim/flightmodel/position/latitude')
    lon_dref = XPLMFindDataRef('sim/flightmodel/position/longitude')
    heading_dref = XPLMFindDataRef('sim/flightmodel/position/psi')
    lat = XPLMGetDatad(lat_dref)
    lon = XPLMGetDatad(lon_dref)
    heading = XPLMGetDataf(heading_dref)

    try:
      sock = urllib.urlopen('http://localhost:3001?lat='+str(lat)+'&lon='+str(lon)+'&heading='+str(heading))
      sock.close()
    except:
      pass

    return 0.5
