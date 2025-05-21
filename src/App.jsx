import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toPng } from "html-to-image";
import { v4 as uuidv4 } from "uuid";

const defaultFields = [
  { id: uuidv4(), label: "CPU", value: "Snapdragon G1 Gen 2", color: "#ff4b4b", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "RAM", value: "Opciones de 4 GB y 6 GB", color: "#ff4b4b", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Almacenamiento", value: "Opciones de 64 GB y 128 GB", color: "#ff4b4b", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Pantalla", value: "3.92\" OLED 1240x1080", color: "#ffe600", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Bateria", value: "5000 mAh (Carga de 27 W)", color: "#ffe600", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Peso", value: "225g (casi 8 onzas)", color: "#ffe600", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Conectividad", value: "WiFi 5 GHz, BT 5.1", color: "#4fff4b", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Sistema Operativo", value: "Android 14", color: "#4fff4b", shadowColor: "#0080ff" },
  { id: uuidv4(), label: "Otros", value: "Ventilador, 6 botones", color: "#4fff4b", shadowColor: "#0080ff" },
];

const SortableField = ({ id, field, updateField, removeField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center bg-[#1e1e3a] p-2 rounded-lg border border-[#2e2e4d]"
    >
      <span {...attributes} {...listeners} className="cursor-grab text-xl select-none">☰</span>
      <Input
        value={field.label}
        onChange={(e) => updateField(id, "label", e.target.value)}
        placeholder="Label"
        className="text-sm h-8 px-2"
      />
      <Input
        value={field.value}
        onChange={(e) => updateField(id, "value", e.target.value)}
        placeholder="Value"
        className="text-sm h-8 px-2"
      />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={field.color}
          onChange={(e) => updateField(id, "color", e.target.value)}
          className="w-8 h-8 border rounded"
        />
        <input
          type="color"
          value={field.shadowColor || "#0080ff"}
          onChange={(e) => updateField(id, "shadowColor", e.target.value)}
          className="w-8 h-8 border rounded"
        />
        <button
          className="text-red-500 hover:text-red-700 text-base"
          onClick={() => removeField(id)}
        >❌</button>
      </div>
    </div>
  );
};

const App = () => {
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem("fields");
    const parsed = saved ? JSON.parse(saved) : defaultFields;
    return parsed.map(field => ({
      ...field,
      shadowColor: field.shadowColor || "#0080ff",
    }));
  });
  const [columns, setColumns] = useState(() => {
    const savedCols = localStorage.getItem("columns");
    return savedCols ? parseInt(savedCols) : 3;
  });
  const [rememberSettings, setRememberSettings] = useState(() => {
    return localStorage.getItem("rememberSettings") === "true";
  });
  const [cardTitle, setCardTitle] = useState("Retroid Pocket Classic");
  const [titleColor, setTitleColor] = useState("#ff00ff");
  const [glowColor, setGlowColor] = useState("#0080ff");

  useEffect(() => {
    if (rememberSettings) {
      localStorage.setItem("fields", JSON.stringify(fields));
      localStorage.setItem("columns", columns.toString());
    }
  }, [fields, columns, rememberSettings]);

  useEffect(() => {
    localStorage.setItem("rememberSettings", rememberSettings);
  }, [rememberSettings]);

  const updateField = (id, key, value) => {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const addField = () => {
    setFields([...fields, { id: uuidv4(), label: "Nuevo", value: "Valor", color: "#ffe600", shadowColor: "#0080ff" }]);
  };

  const captureImage = () => {
    const node = document.getElementById("spec-card");
    toPng(node, { pixelRatio: 2 }).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "spec_card.png";
      link.href = dataUrl;
      link.click();
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      setFields((fields) => arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <div className="p-4 space-y-6 min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="flex flex-wrap gap-4 items-center justify-between border border-white/20 p-4 rounded-xl bg-[#1b1b3a]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberSettings}
              onChange={(e) => setRememberSettings(e.target.checked)}
            />
            <span className="text-sm">Recordar configuración</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm">Columnas:</span>
            <select
              className="text-black text-sm rounded px-2 py-1"
              value={columns}
              onChange={(e) => setColumns(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4].map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-4 items-center mb-2">
          <Input
            type="text"
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            placeholder="Card Title"
            className="text-sm h-8 px-2 w-64"
          />
          <input
            type="color"
            value={titleColor}
            onChange={(e) => setTitleColor(e.target.value)}
            className="w-8 h-8 border rounded"
          />
          <input
            type="color"
            value={glowColor}
            onChange={(e) => setGlowColor(e.target.value)}
            className="w-8 h-8 border rounded"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={addField}>Agregar campo</Button>
          <Button onClick={captureImage}>Generar Imagen</Button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field) => (
              <SortableField
                key={field.id}
                id={field.id}
                field={field}
                updateField={updateField}
                removeField={removeField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="w-full flex justify-center">
        <Card id="spec-card" className="w-fit bg-[#0d0d26] p-6 rounded-2xl shadow-2xl border border-[#1f1f3d]">
          <div className="text-center text-lg font-bold mb-4" style={{ filter: `drop-shadow(0 0 5px ${glowColor})`, color: titleColor, textShadow: `0 0 5px ${titleColor}` }}>
            {cardTitle}
          </div>
          <CardContent className={`grid gap-6 ${columns===1 ? 'grid-cols-1' : columns===2 ? 'grid-cols-2' : columns===3 ? 'grid-cols-3' : 'grid-cols-4' }`}>
            {fields.map((field) => (
              <div key={field.id}
                className="space-y-1 p-3 rounded-xl border bg-[#141432] shadow-lg hover:shadow-neon transition-shadow duration-300"
                style={{ borderColor: field.color }}>
                <div className="relative text-sm font-bold drop-shadow-[0_0_1px]" style={{ color: field.color, textShadow: `0 0 5px ${field.color}` }}>
                  <span className="absolute -top-10 left-2 px-2 py-1 bg-[#141432] text-xs font-bold tracking-wide" style={{ color: field.color }}>
                    {field.label}
                  </span>
                  <div className="mt-4 text-white text-sm font-mono" style={{ filter: `drop-shadow(0 0 5px ${field.shadowColor})`, borderTopColor: field.color, textShadow: `0 0 5px ${field.color || "#0000ff"}` }}>
                    {field.value}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <footer className="fixed bottom-0 left-0 w-full text-center text-sm text-white/60 bg-[#0f0c29] py-2 border-t border-white/10">
        Made by <span className="font-semibold">Zulux91</span> with 💗 using <span className="inline-flex items-center gap-1 text-cyan-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3" fill="currentColor" className="w-4 h-4">
            <path d="M666.3 296.5c0-40.3-31.3-74.1-71.3-78.7 5.1-12.4 7.8-26 7.8-40.2 0-60.3-49-109.3-109.3-109.3-28.3 0-54 10.8-73.4 28.5-19.4-17.7-45.1-28.5-73.4-28.5-60.3 0-109.3 49-109.3 109.3 0 14.2 2.7 27.8 7.8 40.2-40 4.6-71.3 38.4-71.3 78.7 0 43.8 35.5 79.3 79.3 79.3h44.8c19.8 0 38.1-8.7 51.4-22.6 13.3 13.9 31.6 22.6 51.4 22.6s38.1-8.7 51.4-22.6c13.3 13.9 31.6 22.6 51.4 22.6h44.8c43.7 0 79.3-35.5 79.3-79.3z"/>
          </svg> React
        </span>
      </footer>
      <div style={{ height: "20px" }}></div>
    </div>
  );
};

export default App;
