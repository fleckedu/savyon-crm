import React, { useState, useMemo, useEffect } from "react";
import { Search, Users, TrendingUp, Clock, Archive, X, Mail, Phone, Building2, MapPin, Globe, ChevronLeft, ChevronRight, Plus, Pencil, Check, Loader2, AlertCircle, LayoutGrid, Table2, ArrowRight, ClipboardList, Ship, Truck, Trash2 } from "lucide-react";
import SOPTab from "./SOPTab";

const STATUS_STYLE = {
  Ativo: { bg: "#E8F3EC", fg: "#2F7D5E", dot: "#2F7D5E" },
  Prospect: { bg: "#EDF1F7", fg: "#2F4C74", dot: "#5578A6" },
  Revisar: { bg: "#FDF3E3", fg: "#9C6B00", dot: "#C98A00" },
  Inativo: { bg: "#F1F1F1", fg: "#767676", dot: "#A0A0A0" },
};
const STATUS_OPTIONS = ["Ativo", "Prospect", "Revisar", "Inativo"];
const NAVY = "#1F3864";

const FUNNEL_STAGES = ["Contatado", "Respondeu", "Amostra solicitada", "Amostra enviada", "Negociação", "Convertido", "Perdido"];
const FUNNEL_COLOR = {
  "Contatado": "#5578A6",
  "Respondeu": "#2F7D5E",
  "Amostra solicitada": "#C98A00",
  "Amostra enviada": "#B05A2E",
  "Negociação": "#7C3AED",
  "Convertido": "#15803D",
  "Perdido": "#94A3B8",
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Inativo;
  return (
    <span style={{ backgroundColor: s.bg, color: s.fg }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      <span style={{ backgroundColor: s.dot }} className="w-1.5 h-1.5 rounded-full" />
      {status}
    </span>
  );
}

function FunnelBadge({ stage }) {
  if (!stage) return null;
  const color = FUNNEL_COLOR[stage] || "#94A3B8";
  return (
    <span style={{ backgroundColor: color + "1A", color }} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      <span style={{ backgroundColor: color }} className="w-1.5 h-1.5 rounded-full" />
      {stage}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 flex-1 min-w-[150px]">
      <div style={{ backgroundColor: accent + "1A", color: accent }} className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold tabular-nums" style={{ color: NAVY }}>{value}</div>
        <div className="text-xs text-gray-500 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, editing, textarea }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      {editing ? (
        textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]" />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]" />
        )
      ) : (
        <div className="text-sm font-medium text-gray-800 break-words">{value || "—"}</div>
      )}
    </div>
  );
}

