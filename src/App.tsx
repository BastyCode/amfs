import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Package, Plus, X, Undo2, ArrowUpRight, ArrowDownRight, AlertTriangle, History } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { cn } from "@/lib/utils";

// --- Types ---
type View = "accesspoint" | "productos";

interface Components {
  nucSerial: string;
  chipPhone: string;
  bam: string;
  printerSerial: string;
  monitorSerial: string;
  buttonId: string;
  videoActive: string;
}

interface Equipment {
  id: string;
  observations: string;
  canType: string;
  status: string;
  country: string;
  canId: string;
  totemId: string;
  dongleId: string;
  appVersion: string;
  operationStart: string;
  mueble?: string;
  clientId?: string;
  components: Components;
}

// --- Data Inventory ---

const countries = ["Chile", "España", "México", "Perú", "Argentina"];
const appVersions = ["5.8.1.0", "6.7.0.0", "7.0.0.1", "2.1.0", "2.0.1"];
const canTypes = ["Lata chica stout", "Lata blanca", "LATA PLOMA ANTIGUA", "Standard", "Premium"];

const dongles = {
  "TDC3-6689": { license: "W03663_044", term: "2026-12-13" },
  "TDC3-6157": { license: "W03663_003", term: "2026-12-05" },
  "D-101": { license: "Pro", term: "2025-12-31" },
};

const clients = {
  "23": { name: "Acme Corp", location: "New York" },
  "C-02": { name: "Globex", location: "London" },
  "C-01": { name: "Demo Chile", location: "Santiago" },
};

const totemToClient: Record<string, string> = {
  "122": "23",
  "3": "C-01",
};

const inventory = {
  nucs: {
    "G6BN851004V6": { model: "NUC75BNH", windows: "PJJWN-K09B4-VMWT4..." },
    "DELL-9921": { model: "NUC-DELL-X1", windows: "W10-PRO-ABCD..." },
  },
  chips: {
    "956488121": { company: "Movistar" },
    "988223344": { company: "Entel" },
    "977556677": { company: "Claro" },
  },
  bams: ["ZTE", "Huawei", "D-Link"],
  printers: {
    "X7A1404396": { model: "Epson TM-T20II" },
    "HP-887722": { model: "HP-Thermal-V2" },
  },
  monitors: {
    "R7UMTF199839": { model: "LG 32\"" },
    "SAM-445566": { model: "Samsung 27\"" },
  },
  buttons: ["Botón AP0524", "Botón BT-99", "Botón Universal"]
};

