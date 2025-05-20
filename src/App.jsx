import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { toPng } from "html-to-image";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";

const ensureFieldIds = (items) =>
  items.map((item) => ({ ...item, id: item.id || uuidv4() }));

const SortableField = ({ id, field, updateField, removeField }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-4 gap-2 items-center"
    >
      <span {...attributes} {...listeners} className="cursor-grab text-xl pr-2 select-none">☰</span>
      <Input
        value={field.label}
        onChange={(e) => updateField(id, "label", e.target.value)}
        placeholder="Label"
      />
      <Input
        value={field.value}
        onChange={(e) => updateField(id, "value", e.target.value)}
        placeholder="Value"
      />
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={field.color}
          onChange={(e) => updateField(id, "color", e.target.value)}
          className="w-10 h-10 border rounded"
        />
        <span className="text-sm">{field.color}</span>
        <button
          className="text-red-500 hover:text-red-700 text-lg ml-2"
          onClick={() => removeField(id)}
        >
          ❌
        </button>
      </div>
    </div>
  );
};

const SpecCardGenerator = () => {
  const defaultFields = [
    { id: uuidv4(), label: "CPU", value: "Snapdragon G1 Gen 2", color: "#ff4b4b" },
    { id: uuidv4(), label: "RAM", value: "Variantes de 4 GB o 6 GB", color: "#ff4b4b" },
    { id: uuidv4(), label: "Almacenamiento", value: "Variantes de 64 GB o 128 GB", color: "#ff4b4b" },
    { id: uuidv4(), label: "Pantalla", value: "3.92\" OLED 1240x1080", color: "#ffe600" },
    { id: uuidv4(), label: "Batería", value: "5000 mAh (Carga de 27 W)", color: "#ffe600" },
    { id: uuidv4(), label: "Peso", value: "225g (casi 8 onzas)", color: "#ffe600" },
    { id: uuidv4(), label: "Conectividad", value: "WiFi 5GHz, BT 5.1", color: "#4fff4b" },
    { id: uuidv4(), label: "Sistema Operativo", value: "Android 14", color: "#4fff4b" },
    { id: uuidv4(), label: "Otros", value: "Ventilador, 6 botones", color: "#4fff4b" },
  ];

  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem("fields");
    return saved ? ensureFieldIds(JSON.parse(saved)) : defaultFields;
  });

  const [rememberSettings, setRememberSettings] = useState(() => {
    return localStorage.getItem("rememberSettings") === "true";
  });

  const [columns, setColumns] = useState(() => {
    const savedCols = localStorage.getItem("columns");
    return savedCols ? parseInt(savedCols) : 2;
  });

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
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const addField = () => {
    setFields([
      ...fields,
      { id: uuidv4(), label: "Nuevo", value: "Valor", color: "#ffe600" },
    ]);
  };

  const captureImage = () => {
    const card = document.getElementById("spec-card");
    toPng(card, { pixelRatio: 2.5 }).then((dataUrl) => {
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
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberSettings}
            onChange={(e) => setRememberSettings(e.target.checked)}
          />
          Recordar configuración
        </label>
        <label className="flex items-center gap-2">
          Columnas:
          <select
            className="text-black rounded px-2 py-1"
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4].map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </label>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {fields.map((field) => (
              <SortableField
                key={field.id}
                id={field.id}
                field={field}
                updateField={updateField}
                removeField={removeField}
              />
            ))}
            <div className="flex gap-2">
              <Button onClick={addField}>Agregar campo</Button>
              <Button onClick={captureImage}>Generar Imagen</Button>
            </div>
          </div>
        </SortableContext>
      </DndContext>

      <Card
        id="spec-card"
        className="w-fit bg-[#0d0d26] p-6 rounded-2xl shadow-2xl border border-[#1f1f3d]"
      >
        <CardContent className={`grid gap-6 ${columns===1 ? 'grid-cols-1' : columns===2 ? 'grid-cols-2' : columns===3 ? 'grid-cols-3' : 'grid-cols-4' }`}>
          {fields.map((field) => (
            <div key={field.id}
              className="space-y-1 p-3 rounded-xl border bg-[#141432] shadow-lg hover:shadow-neon transition-shadow duration-300"
              style={{ borderColor: field.color }}>
              <div className="relative text-sm font-bold drop-shadow-[0_0_1px]" style={{ color: field.color, textShadow: `0 0 5px ${field.color}` }}>
                <span className="absolute -top-10 left-2 px-2 py-1 bg-[#141432] text-xs font-bold tracking-wide" style={{ color: field.color }}>
                  {field.label}
                </span>
                <div className="mt-4 text-white text-sm font-mono drop-shadow-[0_0_5px_blue]" style={{ borderTopColor: field.color }}>
                  {field.value}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecCardGenerator;
