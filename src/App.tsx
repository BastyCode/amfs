import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, Package, Plus, X, Undo2, ArrowUpRight, ArrowDownRight, AlertTriangle, History, ArrowLeft, Edit, Image } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { cn } from "@/lib/utils";

// --- Types ---
type View = "accesspoint" | "productos" | "flyers";

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
const canTypes = ["Lata chica stout", "Lata blanca", "LATA PLOMA ANTIGUA"];

const dongles = {
  "TDC3-6689": { license: "W03663_044", term: "2026-12-13" },
  "TDC3-6157": { license: "W03663_003", term: "2026-12-05" },
  "TDC3-4821": { license: "W03663_012", term: "2026-11-20" },
  "TDC3-3374": { license: "W03663_027", term: "2027-01-08" },
  "TDC3-9902": { license: "W03663_031", term: "2026-10-15" },
  "TDC3-7745": { license: "W03663_019", term: "2027-03-22" },
  "TDC3-5513": { license: "W03663_008", term: "2026-09-30" },
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
  bams: ["ZTE", "ENTEL", "BAM ROJA"],
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
    status: "Producción",
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
    canId: "", totemId: "", observations: "", country: "Chile", canType: "Lata chica stout",
    status: "Activo", dongleId: "", appVersion: appVersions[0], nucSerial: "", printerSerial: "",
    monitorSerial: "", videoActive: "NO", buttonId: "", mueble: "Nuevo", clientId: ""
  });

  // --- Products Catalog State ---
  const productList = [
    { id: "1", name: "Alcotest", stock: 11 },
    { id: "2", name: "Automático", stock: 52 },
    { id: "3", name: "Bam", stock: 61 },
    { id: "4", name: "Botón", stock: 96 },
    { id: "5", name: "Camara", stock: 37 },
    { id: "6", name: "Carcasa", stock: 6 },
    { id: "7", name: "CELULAR", stock: 2 },
    { id: "8", name: "Disco Duro INST", stock: 42 },
    { id: "9", name: "Dongle", stock: 49 },
    { id: "10", name: "Flyers", stock: 5 },
  ];

  const [flyersItems, setFlyersItems] = useState([
    { id: "1", producto: "Flyers", tipoProducto: "Papelería y otros", categoria: "Registros Gráficos", marca: "ALERTPLUS", modelo: "CONDICIONES CRONICAS DE SALUD Y FATIGA - 15", serie: "70285220058586", ubicacion: "Bodega Oficina", estatus: "Activo", codigoEan: "70285220058586" },
    { id: "2", producto: "Flyers", tipoProducto: "Papelería y otros", categoria: "Registros Gráficos", marca: "ALERTPLUS", modelo: "BENEFICIOS DE BEBER AGUA -20", serie: "4424341514297", ubicacion: "Bodega Oficina", estatus: "Activo", codigoEan: "4424341514297" },
    { id: "3", producto: "Flyers", tipoProducto: "Papelería y otros", categoria: "Registros Gráficos", marca: "ALERTPLUS", modelo: "EVALUACION DE FATIGA AGUDA -20", serie: "6440324081479", ubicacion: "Bodega Oficina", estatus: "Activo", codigoEan: "6440324081479" },
    { id: "4", producto: "Flyers", tipoProducto: "Papelería y otros", categoria: "Registros Gráficos", marca: "ALERTPLUS", modelo: "EVALUACION DE FATIGA AGUDA -20", serie: "6769118290133", ubicacion: "Bodega Oficina", estatus: "Activo", codigoEan: "6769118290133" },
    { id: "5", producto: "Flyers", tipoProducto: "Papelería y otros", categoria: "Registros Gráficos", marca: "ALERTPLUS", modelo: "EVALUACION DE FATIGA AGUDA -20", serie: "8159909591583", ubicacion: "Bodega Oficina", estatus: "Activo", codigoEan: "8159909591583" },
  ]);

  const [flyersSearch, setFlyersSearch] = useState("");
  const [flyersPerPage, setFlyersPerPage] = useState("25");
  const [flyersDescontarMode, setFlyersDescontarMode] = useState(false);
  const [flyersSelected, setFlyersSelected] = useState<Set<string>>(new Set());
  const [flyersConfirmModal, setFlyersConfirmModal] = useState(false);

  const toggleFlyerSelection = (id: string) => {
    setFlyersSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFlyersDescontar = () => {
    if (!flyersDescontarMode) {
      setFlyersDescontarMode(true);
      setFlyersSelected(new Set());
      return;
    }
    if (flyersSelected.size === 0) {
      setFlyersDescontarMode(false);
      return;
    }
    setFlyersConfirmModal(true);
  };

  const confirmFlyersDiscount = () => {
    setFlyersItems(prev => prev.filter(f => !flyersSelected.has(f.id)));
    setFlyersSelected(new Set());
    setFlyersDescontarMode(false);
    setFlyersConfirmModal(false);
  };

  const filteredFlyers = useMemo(() => {
    const q = flyersSearch.toLowerCase();
    if (!q) return flyersItems;
    return flyersItems.filter(f =>
      Object.values(f).some(v => String(v).toLowerCase().includes(q))
    );
  }, [flyersSearch, flyersItems]);

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
      eq.id === eqId ? { ...eq, components: { ...eq.components, [field]: "" } } : eq
    ));
  };

  const handleComponentUpdate = (eqId: string, field: string, value: string) => {
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === eqId ? { ...eq, components: { ...eq.components, [field]: value } } : eq
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
      const searchableValues = [
        eq.id, eq.observations, eq.canType, eq.status, eq.country, eq.canId, eq.totemId,
        eq.dongleId, dongleData.license, dongleData.term, derivedClientId, clientData.name,
        clientData.location, eq.appVersion, eq.operationStart, eq.components.chipPhone,
        chipData.company, eq.components.bam, wifi, nucData.model, eq.components.nucSerial,
        nucData.windows, printerData.model, eq.components.printerSerial, monitorData.model,
        eq.components.monitorSerial, eq.components.videoActive, eq.components.buttonId
      ];
      const matchesSearch = searchQuery === "" || searchableValues.some(val =>
        val && val.toString().toLowerCase().includes(searchLower)
      );
      const matchesStatus = statusFilter === "All" || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [equipments, searchQuery, statusFilter]);

  const AP_STATUSES = [
    "Producción",
    "Mantención",
    "Enviado",
    "En armado",
    "Proceso de devolución",
    "Demo",
    "Disponible",
    "Préstamo",
    "Backup",
  ];

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(AP_STATUSES);
    equipments.forEach(eq => { if (eq.status) statuses.add(eq.status); });
    return ["All", ...Array.from(statuses)];
  }, [equipments]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles: " + text);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] font-sans">
      {/* Sidebar - Final Configuration matching image copy.png */}
      <aside className="w-64 bg-white text-slate-600 flex flex-col shadow-sm border-r border-slate-200 shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-600 font-bold border border-slate-200">BJ</div>
            <div>
              <div className="text-sm font-bold text-slate-800 tracking-tight">Bastian Jimenez</div>
              <div className="text-[11px] text-slate-400 font-medium uppercase">Programador</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto text-left">
          <div><div className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">PERFILES</div></div>
          <div><div className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">OPERACIONES</div></div>
          <div>
            <div className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">INVENTARIO</div>
            <ul className="space-y-1">
              <li><a href="#" className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all group"><Package size={18} className="text-slate-400 group-hover:text-emerald-600" /><span className="font-semibold uppercase text-xs">MANTENEDOR</span></a></li>
              <li><button onClick={() => setCurrentView("productos")} className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all group text-left", currentView === "productos" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "hover:bg-slate-100 hover:text-slate-900")}><History size={18} className={currentView === "productos" ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"} /><span className="font-semibold uppercase text-xs">PRODUCTOS</span></button></li>
              <li><a href="#" className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all group"><Package size={18} className="text-slate-400 group-hover:text-emerald-600" /><span className="font-semibold uppercase text-xs">CODIGOS EAN</span></a></li>
              <li><button onClick={() => setCurrentView("accesspoint")} className={cn("w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all group text-left", currentView === "accesspoint" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "hover:bg-slate-100 hover:text-slate-900")}><Package size={18} className={currentView === "accesspoint" ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"} /><span className="font-semibold uppercase text-xs">ACCESSPOINT</span></button></li>
              <li><a href="#" className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all group"><Undo2 size={18} className="text-slate-400 group-hover:text-emerald-600" /><span className="font-semibold uppercase text-xs">RECICLAJE</span></a></li>
            </ul>
          </div>
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
                      <SelectTrigger className="w-16 h-8 text-xs"><SelectValue /></SelectTrigger>
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

            {/* Modal for New Equipment */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Crear Nuevo Accesspoint</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => setIsModalOpen(false)}><X size={18} /></Button>
                  </div>
                  <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">1. Ubicación y Cliente</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">País</label>
                          <Select value={newEq.country} onValueChange={(val) => setNewEq({ ...newEq, country: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cliente</label>
                          <Select value={newEq.clientId} onValueChange={(val) => setNewEq({ ...newEq, clientId: val, totemId: "" })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar Cliente..." /></SelectTrigger>
                            <SelectContent>{Object.entries(clients).map(([id, c]) => <SelectItem key={id} value={id}>{c.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      {newEq.clientId && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">ID Cliente</div>
                            <div className="text-sm font-bold text-slate-700">{newEq.clientId}</div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número AP (Totem)</label>
                            <Select value={newEq.totemId} onValueChange={(val) => setNewEq({ ...newEq, totemId: val })}>
                              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar Totem..." /></SelectTrigger>
                              <SelectContent>
                                {Object.entries(totemToClient).filter(([_, cid]) => cid === newEq.clientId).map(([tid]) => <SelectItem key={tid} value={tid}>Totem {tid}</SelectItem>)}
                                <SelectItem value="nuevo">Nuevo Totem...</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">2. Software y Red</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">N° Dongle</label>
                          <Select value={newEq.dongleId} onValueChange={(val) => setNewEq({ ...newEq, dongleId: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>{Object.keys(dongles).map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Versión App</label>
                          <Select value={newEq.appVersion} onValueChange={(val) => setNewEq({ ...newEq, appVersion: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{appVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado Inicial</label>
                          <Select value={newEq.status} onValueChange={(val) => setNewEq({ ...newEq, status: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{uniqueStatuses.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      {newEq.dongleId && dongles[newEq.dongleId as keyof typeof dongles] && (
                        <div className="p-3 bg-emerald-50/50 rounded-md border border-emerald-100 flex justify-between items-center">
                          <div className="space-y-0.5"><div className="text-[9px] font-bold text-emerald-600 uppercase">Licencia</div><div className="text-xs font-bold text-emerald-800">{dongles[newEq.dongleId as keyof typeof dongles].license}</div></div>
                          <div className="text-right space-y-0.5"><div className="text-[9px] font-bold text-emerald-600 uppercase">Vencimiento</div><div className="text-xs font-bold text-emerald-800">{dongles[newEq.dongleId as keyof typeof dongles].term}</div></div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">3. Hardware</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número de Lata</label>
                          <Input value={newEq.canId} onChange={(e) => setNewEq({ ...newEq, canId: e.target.value })} placeholder="Ej: 105" className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Lata</label>
                          <Select value={newEq.canType} onValueChange={(val) => setNewEq({ ...newEq, canType: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>{canTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Número de NUC</label>
                          <Select value={newEq.nucSerial} onValueChange={(val) => setNewEq({ ...newEq, nucSerial: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar NUC..." /></SelectTrigger>
                            <SelectContent>{Object.keys(inventory.nucs).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                          </Select>
                          {newEq.nucSerial && <div className="text-[10px] text-slate-400 font-medium px-1">Modelo: {inventory.nucs[newEq.nucSerial as keyof typeof inventory.nucs]?.model}</div>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Impresora</label>
                          <Select value={newEq.printerSerial} onValueChange={(val) => setNewEq({ ...newEq, printerSerial: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar Impresora..." /></SelectTrigger>
                            <SelectContent>{Object.keys(inventory.printers).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monitor</label>
                          <Select value={newEq.monitorSerial} onValueChange={(val) => setNewEq({ ...newEq, monitorSerial: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar Monitor..." /></SelectTrigger>
                            <SelectContent>{Object.keys(inventory.monitors).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Botón</label>
                          <Select value={newEq.buttonId} onValueChange={(val) => setNewEq({ ...newEq, buttonId: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Seleccionar Botón..." /></SelectTrigger>
                            <SelectContent>{inventory.buttons.map(btn => <SelectItem key={btn} value={btn}>{btn}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Video Activo</label>
                          <Select value={newEq.videoActive} onValueChange={(val) => setNewEq({ ...newEq, videoActive: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="SI">SI</SelectItem><SelectItem value="NO">NO</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mueble</label>
                          <Select value={newEq.mueble} onValueChange={(val) => setNewEq({ ...newEq, mueble: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Nuevo">Nuevo</SelectItem><SelectItem value="Viejo">Viejo</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observaciones</label>
                      <Input value={newEq.observations} onChange={(e) => setNewEq({ ...newEq, observations: e.target.value })} placeholder="Notas generales sobre el armado..." className="h-9 text-sm" />
                    </div>
                  </div>
                  <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                    <Button variant="outline" className="h-9 text-sm px-4" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 h-9 text-sm px-6 font-bold" onClick={handleCreate}>Guardar Accesspoint</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="px-6 py-4 bg-white border-b flex items-center justify-end gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Estado:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="relative"><Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" /><Input placeholder="Buscar en columnas..." className="pl-9 h-8 w-64 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
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
                            <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpandedRow(expandedRow === eq.id ? null : eq.id)}>{expandedRow === eq.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</Button></TableCell>
                            <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500 transition-colors" title="Devolver Accesspoint" onClick={() => handleReturnAP(eq.id)}><Undo2 size={14} /></Button></TableCell>
                            <TableCell><Input value={eq.observations} onChange={(e) => handleUpdate(eq.id, "observations", e.target.value)} className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow" /></TableCell>
                            <TableCell>
                              <Select value={eq.canType} onValueChange={(val) => handleUpdate(eq.id, "canType", val)}>
                                <SelectTrigger className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow"><SelectValue /></SelectTrigger>
                                <SelectContent>{canTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select value={eq.status} onValueChange={(val) => handleUpdate(eq.id, "status", val)}>
                                <SelectTrigger className={cn("h-8 text-xs font-semibold px-3 rounded-full border-none w-max", eq.status === "Activo" ? "bg-emerald-100 text-emerald-700" : eq.status === "Demo" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}><SelectValue /></SelectTrigger>
                                <SelectContent>{uniqueStatuses.filter(s => s !== "All").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select value={eq.country} onValueChange={(val) => handleUpdate(eq.id, "country", val)}>
                                <SelectTrigger className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow"><SelectValue /></SelectTrigger>
                                <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Input value={eq.canId} onChange={(e) => handleUpdate(eq.id, "canId", e.target.value)} className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow text-center" /></TableCell>
                            <TableCell className="text-xs text-slate-600 text-center">{eq.totemId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Select value={eq.dongleId} onValueChange={(val) => handleUpdate(eq.id, "dongleId", val)}>
                                  <SelectTrigger className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow"><SelectValue /></SelectTrigger>
                                  <SelectContent>{Object.keys(dongles).map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}</SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" title="Retirar Dongle" onClick={() => handleUpdate(eq.id, "dongleId", "")}><Undo2 size={12} /></Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{dongleData.license}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{dongleData.term}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3 text-center font-medium">{derivedClientId}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{clientData.name}</TableCell>
                            <TableCell className="text-xs text-slate-500 bg-slate-50 px-3">{clientData.location}</TableCell>
                            <TableCell>
                              <Select value={eq.appVersion} onValueChange={(val) => handleUpdate(eq.id, "appVersion", val)}>
                                <SelectTrigger className={cn("h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow font-bold", eq.appVersion === "6.7.0.0" ? "text-red-600" : "text-slate-600")}><SelectValue /></SelectTrigger>
                                <SelectContent>{appVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Input type="date" value={eq.operationStart} onChange={(e) => handleUpdate(eq.id, "operationStart", e.target.value)} className="h-8 text-xs border-slate-200 shadow-sm group-hover:border-slate-400 group-hover:shadow" /></TableCell>
                          </TableRow>

                          {expandedRow === eq.id && (
                            <TableRow className="bg-slate-50/30">
                              <TableCell colSpan={16} className="p-0 border-b">
                                <div className="px-10 py-6 bg-white border-l-4 border-slate-800 ml-4 mb-4 shadow-inner">
                                  <h4 className="text-sm font-bold mb-4 text-slate-800 flex items-center gap-2"><Package size={16} /> Componentes del AP {eq.canId}</h4>
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
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.chipPhone} onValueChange={(val) => handleComponentUpdate(eq.id, "chipPhone", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{Object.keys(inventory.chips).map(phone => <SelectItem key={phone} value={phone}>{phone}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "chipPhone")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">{inventory.chips[eq.components.chipPhone as keyof typeof inventory.chips]?.company || "N/A"}</TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.bam} onValueChange={(val) => handleComponentUpdate(eq.id, "bam", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{inventory.bams.map(bam => <SelectItem key={bam} value={bam}>{bam}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "bam")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50 font-medium">{eq.canId ? `ap${eq.canId.padStart(2, '0')}` : "N/A"}</TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.nucSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "nucSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{Object.keys(inventory.nucs).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "nucSerial")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">{inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.model || "N/A"}</TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50 truncate max-w-[100px] cursor-pointer hover:text-blue-600 transition-colors" title="Click para copiar" onClick={() => { const win = inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.windows; if (win) copyToClipboard(win); }}>{inventory.nucs[eq.components.nucSerial as keyof typeof inventory.nucs]?.windows || "N/A"}</TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">{inventory.printers[eq.components.printerSerial as keyof typeof inventory.printers]?.model || "N/A"}</TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.printerSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "printerSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{Object.keys(inventory.printers).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "printerSerial")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3 text-xs text-slate-500 bg-slate-50">{inventory.monitors[eq.components.monitorSerial as keyof typeof inventory.monitors]?.model || "N/A"}</TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.monitorSerial} onValueChange={(val) => handleComponentUpdate(eq.id, "monitorSerial", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{Object.keys(inventory.monitors).map(serial => <SelectItem key={serial} value={serial}>{serial}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "monitorSerial")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3">
                                            <Select value={eq.components.videoActive} onValueChange={(val) => handleComponentUpdate(eq.id, "videoActive", val)}>
                                              <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                              <SelectContent><SelectItem value="SI">SI</SelectItem><SelectItem value="NO">NO</SelectItem></SelectContent>
                                            </Select>
                                          </TableCell>
                                          <TableCell className="py-3">
                                            <div className="flex items-center gap-1">
                                              <Select value={eq.components.buttonId} onValueChange={(val) => handleComponentUpdate(eq.id, "buttonId", val)}>
                                                <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                                <SelectContent>{inventory.buttons.map(btn => <SelectItem key={btn} value={btn}>{btn}</SelectItem>)}</SelectContent>
                                              </Select>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleReturnComponent(eq.id, "buttonId")}><Undo2 size={12} /></Button>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-3">
                                            <Select value={eq.mueble || "Nuevo"} onValueChange={(val) => handleUpdate(eq.id, "mueble", val)}>
                                              <SelectTrigger className="h-7 text-xs border-slate-200"><SelectValue /></SelectTrigger>
                                              <SelectContent><SelectItem value="Nuevo">Nuevo</SelectItem><SelectItem value="Viejo">Viejo</SelectItem></SelectContent>
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
        ) : currentView === "productos" ? (
          // --- PRODUCTOS VIEW: table with product list ---
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Productos</h2>
              </div>
              <Button className="bg-[#2d3748] hover:bg-[#1a202c] h-8 text-xs font-bold text-white">
                <Plus size={14} className="mr-1.5" /> Agregar
              </Button>
            </div>

            {/* Filters bar */}
            <div className="bg-white border-b px-6 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Mostrar</span>
                <Select defaultValue="25">
                  <SelectTrigger className="w-16 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>por pagina</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Buscar:</span>
                <Input placeholder="" className="h-7 w-48 text-xs" />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-[#f8f9fc]">
              <div className="bg-white mx-0 border-b">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase py-3">Producto</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase py-3">Total Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productList.map(product => (
                      <TableRow
                        key={product.id}
                        className="hover:bg-slate-50/80 cursor-pointer group border-b"
                        onClick={() => product.name === "Flyers" && setCurrentView("flyers")}
                      >
                        <TableCell className={cn("text-sm py-3", product.name === "Flyers" ? "text-blue-600 font-medium hover:underline" : "text-slate-700")}>
                          {product.name}
                        </TableCell>
                        <TableCell className="text-sm py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">{product.stock}</span>
                            <button className="opacity-60 hover:opacity-100 text-slate-500">
                              <Image size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end px-4 py-3 gap-2 text-xs text-slate-600">
                <button className="px-2 py-1 border rounded hover:bg-slate-100">&lt; Anterior</button>
                <button className="px-3 py-1 bg-[#2d3748] text-white rounded">1</button>
                <button className="px-3 py-1 border rounded hover:bg-slate-100">2</button>
                <button className="px-2 py-1 border rounded hover:bg-slate-100">Siguiente &gt;</button>
              </div>
            </div>
          </div>
        ) : currentView === "flyers" ? (
          // --- FLYERS DETAIL VIEW ---
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top breadcrumb bar */}
            <div className="bg-white border-b px-6 py-2 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="text-slate-400">Inicio</span>
                <span className="mx-1">/</span>
                <button onClick={() => setCurrentView("productos")} className="text-slate-400 hover:text-slate-600">Catálogo de Productos</button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setCurrentView("productos")}>
                  Atrás
                </Button>
                {flyersDescontarMode && (
                  <Button variant="outline" size="sm" className="h-7 text-xs border-slate-300 text-slate-600" onClick={() => { setFlyersDescontarMode(false); setFlyersSelected(new Set()); }}>
                    Cancelar
                  </Button>
                )}
                <Button
                  size="sm"
                  className={flyersDescontarMode
                    ? flyersSelected.size > 0
                      ? "h-7 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                      : "h-7 text-xs font-bold bg-slate-400 text-white cursor-not-allowed"
                    : "h-7 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
                  }
                  onClick={handleFlyersDescontar}
                >
                  {flyersDescontarMode
                    ? flyersSelected.size > 0
                      ? `Descontar (${flyersSelected.size} seleccionado${flyersSelected.size > 1 ? "s" : ""})`
                      : "Selecciona items..."
                    : "Descontar"}
                </Button>
                <Button className="bg-[#2d3748] hover:bg-[#1a202c] h-7 text-xs font-bold text-white">
                  <Plus size={12} className="mr-1" /> Agregar
                </Button>
              </div>
            </div>

            {/* Page header */}
            <div className="bg-white border-b px-6 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">CATÁLOGO DE PRODUCTOS</p>
              <h2 className="text-base font-semibold text-slate-700">Permite agregar o modificar productos</h2>
            </div>

            {/* Tab - Producto Flyers */}
            <div className="bg-white border-b px-6">
              <div className="inline-block border-b-2 border-green-500 pb-2 pt-3">
                <span className="text-sm font-semibold text-slate-700">Producto Flyers</span>
              </div>
            </div>

            {/* Filters bar */}
            <div className="bg-white border-b px-6 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Mostrar</span>
                <Select value={flyersPerPage} onValueChange={setFlyersPerPage}>
                  <SelectTrigger className="w-16 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>por pagina</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Buscar:</span>
                <Input
                  placeholder=""
                  className="h-7 w-48 text-xs"
                  value={flyersSearch}
                  onChange={(e) => setFlyersSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-[#f8f9fc]">
              <div className="bg-white">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      {flyersDescontarMode && <TableHead className="w-8"></TableHead>}
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Producto</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">
                        <div className="flex items-center gap-1">Tipo de Producto <ChevronDown size={12} /></div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">
                        <div className="flex items-center gap-1">Categoría <ChevronDown size={12} /></div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">
                        <div className="flex items-center gap-1">Marca <ChevronDown size={12} /></div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">
                        <div className="flex items-center gap-1">Modelo <ChevronDown size={12} /></div>
                      </TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Serie</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Ubicación</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Estatus</TableHead>
                      <TableHead className="text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Código EAN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlyers.map(item => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "hover:bg-slate-50/80 border-b transition-colors",
                          flyersDescontarMode && flyersSelected.has(item.id) ? "bg-orange-50 border-l-4 border-l-orange-400" : "",
                          flyersDescontarMode ? "cursor-pointer" : ""
                        )}
                        onClick={() => flyersDescontarMode && toggleFlyerSelection(item.id)}
                      >
                        {flyersDescontarMode && (
                          <TableCell className="py-2 pl-3">
                            <input
                              type="checkbox"
                              checked={flyersSelected.has(item.id)}
                              onChange={() => toggleFlyerSelection(item.id)}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 accent-orange-500 cursor-pointer"
                            />
                          </TableCell>
                        )}
                        <TableCell className="py-2">
                          <button className="text-slate-400 hover:text-blue-600">
                            <Edit size={13} />
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 whitespace-nowrap">{item.producto}</TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 whitespace-nowrap">{item.tipoProducto}</TableCell>
                        <TableCell className="text-xs text-blue-600 py-2 whitespace-nowrap">{item.categoria}</TableCell>
                        <TableCell className="text-xs text-blue-600 py-2 whitespace-nowrap">{item.marca}</TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 max-w-[250px] truncate">{item.modelo}</TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 whitespace-nowrap">{item.serie}</TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 whitespace-nowrap">{item.ubicacion}</TableCell>
                        <TableCell className="py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{item.estatus}</span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 py-2 whitespace-nowrap">{item.codigoEan}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-end px-4 py-3 gap-2 text-xs text-slate-600">
                <button className="px-2 py-1 border rounded hover:bg-slate-100">&lt; Anterior</button>
                <button className="px-3 py-1 bg-[#2d3748] text-white rounded">1</button>
                <button className="px-3 py-1 border rounded hover:bg-slate-100">Siguiente &gt;</button>
              </div>
            </div>

            {/* Confirmation Modal - Descontar Flyers */}
            {flyersConfirmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b bg-red-50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Confirmar descuento</h3>
                      <p className="text-[11px] text-slate-500">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-700 mb-3">
                      ¿Estás seguro que deseas descontar{" "}
                      <span className="font-bold text-red-600">
                        {flyersSelected.size} item{flyersSelected.size > 1 ? "s" : ""}
                      </span>{" "}
                      del catálogo de Flyers?
                    </p>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 max-h-40 overflow-y-auto space-y-1">
                      {flyersItems.filter(f => flyersSelected.has(f.id)).map(f => (
                        <div key={f.id} className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="truncate">{f.modelo}</span>
                          <span className="text-slate-400 shrink-0">· {f.serie}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-6 pb-5 flex justify-end gap-3">
                    <Button variant="outline" className="h-9 text-sm px-5" onClick={() => setFlyersConfirmModal(false)}>
                      Cancelar
                    </Button>
                    <Button className="h-9 text-sm px-5 bg-red-600 hover:bg-red-700 font-bold text-white" onClick={confirmFlyersDiscount}>
                      Sí, descontar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-auto">
            <header className="mb-6"><h2 className="text-xl font-semibold text-slate-800">Gestión de Productos e Insumos</h2><p className="text-xs text-slate-500">Control de stock</p></header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {consumables.map(item => (
                <div key={item.id} className="bg-white rounded-xl border p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-4"><div><span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span><h3 className="font-bold text-slate-800">{item.name}</h3></div></div>
                  <div className="flex items-end gap-2 mb-6"><span className="text-3xl font-bold text-slate-800">{item.stock}</span><span className="text-xs text-slate-400 mb-1">{item.unit}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
