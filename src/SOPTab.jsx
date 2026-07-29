import React, { useState, useEffect, useMemo } from "react";
import { Plus, X, Loader2, Pencil, Trash2, PackageSearch, Factory, AlertCircle } from "lucide-react";

const NAVY = "#1F3864";

const PRODUCAO_STATUS = ["Planejado", "Em produção", "Concluído"];
const PRODUCAO_STATUS_STYLE = {
  "Planejado": { bg: "#EDF1F7", fg: "#2F4C74" },
  "Em produção": { bg: "#FDF3E3", fg: "#9C6B00" },
  "Concluído": { bg: "#E8F3EC", fg: "#2F7D5E" },
};

function StatusPill({ status }) {
  const s = PRODUCAO_STATUS_STYLE[status] || PRODUCAO_STATUS_STYLE.Planejado;
  return (
    <span style={{ backgroundColor: s.bg, color: s.fg }} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
      {status}
    </span>
  );
}

function TextInput({ label, value, onChange, type }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
      />
    </div>
  );
}

function DemandaModal({ clientes, initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial || { clienteId: "", produto: "", mes: "", quantidadePrevista: 0, quantidadeConfirmada: 0, obs: "" }
  );
  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }
  const canSave = form.produto.trim().length > 0 && form.mes.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div style={{ backgroundColor: NAVY }} className="p-5 text-white flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial ? "Editar demanda" : "Nova demanda"}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Cliente</div>
            <select value={form.clienteId || ""} onChange={(e) => set("clienteId")(e.target.value ? Number(e.target.value) : "")}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20">
              <option value="">Sem cliente vinculado</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.cliente}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Produto *" value={form.produto} onChange={set("produto")} />
            <TextInput label="Mês (AAAA-MM) *" value={form.mes} onChange={set("mes")} />
            <TextInput label="Qtd. prevista" type="number" value={form.quantidadePrevista} onChange={set("quantidadePrevista")} />
            <TextInput label="Qtd. confirmada" type="number" value={form.quantidadeConfirmada} onChange={set("quantidadeConfirmada")} />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Observação</div>
            <textarea value={form.obs || ""} onChange={(e) => set("obs")(e.target.value)} rows={3}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button disabled={!canSave || saving} onClick={() => onSave(form)} style={{ backgroundColor: NAVY }}
            className="flex-1 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={onClose} className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ProducaoModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial || { produto: "", mes: "", estoqueAtual: 0, quantidadePlanejada: 0, quantidadeProduzida: 0, status: "Planejado", obs: "" }
  );
  function set(field) { return (v) => setForm((f) => ({ ...f, [field]: v })); }
  const canSave = form.produto.trim().length > 0 && form.mes.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div style={{ backgroundColor: NAVY }} className="p-5 text-white flex items-center justify-between">
          <h2 className="text-base font-semibold">{initial ? "Editar planejamento" : "Novo planejamento"}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Produto *" value={form.produto} onChange={set("produto")} />
            <TextInput label="Mês (AAAA-MM) *" value={form.mes} onChange={set("mes")} />
            <TextInput label="Estoque atual" type="number" value={form.estoqueAtual} onChange={set("estoqueAtual")} />
            <TextInput label="Qtd. planejada" type="number" value={form.quantidadePlanejada} onChange={set("quantidadePlanejada")} />
            <TextInput label="Qtd. produzida" type="number" value={form.quantidadeProduzida} onChange={set("quantidadeProduzida")} />
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Status</div>
              <select value={form.status} onChange={(e) => set("status")(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20">
                {PRODUCAO_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Observação</div>
            <textarea value={form.obs || ""} onChange={(e) => set("obs")(e.target.value)} rows={3}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button disabled={!canSave || saving} onClick={() => onSave(form)} style={{ backgroundColor: NAVY }}
            className="flex-1 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={onClose} className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function SOPTab({ clientes }) {
  const [subView, setSubView] = useState("demanda");
  const [demanda, setDemanda] = useState(null);
  const [producao, setProducao] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDemanda, setEditingDemanda] = useState(null);
  const [editingProducao, setEditingProducao] = useState(null);
  const [showNewDemanda, setShowNewDemanda] = useState(false);
  const [showNewProducao, setShowNewProducao] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rDemanda, rProducao] = await Promise.all([fetch("/api/sop/demanda"), fetch("/api/sop/producao")]);
        if (!rDemanda.ok || !rProducao.ok) throw new Error("request failed");
        setDemanda(await rDemanda.json());
        setProducao(await rProducao.json());
      } catch (e) {
        console.error("Erro ao carregar S&OP:", e);
        setDemanda([]);
        setProducao([]);
        setLoadError(true);
      }
    })();
  }, []);

  async function createDemanda(form) {
    setSaving(true);
    try {
      const res = await fetch("/api/sop/demanda", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const created = await res.json();
      setDemanda((prev) => [created, ...prev]);
      setShowNewDemanda(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function updateDemanda(form) {
    setSaving(true);
    try {
      const res = await fetch(`/api/sop/demanda/${form.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const updated = await res.json();
      setDemanda((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDemanda(null);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function deleteDemanda(id) {
    if (!window.confirm("Remover este registro de demanda?")) return;
    try {
      const res = await fetch(`/api/sop/demanda/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("request failed");
      setDemanda((prev) => prev.filter((d) => d.id !== id));
    } catch (e) { console.error(e); }
  }

  async function createProducao(form) {
    setSaving(true);
    try {
      const res = await fetch("/api/sop/producao", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const created = await res.json();
      setProducao((prev) => [created, ...prev]);
      setShowNewProducao(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function updateProducao(form) {
    setSaving(true);
    try {
      const res = await fetch(`/api/sop/producao/${form.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const updated = await res.json();
      setProducao((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingProducao(null);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function deleteProducao(id) {
    if (!window.confirm("Remover este registro de produção?")) return;
    try {
      const res = await fetch(`/api/sop/producao/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("request failed");
      setProducao((prev) => prev.filter((p) => p.id !== id));
    } catch (e) { console.error(e); }
  }

  const demandaTotais = useMemo(() => {
    const list = demanda || [];
    return {
      prevista: list.reduce((sum, d) => sum + (d.quantidadePrevista || 0), 0),
      confirmada: list.reduce((sum, d) => sum + (d.quantidadeConfirmada || 0), 0),
    };
  }, [demanda]);

  if (demanda === null || producao === null) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-16 justify-center">
        <Loader2 size={16} className="animate-spin" /> Carregando S&OP...
      </div>
    );
  }

  return (
    <div>
      {loadError && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
          <AlertCircle size={15} /> Não consegui conectar ao armazenamento compartilhado — os dados aqui não vão sincronizar até a conexão voltar.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
          <button onClick={() => setSubView("demanda")} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (subView === "demanda" ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>
            <PackageSearch size={14} /> Demanda do cliente
          </button>
          <button onClick={() => setSubView("producao")} className={"px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 " + (subView === "producao" ? "bg-white shadow-sm text-gray-800" : "text-gray-500")}>
            <Factory size={14} /> Produção & Estoque
          </button>
        </div>
        {subView === "demanda" ? (
          <button onClick={() => setShowNewDemanda(true)} style={{ backgroundColor: NAVY }} className="text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2">
            <Plus size={16} /> Nova demanda
          </button>
        ) : (
          <button onClick={() => setShowNewProducao(true)} style={{ backgroundColor: NAVY }} className="text-white text-sm font-medium rounded-lg px-4 py-2 flex items-center gap-2">
            <Plus size={16} /> Novo planejamento
          </button>
        )}
      </div>

      {subView === "demanda" ? (
        <>
          <div className="text-sm text-gray-500 mb-3">
            {demanda.length} registros · {demandaTotais.prevista} un. previstas · {demandaTotais.confirmada} un. confirmadas
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">Mês</th>
                    <th className="px-4 py-3 font-medium text-right">Prevista</th>
                    <th className="px-4 py-3 font-medium text-right">Confirmada</th>
                    <th className="px-4 py-3 font-medium">Obs.</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {demanda.map((d) => (
                    <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{d.clienteNome || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{d.produto}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{d.mes}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{d.quantidadePrevista}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{d.quantidadeConfirmada}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{d.obs || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setEditingDemanda(d)} className="text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                          <button onClick={() => deleteDemanda(d.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {demanda.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Nenhuma demanda cadastrada ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-gray-500 mb-3">{producao.length} itens de produção/estoque planejados</div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Produto</th>
                    <th className="px-4 py-3 font-medium">Mês</th>
                    <th className="px-4 py-3 font-medium text-right">Estoque atual</th>
                    <th className="px-4 py-3 font-medium text-right">Planejada</th>
                    <th className="px-4 py-3 font-medium text-right">Produzida</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {producao.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.produto}</td>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{p.mes}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{p.estoqueAtual}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{p.quantidadePlanejada}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">{p.quantidadeProduzida}</td>
                      <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setEditingProducao(p)} className="text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                          <button onClick={() => deleteProducao(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {producao.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Nenhum planejamento de produção cadastrado ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showNewDemanda && <DemandaModal clientes={clientes} onClose={() => setShowNewDemanda(false)} onSave={createDemanda} saving={saving} />}
      {editingDemanda && <DemandaModal clientes={clientes} initial={editingDemanda} onClose={() => setEditingDemanda(null)} onSave={updateDemanda} saving={saving} />}
      {showNewProducao && <ProducaoModal onClose={() => setShowNewProducao(false)} onSave={createProducao} saving={saving} />}
      {editingProducao && <ProducaoModal initial={editingProducao} onClose={() => setEditingProducao(null)} onSave={updateProducao} saving={saving} />}
    </div>
  );
}
