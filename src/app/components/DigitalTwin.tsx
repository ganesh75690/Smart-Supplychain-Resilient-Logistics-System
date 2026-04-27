import { Cpu, Layers, Network, Zap, TrendingUp, Activity, MapPin, AlertTriangle, Play, Pause, RefreshCw, Navigation, BarChart3, Wind, CloudRain, Car } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Shipment {
  id: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  current: { lat: number; lng: number };
  status: 'in-transit' | 'delayed' | 'delivered';
  progress: number;
  risk: 'low' | 'medium' | 'high';
  estimatedArrival: string;
  vehicle: {
    type: string;
    plateNumber: string;
    driver: string;
    capacity: string;
    currentLoad: string;
  };
  stock: {
    productType: string;
    quantity: number;
    weight: string;
    value: string;
    urgency: 'low' | 'medium' | 'high';
  };
}

interface RiskZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  type: 'traffic' | 'weather' | 'accident';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  impact: {
    delayIncrease: number;
    costImpact: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

const shipments: Shipment[] = [
  {
    id: 'S001',
    origin: { lat: 19.0760, lng: 72.8777, name: 'Mumbai Warehouse' },
    destination: { lat: 28.6139, lng: 77.2090, name: 'Delhi Distribution Center' },
    current: { lat: 22.7196, lng: 75.8577 },
    status: 'in-transit',
    progress: 65,
    risk: 'low',
    estimatedArrival: '2:45 PM',
    vehicle: {
      type: 'Heavy Truck - 18 Wheeler',
      plateNumber: 'MH-01-AB-1234',
      driver: 'Rajesh Kumar',
      capacity: '25 Tons',
      currentLoad: '16.5 Tons (66%)'
    },
    stock: {
      productType: 'Electronics & Appliances',
      quantity: 450,
      weight: '16.5 Tons',
      value: '₹2.8 Crore',
      urgency: 'medium'
    }
  },
  {
    id: 'S002',
    origin: { lat: 12.9716, lng: 77.5946, name: 'Bangalore Factory' },
    destination: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad Retail Hub' },
    current: { lat: 15.3173, lng: 75.7139 },
    status: 'delayed',
    progress: 40,
    risk: 'high',
    estimatedArrival: '4:30 PM',
    vehicle: {
      type: 'Medium Truck - 12 Wheeler',
      plateNumber: 'KA-05-CD-5678',
      driver: 'Suresh Reddy',
      capacity: '10 Tons',
      currentLoad: '7.2 Tons (72%)'
    },
    stock: {
      productType: 'Pharmaceutical Supplies',
      quantity: 280,
      weight: '7.2 Tons',
      value: '₹1.5 Crore',
      urgency: 'high'
    }
  },
  {
    id: 'S003',
    origin: { lat: 22.5726, lng: 88.3639, name: 'Kolkata Port' },
    destination: { lat: 26.9124, lng: 75.7873, name: 'Jaipur Warehouse' },
    current: { lat: 24.5854, lng: 82.5748 },
    status: 'in-transit',
    progress: 55,
    risk: 'medium',
    estimatedArrival: '3:15 PM',
    vehicle: {
      type: 'Container Truck - 22 Wheeler',
      plateNumber: 'WB-12-EF-9012',
      driver: 'Amit Sharma',
      capacity: '20 Tons',
      currentLoad: '11 Tons (55%)'
    },
    stock: {
      productType: 'Textile & Garments',
      quantity: 650,
      weight: '11 Tons',
      value: '₹3.2 Crore',
      urgency: 'low'
    }
  }
];

const riskZones: RiskZone[] = [
  {
    id: 'R001',
    lat: 21.1466,
    lng: 79.0882,
    radius: 150,
    type: 'traffic',
    severity: 'high',
    description: 'Heavy traffic congestion on Mumbai-Pune Expressway'
  },
  {
    id: 'R002',
    lat: 13.0827,
    lng: 80.2707,
    radius: 120,
    type: 'weather',
    severity: 'medium',
    description: 'Monsoon rains in Chennai region'
  },
  {
    id: 'R003',
    lat: 28.7041,
    lng: 77.1025,
    radius: 80,
    type: 'accident',
    severity: 'low',
    description: 'Minor accident cleared on NH-44'
  }
];

const simulationScenarios: SimulationScenario[] = [
  {
    id: 'SIM001',
    name: 'Road Blockage',
    description: 'What if Highway 101 is blocked?',
    impact: {
      delayIncrease: 45,
      costImpact: 12.5,
      riskLevel: 'high'
    }
  },
  {
    id: 'SIM002',
    name: 'Demand Surge',
    description: 'What if demand increases by 40%?',
    impact: {
      delayIncrease: 25,
      costImpact: 8.3,
      riskLevel: 'medium'
    }
  },
  {
    id: 'SIM003',
    name: 'Fuel Price Increase',
    description: 'What if fuel prices rise 30%?',
    impact: {
      delayIncrease: 5,
      costImpact: 18.7,
      riskLevel: 'low'
    }
  }
];

const aiSuggestions = [
  {
    id: 'AI001',
    priority: 'high',
    title: 'Reroute Shipment S002',
    description: 'Avoid traffic congestion by using alternative Route B',
    impact: 'Save 45 minutes, reduce fuel cost by 8%',
    confidence: 94
  },
  {
    id: 'AI002',
    priority: 'medium',
    title: 'Consolidate Shipments',
    description: 'Combine S001 and S003 at checkpoint C',
    impact: 'Reduce total distance by 22km, save ₹340',
    confidence: 87
  },
  {
    id: 'AI003',
    priority: 'low',
    title: 'Adjust Delivery Windows',
    description: 'Shift non-urgent deliveries to off-peak hours',
    impact: 'Improve on-time rate by 12%',
    confidence: 76
  }
];

export function DigitalTwin() {
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [animatedPositions, setAnimatedPositions] = useState<{[key: string]: {lat: number, lng: number}}>({});
  const mapRef = useRef<any>(null);

  // Animate shipment positions
  useEffect(() => {
    if (isSimulationRunning) {
      let progress = 0;
      const interval = setInterval(() => {
        setAnimatedPositions(prev => {
          const newPositions = { ...prev };
          shipments.forEach(shipment => {
            // Slow, gradual progress from 0 to 1
            progress = (progress + 0.005) % 1;
            
            // Calculate position following the polyline path with intermediate waypoint
            let lat, lng;
            if (progress < 0.5) {
              // First half: origin to current position
              const firstHalfProgress = progress * 2;
              lat = shipment.origin.lat + (shipment.current.lat - shipment.origin.lat) * firstHalfProgress;
              lng = shipment.origin.lng + (shipment.current.lng - shipment.origin.lng) * firstHalfProgress;
            } else {
              // Second half: current position to destination
              const secondHalfProgress = (progress - 0.5) * 2;
              lat = shipment.current.lat + (shipment.destination.lat - shipment.current.lat) * secondHalfProgress;
              lng = shipment.current.lng + (shipment.destination.lng - shipment.current.lng) * secondHalfProgress;
            }
            
            newPositions[shipment.id] = { lat, lng };
          });
          return newPositions;
        });
      }, 150); // Update every 150ms for smooth movement
      
      return () => clearInterval(interval);
    }
  }, [isSimulationRunning]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500/20 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'high': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-slate-500/20 border-slate-500/50';
    }
  };

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'traffic': return <Car className="w-4 h-4" />;
      case 'weather': return <CloudRain className="w-4 h-4" />;
      case 'accident': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Layers className="w-6 h-6 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Digital Twin Live</h2>
            <p className="text-xs text-slate-400">Real-time supply chain virtualization & simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-medium">Live Sync Active</span>
          </div>
          <button
            onClick={() => setIsSimulationRunning(!isSimulationRunning)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              isSimulationRunning 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-green-500/10 border-green-500/30 text-green-400'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs font-medium">
              {isSimulationRunning ? 'Pause Simulation' : 'Run Simulation'}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Interactive Map - Main Feature */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Live Supply Chain Map
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Real-time Updates
            </div>
          </div>

          {/* India Map Container */}
          <div className="relative h-96 bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden">
            <MapContainer
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Risk Zones */}
              {riskZones.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius * 1000}
                  pathOptions={{
                    color: zone.severity === 'high' ? '#ef4444' :
                           zone.severity === 'medium' ? '#eab308' : '#22c55e',
                    fillColor: zone.severity === 'high' ? '#ef4444/20' :
                             zone.severity === 'medium' ? '#eab308/20' : '#22c55e/20',
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <div className="font-semibold">{zone.description}</div>
                      <div className="text-slate-400">Type: {zone.type}</div>
                      <div className="text-slate-400">Severity: {zone.severity}</div>
                    </div>
                  </Popup>
                </Circle>
              ))}

              {/* Shipments */}
              {shipments.map((shipment) => (
                <div key={shipment.id}>
                  {/* Origin Marker */}
                  <Marker position={[shipment.origin.lat, shipment.origin.lng]}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-semibold">{shipment.origin.name}</div>
                        <div className="text-slate-400">Origin</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination Marker */}
                  <Marker position={[shipment.destination.lat, shipment.destination.lng]}>
                    <Popup>
                      <div className="text-xs">
                        <div className="font-semibold">{shipment.destination.name}</div>
                        <div className="text-slate-400">Destination</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Current Position Marker */}
                  <Marker 
                    position={[animatedPositions[shipment.id]?.lat || shipment.current.lat, animatedPositions[shipment.id]?.lng || shipment.current.lng]}
                    icon={L.divIcon({
                      className: 'custom-marker',
                      html: `<div class="w-4 h-4 rounded-full border-2 ${
                        shipment.status === 'delayed' ? 'bg-red-500 border-red-300 animate-pulse' :
                        shipment.status === 'delivered' ? 'bg-green-500 border-green-300' :
                        'bg-cyan-500 border-cyan-300 animate-pulse'
                      }" />`,
                      iconSize: [16, 16],
                      iconAnchor: [8, 8]
                    })}
                  >
                    <Popup>
                      <div className="text-xs space-y-2">
                        <div className="font-semibold text-white border-b border-slate-600 pb-1">{shipment.id}</div>
                        
                        {/* Vehicle Details */}
                        <div className="bg-slate-800/50 rounded p-2">
                          <div className="font-medium text-blue-400 mb-1">🚛 Vehicle Details</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Type:</span>
                              <span className="text-white">{shipment.vehicle.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Plate:</span>
                              <span className="text-white">{shipment.vehicle.plateNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Driver:</span>
                              <span className="text-white">{shipment.vehicle.driver}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Load:</span>
                              <span className="text-white">{shipment.vehicle.currentLoad}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stock Details */}
                        <div className="bg-slate-800/50 rounded p-2">
                          <div className="font-medium text-green-400 mb-1">📦 Stock Details</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Product:</span>
                              <span className="text-white">{shipment.stock.productType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Quantity:</span>
                              <span className="text-white">{shipment.stock.quantity} units</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Weight:</span>
                              <span className="text-white">{shipment.stock.weight}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Value:</span>
                              <span className="text-white font-medium">{shipment.stock.value}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Urgency:</span>
                              <span className={`font-medium ${
                                shipment.stock.urgency === 'high' ? 'text-red-400' :
                                shipment.stock.urgency === 'medium' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {shipment.stock.urgency.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Route Info */}
                        <div className="pt-2 border-t border-slate-600">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className={`font-medium ${
                              shipment.status === 'delayed' ? 'text-red-400' :
                              shipment.status === 'delivered' ? 'text-green-400' :
                              'text-cyan-400'
                            }`}>
                              {shipment.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">ETA:</span>
                            <span className="text-white">{shipment.estimatedArrival}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Risk:</span>
                            <span className={`font-medium ${
                              shipment.risk === 'high' ? 'text-red-400' :
                              shipment.risk === 'medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {shipment.risk}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route Line */}
                  <Polyline
                    positions={[
                      [shipment.origin.lat, shipment.origin.lng],
                      [shipment.current.lat, shipment.current.lng],
                      [shipment.destination.lat, shipment.destination.lng]
                    ]}
                    pathOptions={{
                      color: shipment.status === 'delayed' ? '#ef4444' : '#06b6d4',
                      weight: 2,
                      opacity: 0.6,
                      dashArray: '5, 5'
                    }}
                  />
                </div>
              ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 z-10">
              <div className="text-xs font-semibold text-white mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Origin
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Destination
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  Current Position
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Risk Zone
                </div>
              </div>
            </div>
          </div>

          {/* Selected Shipment Details */}
          {selectedShipment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              {(() => {
                const shipment = shipments.find(s => s.id === selectedShipment);
                if (!shipment) return null;
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{shipment.id}</div>
                      <div className="text-xs text-slate-400">
                        {shipment.origin.name} → {shipment.destination.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        shipment.status === 'delayed' ? 'text-red-400' :
                        shipment.status === 'delivered' ? 'text-green-400' :
                        'text-cyan-400'
                      }`}>
                        {shipment.status}
                      </div>
                      <div className="text-xs text-slate-400">ETA: {shipment.estimatedArrival}</div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Simulation and Impact Metrics Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Panel */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            What-If Simulation
          </h3>
          <div className="space-y-3">
            {simulationScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-purple-500/10 border-purple-500/50'
                    : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">{scenario.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    scenario.impact.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                    scenario.impact.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {scenario.impact.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{scenario.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Delay: </span>
                    <span className="text-white font-medium">+{scenario.impact.delayIncrease}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Cost: </span>
                    <span className="text-white font-medium">+{scenario.impact.costImpact}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Impact Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-400">Delay Increase</span>
              <span className="text-lg font-bold text-red-400">+{selectedScenario ? simulationScenarios.find(s => s.id === selectedScenario)?.impact.delayIncrease : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-400">Cost Impact</span>
              <span className="text-lg font-bold text-yellow-400">+${selectedScenario ? simulationScenarios.find(s => s.id === selectedScenario)?.impact.costImpact : 0}K</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-400">Risk Level</span>
              <span className={`text-lg font-bold ${
                selectedScenario && simulationScenarios.find(s => s.id === selectedScenario)?.impact.riskLevel === 'high' ? 'text-red-400' :
                selectedScenario && simulationScenarios.find(s => s.id === selectedScenario)?.impact.riskLevel === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {selectedScenario ? simulationScenarios.find(s => s.id === selectedScenario)?.impact.riskLevel?.toUpperCase() : 'LOW'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          AI Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiSuggestions.map((suggestion, idx) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border ${
                suggestion.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                suggestion.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {suggestion.priority.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">{suggestion.confidence}% confidence</span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-2">{suggestion.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{suggestion.description}</p>
              <div className="text-xs text-green-400 font-medium">{suggestion.impact}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
