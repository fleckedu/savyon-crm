import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, X, Pencil, Check, Trash2, Package } from "lucide-react";

const NAVY = "#1F3864";
const PAGE_SIZE = 30;

function fmt(n) {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DetailField({ label, value, onChange, editing }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      {editing ? (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]" />
      ) : (
        <div className="text-sm font-medium text-gray-800 break-words">{value ?? "—"}</div>
      )}
    </div>
  );
}

function ProdutoDrawer({ produto, onClose, onSave, onDelete, saving, deleting }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(produto);

  useEffect(() => { setDraft(produto); setEditing(false); }, [produto]);

  if (!produto || !draft) return null;
  function set(field) { return (v) => setDraft((d) => ({ ...d, [field]: v === "" ? null : v })); }
  function setNum(field) { return (v) => setDraft((d) => ({ ...d, [field]: v === "" ? null : Number(v) })); }
  function handleSave() { onSave(draft); setEditing(false); }

  const priceFields = [
    ["precoKg", "Preço / KG"], ["precoMetroUsd", "Preço / Metro (USD)"], ["precoYardUsd", "Preço / Yard (USD)"],
    ["precoYard10", "Preço / Yard +10%"], ["precoMetroEur", "Preço / Metro (EUR)"], ["preco7Mt", "Preço / MT +7%"],
    ["precoKg5", "Preço / KG +5%"], ["precoMetro5", "Preço / Metro +5%"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
        <div style={{ backgroundColor: NAVY }} className="p-5 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={20} /></button>
          <div className="text-xs uppercase tracking-wide text-white/60 mb-1">Código</div>
          {editing ? (
            <input value={draft.codigo || ""} onChange={(e) => set("codigo")(e.target.value)}
              className="w-full text-lg font-semibold bg-white/10 border border-white/20 rounded-md px-2 py-1 pr-8 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30" />
          ) : (
            <h2 className="text-lg font-semibold pr-8 leading-snug">{draft.codigo}</h2>
          )}
          <div className="text-sm text-white/70 mt-1">{draft.nome}</div>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><DetailField label="Nome" value={draft.nome} onChange={set("nome")} editing={editing} /></div>
            <div className="col-span-2"><DetailField label="Composição" value={draft.composicao} onChange={set("composicao")} editing={editing} /></div>
            <DetailField label="Largura (m)" value={draft.larguraM} onChange={setNum("larguraM")} editing={editing} />
            <DetailField label="Largura (pol)" value={draft.larguraPol} onChange={setNum("larguraPol")} editing={editing} />
            <DetailField label="Rendimento (m/kg)" value={draft.rendimentoMt} onChange={setNum("rendimentoMt")} editing={editing} />
            <DetailField label="Rendimento (yd/kg)" value={draft.rendimentoYd} onChange={setNum("rendimentoYd")} editing={editing} />
            <DetailField label="Gramatura (g/m²)" value={draft.gramatura} onChange={setNum("gramatura")} editing={editing} />
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">Preços</div>
            <div className="grid grid-cols-2 gap-4">
              {priceFields.map(([field, label]) => (
                <DetailField key={field} label={label} value={draft[field]} onChange={setNum(field)} editing={editing} />
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-gray-400 font-medium">MOQ (pedido mínimo)</div>
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="MOQ (metros)" value={draft.moqMt} onChange={setNum("moqMt")} editing={editing} />
              <DetailField label="MOQ (yards)" value={draft.moqYd} onChange={setNum("moqYd")} editing={editing} />
            </div>
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
              <button onClick={() => { setDraft(produto); setEditing(false); }}
                className="px-4 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex-1 text-sm font-medium rounded-lg py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Pencil size={14} /> Editar produto
              </button>
              <button onClick={() => onDelete(produto)} disabled={deleting}
                title="Excluir produto"
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

export default function ProdutosTab() {
  const [produtos, setProdutos] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncNote, setSyncNote] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/produtos");
        if (!res.ok) throw new Error("request failed");
        setProdutos(await res.json());
      } catch (e) {
        console.error("Erro ao carregar produtos:", e);
        setProdutos([]);
        setLoadError(true);
      }
    })();
  }, []);

  async function handleSave(draft) {
    setSaving(true);
    try {
      const res = await fetch(`/api/produtos/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("request failed");
      const updated = await res.json();
      setProdutos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSyncNote("");
    } catch (e) {
      console.error("Erro ao salvar produto:", e);
      setSyncNote("Não foi possível salvar agora — tente de novo em instantes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(produto) {
    if (!window.confirm(`Excluir o produto "${produto.codigo}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/produtos/${produto.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("request failed");
      setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
      setSelectedId((id) => (id === produto.id ? null : id));
    } catch (e) {
      console.error("Erro ao excluir produto:", e);
      setSyncNote("Não foi possível excluir agora — tente de novo em instantes.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    if (!produtos) return [];
    const q = query.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter((p) =>
      (p.codigo || "").toLowerCase().includes(q) ||
      (p.nome || "").toLowerCase().includes(q) ||
      (p.composicao || "").toLowerCase().includes(q)
    );
  }, [produtos, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  const selected = produtos ? produtos.find((p) => p.id === selectedId) : null;

  if (!produtos) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-16 justify-center">
        <Loader2 size={16} className="animate-spin" /> Carregando produtos...
      </div>
    );
  }

  return (
    <div>
      {loadError && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
          <AlertCircle size={15} /> Não consegui conectar ao armazenamento compartilhado.
        </div>
      )}
      {syncNote && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
          <AlertCircle size={15} /> {syncNote}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Buscar por código, nome ou composição..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]" />
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-1.5">
          <Package size={14} /> {produtos.length} produtos no catálogo
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Composição</th>
                <th className="px-4 py-3 font-medium text-right">Largura (m)</th>
                <th className="px-4 py-3 font-medium text-right">USD/m</th>
                <th className="px-4 py-3 font-medium text-right">EUR/m</th>
                <th className="px-4 py-3 font-medium text-right">MOQ (m)</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id} onClick={() => setSelectedId(p.id)} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.codigo}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-[220px] truncate">{p.nome || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">{p.composicao || "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmt(p.larguraM)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmt(p.precoMetroUsd)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmt(p.precoMetroEur)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmt(p.moqMt)}</td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Nenhum produto encontrado com essa busca.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <div>Mostrando {(pageSafe - 1) * PAGE_SIZE + (pageItems.length ? 1 : 0)}{"–"}{(pageSafe - 1) * PAGE_SIZE + pageItems.length} de {filtered.length}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1} className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronLeft size={16} /></button>
            <span className="tabular-nums">{pageSafe} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {selected && (
        <ProdutoDrawer produto={selected} onClose={() => setSelectedId(null)} onSave={handleSave} onDelete={handleDelete} saving={saving} deleting={deleting} />
      )}
    </div>
  );
}