const initialEquipments: Equipment[] = [
  {
    id: "96",
    observations: "Se dejó configurado sin alcotest",
    canType: "LATA PLOMA ANTIGUA",
    status: "Proceso de devolución",
    country: "España",
    canId: "96", // ID Excel Interno
    totemId: "122", // Número AP (Totem)
    dongleId: "TDC3-6157",
    appVersion: "6.7.0.0",
    operationStart: "2023-12-04",
    mueble: "Viejo",
    components: {
      nucSerial: "G6BN851004V6",
      chipPhone: "956488121",
      bam: "ZTE",
      printerSerial: "X7A1404396",
      monitorSerial: "R7UMTF199839",
      buttonId: "Botón AP0524",
      videoActive: "NO"
    }
  },
  {
    id: "3",
    observations: "DEMO OFICINA",
    canType: "Standard",
    status: "Activo",
    country: "Chile",
    canId: "3",
    totemId: "3",
    dongleId: "TDC3-6689",
    appVersion: "5.8.1.0",
    operationStart: "2025-12-12",
    mueble: "Nuevo",
    components: {
      nucSerial: "G6BN851004V6",
      chipPhone: "988223344",
      bam: "ZTE",
      printerSerial: "X7A1404396",
      monitorSerial: "SAM-445566",
      buttonId: "Botón BT-99",
      videoActive: "SI"
    }
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("accesspoint");
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEq, setNewEq] = useState({
    canId: "",
    totemId: "",
    observations: "",
    country: "Chile",
    canType: "Lata chica stout",
    status: "Activo",
    dongleId: "",
    appVersion: appVersions[0],
    nucSerial: "",
    printerSerial: "",
    monitorSerial: "",
    videoActive: "NO",
    buttonId: "",
    mueble: "Nuevo",
    clientId: ""
  });

  // --- Consumables State ---
  const [consumables, setConsumables] = useState([
    { id: "1", name: "Flyers Informativos", stock: 1500, minThreshold: 300, unit: "unidades", category: "Marketing" },
    { id: "2", name: "Cascarillas de Alcotest", stock: 45, minThreshold: 100, unit: "unidades", category: "Insumos" },
    { id: "3", name: "Máscaras Frontales", stock: 12, minThreshold: 5, unit: "unidades", category: "Repuestos" },
  ]);

  const handleShipConsumable = (id: string, amount: number) => {
    setConsumables(prev => prev.map(c => 
      c.id === id ? { ...c, stock: Math.max(0, c.stock - amount) } : c
    ));
  };

  const handleAddStock = (id: string, amount: number) => {
    setConsumables(prev => prev.map(c => 
      c.id === id ? { ...c, stock: c.stock + amount } : c
    ));
  };

  const handleUpdate = (id: string, field: string, value: string) => {
    setEquipments((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, [field]: value } : eq))
    );
  };

  const handleCreate = () => {
    if (!newEq.totemId || !newEq.canId) {
      alert("Por favor completa el Número de Totem y el Número de Lata.");
      return;
    }
    const id = Date.now().toString();
    const equipment: Equipment = {
      id,
      canId: newEq.canId,
      totemId: newEq.totemId,
      observations: newEq.observations,
      country: newEq.country,
      canType: newEq.canType,
      status: newEq.status,
      dongleId: newEq.dongleId,
      appVersion: newEq.appVersion,
      operationStart: new Date().toISOString().split('T')[0],
      mueble: newEq.mueble,
      clientId: newEq.clientId || totemToClient[newEq.totemId] || "",
      components: {
        nucSerial: newEq.nucSerial,
        chipPhone: "",
        bam: "",
        printerSerial: newEq.printerSerial,
        monitorSerial: newEq.monitorSerial,
        buttonId: newEq.buttonId,
        videoActive: newEq.videoActive
      }
    };
    setEquipments(prev => [equipment, ...prev]);
    setIsModalOpen(false);
    setNewEq({ 
      canId: "", 
      totemId: "", 
      observations: "", 
      country: "Chile", 
      canType: "Lata chica stout", 
      status: "Activo", 
      dongleId: "",
      appVersion: appVersions[0],
      nucSerial: "",
      printerSerial: "",
      monitorSerial: "",
      videoActive: "NO",
      buttonId: "",
      mueble: "Nuevo",
      clientId: ""
    });
  };

  const handleReturnAP = (id: string) => {
    if (window.confirm("¿Estás seguro de devolver este Accesspoint completo? Se retirarán todos los componentes asociados.")) {
      setEquipments(prev => prev.map(eq => 
        eq.id === id 
          ? { 
              ...eq, 
              status: "Reciclaje",
              dongleId: "",
              components: {
                nucSerial: "",
                chipPhone: "",
                bam: "",
                printerSerial: "",
                monitorSerial: "",
                buttonId: "",
                videoActive: "NO"
              }
            } 
          : eq
      ));
    }
  };

  const handleReturnComponent = (eqId: string, field: string) => {
    setEquipments(prev => prev.map(eq => 
      eq.id === eqId 
        ? { 
            ...eq, 
            components: { ...eq.components, [field]: "" } 
          } 
        : eq
    ));
  };

  const handleComponentUpdate = (eqId: string, field: string, value: string) => {
    setEquipments((prev) =>
      prev.map((eq) => 
        eq.id === eqId 
          ? { ...eq, components: { ...eq.components, [field]: value } } 
          : eq
      )
    );
  };

  const filteredEquipments = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    
    return equipments.filter((eq) => {
      const dongleData = dongles[eq.dongleId as keyof typeof dongles] || { license: "", term: "" };
      const derivedClientId = totemToClient[eq.totemId] || "";
      const clientData = clients[derivedClientId as keyof typeof clients] || { name: "", location: "" };
      const nucData = inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs] || { model: "", windows: "" };
      const chipData = inventory.chips[eq.components.chipPhone as keyof typeof inventory.chips] || { company: "" };
      const printerData = inventory.printers[eq.components.printerSerial as keyof typeof inventory.printers] || { model: "" };
      const monitorData = inventory.monitors[eq.components.monitorSerial as keyof typeof inventory.monitors] || { model: "" };
      const wifi = eq.canId ? `ap${eq.canId.padStart(2, '0')}` : "";

      // Flatten all searchable values into an array
      const searchableValues = [
        eq.id,
        eq.observations,
        eq.canType,
        eq.status,
        eq.country,
        eq.canId,
        eq.totemId,
        eq.dongleId,
        dongleData.license,
        dongleData.term,
        derivedClientId,
        clientData.name,
        clientData.location,
        eq.appVersion,
        eq.operationStart,
        eq.components.chipPhone,
        chipData.company,
        eq.components.bam,
        wifi,
        nucData.model,
        eq.components.nucSerial,
        nucData.windows,
        printerData.model,
        eq.components.printerSerial,
        monitorData.model,
        eq.components.monitorSerial,
        eq.components.videoActive,
        eq.components.buttonId
      ];

      const matchesSearch = searchQuery === "" || searchableValues.some(val => 
        val && val.toString().toLowerCase().includes(searchLower)
      );

      const matchesStatus = statusFilter === "All" || eq.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [equipments, searchQuery, statusFilter]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(["Activo", "Demo", "En Mantención", "Proceso de devolución"]);
    equipments.forEach(eq => {
      if (eq.status) statuses.add(eq.status);
    });
    return ["All", ...Array.from(statuses).sort()];
  }, [equipments]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles: " + text);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1c23] text-slate-300 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-xs font-bold text-white">BJ</div>
          <div>
            <div className="text-sm font-semibold text-white">Bastian Jimenez</div>
            <div className="text-[10px] text-slate-500">Programador</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            PERFILES
          </div>
          <div className="px-4 mb-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            OPERACIONES
          </div>
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            INVENTARIO
          </div>
          <ul className="space-y-1">
            <li><button onClick={() => setCurrentView("accesspoint")} className={cn("w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 transition-colors", currentView === "accesspoint" ? "bg-slate-800 text-white border-l-4 border-emerald-500" : "text-slate-400")}>Accesspoint</button></li>
            <li><button onClick={() => setCurrentView("productos")} className={cn("w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-800 transition-colors", currentView === "productos" ? "bg-slate-800 text-white border-l-4 border-emerald-500" : "text-slate-400")}>Productos (Insumos)</button></li>
            <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Mantenedor</a></li>
            <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Codigos FAN</a></li>
            <li><a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Reciclaje</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === "accesspoint" ? (
          <>
            {/* Topbar */}
            <header className="h-20 bg-white border-b flex flex-col justify-center px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Visualización de equipos y componentes</h2>
                  <p className="text-xs text-slate-500">Listado de AccessPoint activos</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Mostrar</span>
                    <Select defaultValue="25">
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 h-8 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
                    <Plus size={14} className="mr-1.5" /> Nuevo Equipo
                  </Button>
                </div>
              </div>
            </header>
            
            {/* Rest of Accesspoint View (Filters and Table) */}
            <div className="px-6 py-4 bg-white border-b flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Estado:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar en columnas..."
                  className="pl-9 h-8 w-64 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {/* Table logic here (already implemented) */}
              <div className="bg-white rounded-lg border shadow-sm min-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="min-w-[150px] text-xs uppercase font-bold text-slate-600">Observaciones generales</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">Tipo de Lata</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">Estado</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">País</TableHead>
                      <TableHead className="min-w-[100px] text-xs uppercase font-bold text-slate-600">Id Excel Interno</TableHead>
                      <TableHead className="min-w-[100px] text-xs uppercase font-bold text-slate-600">Número AP (Totem)</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">N° Dongle</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">Licencia</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">Fecha Término Lic.</TableHead>
                      <TableHead className="min-w-[100px] text-xs uppercase font-bold text-slate-600">ID Cliente</TableHead>
                      <TableHead className="min-w-[150px] text-xs uppercase font-bold text-slate-600">Nombre Cliente</TableHead>
                      <TableHead className="min-w-[150px] text-xs uppercase font-bold text-slate-600">Ubicación</TableHead>
                      <TableHead className="min-w-[100px] text-xs uppercase font-bold text-slate-600">Versión AP</TableHead>
                      <TableHead className="min-w-[120px] text-xs uppercase font-bold text-slate-600">Inicio de Operacion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipments.map((eq: Equipment) => {
                      const dongleData = dongles[eq.dongleId as keyof typeof dongles] || { license: "N/A", term: "N/A" };
                      const derivedClientId = eq.clientId || totemToClient[eq.totemId] || "N/A";
                      const clientData = clients[derivedClientId as keyof typeof clients] || { name: "N/A", location: "N/A" };
                      
                      return (
                        <React.Fragment key={eq.id}>
                          <TableRow className="hover:bg-slate-50/50 group">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setExpandedRow(expandedRow === eq.id ? null : eq.id)}
                              >
                                {expandedRow === eq.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-300 hover:text-red-500 transition-colors"
                                title="Devolver Accesspoint"
                                onClick={() => handleReturnAP(eq.id)}
                              >
                                <Undo2 size={14} />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={eq.observations}
                                onChange={(e) => handleUpdate(eq.id, "observations", e.target.value)}
                                className="h-8 text-xs border-transparent group-hover:border-slate-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Select value={eq.canType} onValueChange={(val) => handleUpdate(eq.id, "canType", val)}>
                                <SelectTrigger className="h-8 text-xs border-transparent group-hover:border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {canTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select value={eq.status} onValueChange={(val) => handleUpdate(eq.id, "status", val)}>
                                <SelectTrigger className={cn(
                                  "h-8 text-xs font-semibold px-3 rounded-full border-none w-max",
                                  eq.status === "Activo" ? "bg-emerald-100 text-emerald-700" : 
                                  eq.status === "Demo" ? "bg-blue-100 text-blue-700" :
                                  "bg-red-100 text-red-700"
                                )}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {uniqueStatuses.filter(s => s !== "All").map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                               <Select value={eq.country} onValueChange={(val) => handleUpdate(eq.id, "country", val)}>
                                <SelectTrigger className="h-8 text-xs border-transparent group-hover:border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input value={eq.canId} onChange={(e) => handleUpdate(eq.id, "canId", e.target.value)} className="h-8 text-xs border-transparent group-hover:border-slate-200 text-center" />
                            </TableCell>
                            <TableCell className="text-xs text-slate-600 text-center">{eq.totemId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Select value={eq.dongleId} onValueChange={(val) => handleUpdate(eq.id, "dongleId", val)}>
                                  <SelectTrigger className="h-8 text-xs border-transparent group-hover:border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.keys(dongles).map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-slate-300 hover:text-red-500" 
                                  title="Retirar Dongle"
                                  onClick={() => handleUpdate(eq.id, "dongleId", "")}
                                >
                                  <Undo2 size={12} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{dongleData.license}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{dongleData.term}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3 text-center font-medium">{derivedClientId}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{clientData.name}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{clientData.location}</TableCell>
                            <TableCell>
                              <Select value={eq.appVersion} onValueChange={(val) => handleUpdate(eq.id, "appVersion", val)}>
                                <SelectTrigger className={cn("h-8 text-xs border-transparent group-hover:border-slate-200 font-bold", eq.appVersion === "6.7.0.0" ? "text-red-600" : "text-slate-600")}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {appVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input type="date" value={eq.operationStart} onChange={(e) => handleUpdate(eq.id, "operationStart", e.target.value)} className="h-8 text-xs border-transparent group-hover:border-slate-200" />
                            </TableCell>
                          </TableRow>
                          
                          {expandedRow === eq.id && (
                            <TableRow className="bg-slate-50/30">
                              <TableCell colSpan={16} className="p-0 border-b">
                                <div className="px-10 py-6 bg-white border-l-4 border-slate-800 ml-4 mb-4 shadow-inner">
                                  <h4 className="text-sm font-bold mb-4 text-slate-800 flex items-center gap-2">
                                    <Package size={16} /> Componentes del AP {eq.canId}
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">N° Teléfono</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Chip</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Bam</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">WIFI</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">N° SERIE NUC</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">NUC</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">N° S WINDOWS 10</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Impresora</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">N° s Impresora</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Monitor</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">N° s Monitor</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">VIDEO ACTIVO</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Botón</TableHead>
                                          <TableHead className="h-8 text-[10px] uppercase font-bold">Mueble</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow className="hover:bg-transparent">
                                          {/* Chip Data */}
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.chipPhone} onValueChange={(val) => handleComponentUpdate(eq.id, "chipPhone", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {Object.keys(inventory.chips).map(phone => <SelectItem key={phone} value={phone}>{phone}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "chipPhone")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">
                                            {inventory.chips[eq.components.chipPhone as keyof typeof inventory.chips]?.company || "N/A"}
                                          </TableCell>
                                          
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.bam} onValueChange={(val) => handleComponentUpdate(eq.id, "bam", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {inventory.bams.map(bam => <SelectItem key={bam} value={bam}>{bam}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "bam")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50 font-medium">
                                            {eq.canId ? `ap${eq.canId.padStart(2, '0')}` : "N/A"}
                                          </TableCell>

                                          {/* CPU / NUC Data */}
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.nucSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "nucSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {Object.keys(inventory.nucs).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "nucSerial")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">
                                            {inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.model || "N/A"}
                                          </TableCell>
                                          <TableCell 
                                            className="py-3 text-xs text-slate-500 bg-slate-50 truncate max-w-[100px] cursor-pointer hover:text-blue-600 transition-colors" 
                                            title="Click para copiar"
                                            onClick={() => {
                                              const win = inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.windows;
                                              if (win) copyToClipboard(win);
                                            }}
                                          >
                                            {inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.windows || "N/A"}
                                          </TableCell>

                                          {/* Printer Data */}
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">
                                            {inventory.printers[eq.components.printerSerial as keyof typeof inventory.printers]?.model || "N/A"}
                                          </TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.printerSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "printerSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {Object.keys(inventory.printers).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "printerSerial")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>

                                          {/* Monitor Data */}
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">
                                            {inventory.monitors[eq.components.monitorSerial as keyof typeof inventory.monitors]?.model || "N/A"}
                                          </TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.monitorSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "monitorSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {Object.keys(inventory.monitors).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "monitorSerial")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>

                                          <TableCell className="py-3">
                                            <Select value={eq.components.videoActive} onValueChange={(val) => handleComponentUpdate(eq.id, "videoActive", val)}>
                                              <SelectTrigger className="h-7 text-xs border-slate-200">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="SI">SI</SelectItem>
                                                <SelectItem value="NO">NO</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </TableCell>

                                          {/* Button Data */}
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.buttonId} onValueChange={(val) => handleComponentUpdate(eq.id, "buttonId", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {inventory.buttons.map(btn => <SelectItem key={btn} value={btn}>{btn}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "buttonId")}>
                                                <Undo2 size={12} />
                                              </Button>
                                            </div>
                                          </TableCell>

                                          {/* Mueble Data */}
                                          <TableCell className="py-3">
                                            <Select value={eq.mueble || "Nuevo"} onValueChange={(val) => handleUpdate(eq.id, "mueble", val)}>
                                              <SelectTrigger className="h-7 text-xs border-slate-200">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Nuevo">Nuevo</SelectItem>
                                                <SelectItem value="Viejo">Viejo</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-auto">
            <header className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">Gestión de Productos e Insumos</h2>
              <p className="text-xs text-slate-500">Control de stock para artículos de despacho por lote (no retornables)</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {consumables.map(item => {
                const isCritical = item.stock <= item.minThreshold;
                const isWarning = item.stock <= item.minThreshold * 1.5 && !isCritical;
                
                return (
                  <div key={item.id} className={cn(
                    "bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md",
                    isCritical ? "border-red-200 ring-1 ring-red-50" : "border-slate-200"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        isCritical ? "bg-red-100 text-red-700" : 
                        isWarning ? "bg-amber-100 text-amber-700" : 
                        "bg-emerald-100 text-emerald-700"
                      )}>
                        {isCritical ? "Stock Crítico" : isWarning ? "Stock Bajo" : "Saludable"}
                      </div>
                    </div>

                    <div className="flex items-end gap-2 mb-6">
                      <span className={cn(
                        "text-3xl font-bold",
                        isCritical ? "text-red-600" : "text-slate-800"
                      )}>{item.stock.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 mb-1">{item.unit} disponibles</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          placeholder="Cantidad..." 
                          className="h-8 text-xs" 
                          id={`amount-${item.id}`}
                        />
                        <Button 
                          size="sm" 
                          className="h-8 bg-slate-800 hover:bg-slate-900 text-[10px] font-bold gap-1"
                          onClick={() => {
                            const input = document.getElementById(`amount-${item.id}`) as HTMLInputElement;
                            const val = parseInt(input.value);
                            if (val > 0) {
                              handleShipConsumable(item.id, val);
                              input.value = "";
                            }
                          }}
                        >
                          <ArrowUpRight size={12} /> DESPACHAR
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-[10px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-1"
                        onClick={() => {
                          const val = prompt("Cantidad a ingresar al stock:");
                          if (val && !isNaN(parseInt(val))) {
                            handleAddStock(item.id, parseInt(val));
                          }
                        }}
                      >
                        <ArrowDownRight size={12} /> INGRESAR A INVENTARIO
                      </Button>
                    </div>

                    {isCritical && (
                      <div className="mt-4 p-2 bg-red-50 rounded border border-red-100 flex items-center gap-2 text-[10px] text-red-600 font-medium">
                        <AlertTriangle size={12} /> Se requiere reposición inmediata
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                <History size={16} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700">Resumen de Reposición Sugerida</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Producto</TableHead>
                    <TableHead className="text-xs">Stock Actual</TableHead>
                    <TableHead className="text-xs">Mínimo Requerido</TableHead>
                    <TableHead className="text-xs">Faltante</TableHead>
                    <TableHead className="text-xs">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumables.filter(c => c.stock <= c.minThreshold).map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs font-medium">{c.name}</TableCell>
                      <TableCell className="text-xs text-red-600 font-bold">{c.stock}</TableCell>
                      <TableCell className="text-xs text-slate-500">{c.minThreshold}</TableCell>
                      <TableCell className="text-xs text-slate-800 font-bold">{c.minThreshold - c.stock}</TableCell>
                      <TableCell>
                        <Button variant="ghost" className="h-7 text-[10px] text-blue-600 font-bold hover:text-blue-700 p-0">
                          SOLICITAR COMPRA
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {consumables.filter(c => c.stock <= c.minThreshold).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-400 text-xs italic">
                        No hay productos con stock crítico en este momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