function ClientDrawer({ client, onClose, onSave, onDelete, saving, deleting }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(client);

  useEffect(() => { setDraft(client); setEditing(false); }, [client]);

  if (!client || !draft) return null;
  const s = STATUS_STYLE[draft.status] || STATUS_STYLE.Inativo;

  function set(field) { return (v) => setDraft((d) => ({ ...d, [field]: v })); }
  function handleSave() { onSave(draft); setEditing(false); }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
        <div style={{ backgroundColor: NAVY }} className="p-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
          <div className="text-xs uppercase tracking-wide text-white/60 mb-1">Cliente / Grupo</div>
          {editing ? (
            <input value={draft.cliente} onChange={(e) => set("cliente")(e.target.value)}
              className="w-full text-lg font-semibold bg-white/10 border border-white/20 rounded-md px-2 py-1 pr-8 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30" />
          ) : (
            <h2 className="text-lg font-semibold pr-8 leading-snug">{draft.cliente}</h2>
          )}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {editing ? (
              <select value={draft.status} onChange={(e) => set("status")(e.target.value)}
                className="text-xs rounded-full px-2.5 py-1 border-0 font-medium" style={{ backgroundColor: s.bg, color: s.fg }}>
                {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <StatusBadge status={draft.status} />
            )}
            {editing ? (
              <select value={draft.funil || ""} onChange={(e) => set("funil")(e.target.value)}
                className="text-xs rounded-full px-2.5 py-1 border-0 font-medium bg-white/10 text-white">
                <option value="">Sem etapa de funil</option>
                {FUNNEL_STAGES.map((opt) => <option key={opt} value={opt} className="text-gray-800">{opt}</option>)}
              </select>
            ) : (
              draft.funil && <FunnelBadge stage={draft.funil} />
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="País" value={draft.pais} onChange={set("pais")} editing={editing} />
            <Field label="Nº Pedidos (histórico)" value={String(draft.nPedidos)} onChange={(v) => set("nPedidos")(Number(v) || 0)} editing={editing} />
            <Field label="Última Compra" value={draft.ultimaCompra} onChange={set("ultimaCompra")} editing={editing} />
            <Field label="Cliente desde" value={draft.clienteDesde} onChange={set("clienteDesde")} editing={editing} />
            <div className="col-span-2"><Field label="NIT / Tax ID" value={draft.nit} onChange={set("nit")} editing={editing} /></div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">Localização & Web</div>
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Endereço" value={draft.endereco} onChange={set("endereco")} editing={editing} textarea /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Globe size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Website" value={draft.website} onChange={set("website")} editing={editing} /></div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Building2 size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Contato Principal" value={draft.contato} onChange={set("contato")} editing={editing} /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="E-mail" value={draft.email} onChange={set("email")} editing={editing} /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Telefone" value={draft.telefone} onChange={set("telefone")} editing={editing} /></div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">Logística internacional</div>
            <div className="flex items-start gap-2.5">
              <Ship size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Importador" value={draft.importer} onChange={set("importer")} editing={editing} /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Ship size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Consignatário (Consignee)" value={draft.consignee} onChange={set("consignee")} editing={editing} /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Notify Party" value={draft.notify} onChange={set("notify")} editing={editing} /></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck size={15} className="text-gray-400 mt-1 shrink-0" />
              <div className="flex-1"><Field label="Forwarder" value={draft.forwarder} onChange={set("forwarder")} editing={editing} /></div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <Field label="Observação" value={draft.obs} onChange={set("obs")} editing={editing} textarea />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} style={{ backgroundColor: NAVY }}
                className="flex-1 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              <button onClick={() => { setDraft(client); setEditing(false); }}
                className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex-1 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Pencil size={14} /> Editar cliente
              </button>
              <button onClick={() => onDelete(client)} disabled={deleting}
                title="Excluir cliente"
                className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NewClientModal({ onClose, onCreate, saving }) {
  const [form, setForm] = useState({
    cliente: "", pais: "", ultimaCompra: "", clienteDesde: "", nPedidos: 0,
    status: "Revisar", nit: "", contato: "", email: "", telefone: "", obs: "", funil: "Contatado",
    endereco: "", website: "", importer: "", consignee: "", notify: "", forwarder: "",
  });
  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }
  const canSave = form.cliente.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div style={{ backgroundColor: NAVY }} className="p-5 text-white flex items-center justify-between">
          <h2 className="text-base font-semibold">Adicionar cliente / lead</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Cliente / Grupo *" value={form.cliente} onChange={set("cliente")} editing />
          <div className="grid grid-cols-2 gap-4">
            <Field label="País" value={form.pais} onChange={set("pais")} editing />
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Status</div>
              <select value={form.status} onChange={(e) => set("status")(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20">
                {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400 mb-0.5">Etapa do Funil (campanha 2026-2)</div>
              <select value={form.funil} onChange={(e) => set("funil")(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20">
                <option value="">Sem etapa de funil</option>
                {FUNNEL_STAGES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <Field label="Contato Principal" value={form.contato} onChange={set("contato")} editing />
            <Field label="E-mail" value={form.email} onChange={set("email")} editing />
            <Field label="Telefone" value={form.telefone} onChange={set("telefone")} editing />
            <Field label="NIT / Tax ID" value={form.nit} onChange={set("nit")} editing />
            <div className="col-span-2"><Field label="Endereço" value={form.endereco} onChange={set("endereco")} editing /></div>
            <Field label="Website" value={form.website} onChange={set("website")} editing />
          </div>
          <Field label="Observação" value={form.obs} onChange={set("obs")} editing textarea />
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button disabled={!canSave || saving} onClick={() => onCreate(form)} style={{ backgroundColor: NAVY }}
            className="flex-1 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? "Salvando..." : "Adicionar cliente"}
          </button>
          <button onClick={onClose} className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function FunnelCard({ client, onOpen, onMove }) {
  const idx = FUNNEL_STAGES.indexOf(client.funil);
  const next = idx >= 0 && idx < FUNNEL_STAGES.length - 1 ? FUNNEL_STAGES[idx + 1] : null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
      <div onClick={() => onOpen(client)} className="cursor-pointer">
        <div className="text-sm font-medium text-gray-800 truncate">{client.cliente}</div>
        <div className="text-xs text-gray-400 mt-0.5 truncate">{client.pais && client.pais !== "A confirmar" ? client.pais : "País a confirmar"}</div>
        {client.contato && client.contato !== "A confirmar" && (
          <div className="text-xs text-gray-500 mt-1 truncate">{client.contato}</div>
        )}
      </div>
      {next && (
        <button
          onClick={() => onMove(client, next)}
          className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-medium rounded-md py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Mover p/ {next} <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

function FunnelBoard({ clientes, onOpen, onMove, query }) {
  const q = query.trim().toLowerCase();
  const inFunnel = clientes.filter((c) => c.funil && FUNNEL_STAGES.includes(c.funil));
  const matches = (c) => !q || c.cliente.toLowerCase().includes(q) || (c.pais || "").toLowerCase().includes(q) || (c.contato || "").toLowerCase().includes(q);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {FUNNEL_STAGES.map((stage) => {
        const items = inFunnel.filter((c) => c.funil === stage && matches(c));
        const color = FUNNEL_COLOR[stage];
        return (
          <div key={stage} className="bg-gray-50 rounded-xl border border-gray-200 w-64 shrink-0 flex flex-col max-h-[70vh]">
            <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full shrink-0" />
                <span className="text-xs font-semibold text-gray-700 truncate">{stage}</span>
              </div>
              <span className="text-xs text-gray-400 tabular-nums shrink-0">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto">
              {items.map((c) => <FunnelCard key={c.id} client={c} onOpen={onOpen} onMove={onMove} />)}
              {items.length === 0 && <div className="text-xs text-gray-300 text-center py-6">Vazio</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SavyonCRM() {
  const [clientes, setClientes] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [paisFilter, setPaisFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncNote, setSyncNote] = useState("");
  const [view, setView] = useState("tabela");
  const PAGE_SIZE = 25;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clientes");
        if (!res.ok) throw new Error("request failed");
        const data = await res.json();
        setClientes(data);
      } catch (e) {
        console.error("Erro ao carregar clientes:", e);
        setClientes([]);
        setLoadError(true);
      }
    })();
  }, []);

  async function patchClient(id, fields) {
    setSaving(true);
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error("request failed");
      const updated = await res.json();
      setClientes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSyncNote("");
    } catch (e) {
      console.error("Erro ao salvar cliente:", e);
      setSyncNote("Não foi possível sincronizar com a equipe agora — suas alterações ficam só nesta tela.");
    } finally {
      setSaving(false);
    }
  }

  function handleSaveClient(draft) {
    patchClient(draft.id, draft);
  }

  async function handleDeleteClient(client) {
    if (!window.confirm(`Excluir "${client.cliente}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clientes/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("request failed");
      setClientes((prev) => prev.filter((c) => c.id !== client.id));
      setSelectedId((id) => (id === client.id ? null : id));
      setSyncNote("");
    } catch (e) {
      console.error("Erro ao excluir cliente:", e);
      setSyncNote("Não foi possível excluir agora — tente de novo em instantes.");
    } finally {
      setDeleting(false);
    }
  }

  function handleMoveStage(client, stage) {
    patchClient(client.id, { funil: stage });
  }

  async function handleCreateClient(form) {
    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const created = await res.json();
      setClientes((prev) => [created, ...prev]);
      setSyncNote("");
      setShowNew(false);
    } catch (e) {
      console.error("Erro ao criar cliente:", e);
      setSyncNote("Não foi possível sincronizar com a equipe agora — suas alterações ficam só nesta tela.");
    } finally {
      setSaving(false);
    }
  }

  const paises = useMemo(() => {
    if (!clientes) return ["Todos"];
    const set = new Set(clientes.map((c) => c.pais).filter((p) => p && p !== "A confirmar"));
    return ["Todos", ...Array.from(set).sort()];
  }, [clientes]);

  const counts = useMemo(() => {
    const c = { Ativo: 0, Prospect: 0, Revisar: 0, Inativo: 0 };
    (clientes || []).forEach((x) => { if (c[x.status] !== undefined) c[x.status]++; });
    return c;
  }, [clientes]);

  const funnelCounts = useMemo(() => {
    const total = (clientes || []).filter((c) => c.funil && FUNNEL_STAGES.includes(c.funil)).length;
    const convertido = (clientes || []).filter((c) => c.funil === "Convertido").length;
    return { total, convertido };
  }, [clientes]);

  const filtered = useMemo(() => {
    if (!clientes) return [];
    const q = query.trim().toLowerCase();
    return clientes.filter((c) => {
      if (statusFilter !== "Todos" && c.status !== statusFilter) return false;
      if (paisFilter !== "Todos" && c.pais !== paisFilter) return false;
      if (!q) return true;
      return (
        (c.cliente || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.contato || "").toLowerCase().includes(q) ||
        (c.pais || "").toLowerCase().includes(q)
      );
    });
  }, [clientes, query, statusFilter, paisFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  const selected = clientes ? clientes.find((c) => c.id === selectedId) : null;

  function resetPage(setter) { return (v) => { setter(v); setPage(1); }; }

  if (!clientes) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={16} className="animate-spin" /> Carregando carteira de clientes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <div style={{ backgroundColor: NAVY }} className="px-6 py-6 text-white">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Carteira Global</div>
            <h1 className="text-2xl font-semibold">SAVYON — CRM Clientes</h1>
            <div className="text-sm text-white/60 mt-1">Temporada 2026-2 · {clientes.length} registros · dados compartilhados com a equipe</div>
          </div>
          <button onClick={() => setShowNew(true)} className="bg-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-white/90 shrink-0" style={{ color: NAVY }}>
            <Plus size={16} /> Novo cliente
          </button>
        </div>
      </div>

      {loadError && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
            <AlertCircle size={15} /> Não consegui conectar ao armazenamento compartilhado — os dados aqui não vão sincronizar com a equipe até a conexão voltar.
          </div>
        </div>
      )}
      {syncNote && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
            <AlertCircle size={15} /> {syncNote}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 -mt-5 pt-5">
        <div className="flex flex-wrap gap-3 mb-6">
          <SummaryCard icon={Users} label="Clientes Ativos" value={counts.Ativo} accent="#2F7D5E" />
          <SummaryCard icon={TrendingUp} label="Prospects" value={counts.Prospect} accent="#5578A6" />
          <SummaryCard icon={Clock} label="A Revisar (leads Trello)" value={counts.Revisar} accent="#C98A00" />
          <SummaryCard icon={Archive} label="Inativos" value={counts.Inativo} accent="#A0A0A0" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
            <button onClick={() => setView("tabela")} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (view === "tabela" ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>
              <Table2 size={14} /> Tabela
            </button>
            <button onClick={() => setView("funil")} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (view === "funil" ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>
              <LayoutGrid size={14} /> Funil 2026-2
            </button>
            <button onClick={() => setView("sop")} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (view === "sop" ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>
              <ClipboardList size={14} /> S&OP
            </button>
          </div>
          {view !== "sop" && (
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={(e) => resetPage(setQuery)(e.target.value)} placeholder="Buscar por nome, e-mail, contato ou país..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]" />
          </div>
          )}
          {view === "tabela" && (
            <>
              <select value={statusFilter} onChange={(e) => resetPage(setStatusFilter)(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 bg-white">
                {["Todos", ...STATUS_OPTIONS].map((s) => <option key={s} value={s}>{s === "Todos" ? "Todos os status" : s}</option>)}
              </select>
              <select value={paisFilter} onChange={(e) => resetPage(setPaisFilter)(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 bg-white max-w-[180px]">
                {paises.map((p) => <option key={p} value={p}>{p === "Todos" ? "Todos os países" : p}</option>)}
              </select>
            </>
          )}
        </div>

        {view === "sop" ? (
          <SOPTab clientes={clientes} onOpenClient={(c) => setSelectedId(c.id)} onDeleteClient={handleDeleteClient} />
        ) : view === "funil" ? (
          <>
            <div className="text-sm text-gray-500 mb-3">
              {funnelCounts.total} leads na campanha de mailing 2026-2 · {funnelCounts.convertido} convertidos até agora
            </div>
            <FunnelBoard clientes={clientes} onOpen={(c) => setSelectedId(c.id)} onMove={handleMoveStage} query={query} />
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Cliente / Grupo</th>
                    <th className="px-4 py-3 font-medium">País</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Funil 2026-2</th>
                    <th className="px-4 py-3 font-medium text-right">Pedidos</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[220px] truncate">{c.cliente}</td>
                      <td className="px-4 py-3 text-gray-500">{c.pais === "A confirmar" || !c.pais ? "—" : c.pais}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">{c.funil ? <FunnelBadge stage={c.funil} /> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{c.nPedidos}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{c.contato === "A confirmar" || !c.contato ? "—" : c.contato}</td>
                    </tr>
                  ))}
                  {pageItems.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">Nenhum cliente encontrado com esses filtros.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <div>Mostrando {(pageSafe - 1) * PAGE_SIZE + (pageItems.length ? 1 : 0)}{"\u2013"}{(pageSafe - 1) * PAGE_SIZE + pageItems.length} de {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1} className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronLeft size={16} /></button>
                <span className="tabular-nums">{pageSafe} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 py-6">
          Carteira Global SAVYON · Temporada 2026-2 · Clique em um cliente para editar · Dados salvos e visíveis para toda a equipe com acesso ao link
        </div>
      </div>

      {selected && (
        <ClientDrawer key={selected.id} client={selected} onClose={() => setSelectedId(null)} onSave={handleSaveClient} onDelete={handleDeleteClient} saving={saving} deleting={deleting} />
      )}
      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreate={handleCreateClient} saving={saving} />}
    </div>
  );
}
