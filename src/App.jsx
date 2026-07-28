import { useState, useRef, useCallback } from "react"; 

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  "T-Shirt","Leggings","Sports Bra","Hoodie","Shorts","Tank Top","Joggers",
  "Jacket","Compression Shirt","Compression Shorts","Sports Dress","Crop Top",
  "Long Sleeve Shirt","Quarter Zip","Polo Shirt","Sweatshirt","Track Pants",
  "Windbreaker","Vest","Base Layer Top","Base Layer Bottom","Swimwear"
];

const GENDERS = ["Unisex","Men's","Women's","Youth"];

const POSES = {
  Standard: [
    { id:"hero_front",    name:"Hero Front",         desc:"Straight-on front view, model looking at camera, arms relaxed at sides" },
    { id:"back_view",     name:"Back View",           desc:"Straight-on back view showing full rear of garment" },
    { id:"three_quarter", name:"¾ Front Left",        desc:"Three-quarter angle from front-left, slight body twist" },
    { id:"upper_body",    name:"Upper Body Close-Up", desc:"Waist-up shot emphasising upper garment detail and fit" },
  ],
  Action: [
    { id:"running",       name:"Running Stride",    desc:"Mid-stride running, one foot off ground, arms pumping" },
    { id:"jump",          name:"Victory Jump",      desc:"Two-foot jump, arms raised in celebration" },
    { id:"lunge",         name:"Forward Lunge",     desc:"Deep forward lunge, front knee at 90°, arms extended" },
    { id:"squat",         name:"Deep Squat",        desc:"Parallel squat position, arms forward for balance" },
    { id:"sprint_start",  name:"Sprint Start",      desc:"Low explosive sprint start position, leaning forward" },
    { id:"box_jump",      name:"Box Jump",          desc:"Mid-air during box jump, knees tucked" },
    { id:"burpee",        name:"Burpee",            desc:"Jumping phase of burpee, arms overhead" },
    { id:"plank",         name:"Plank Hold",        desc:"Perfect plank position, showing back of garment" },
    { id:"deadlift",      name:"Deadlift",          desc:"Standing with weights, showing garment under load" },
  ],
  Lifestyle: [
    { id:"hands_hips",    name:"Hands on Hips",     desc:"Confident pose, hands on hips, slight hip tilt" },
    { id:"arms_crossed",  name:"Arms Crossed",      desc:"Arms folded across chest, looking powerful" },
    { id:"natural_walk",  name:"Natural Walk",      desc:"Casual walking stride, relaxed and natural" },
    { id:"power_stance",  name:"Power Stance",      desc:"Wide stance, hands clasped in front" },
    { id:"shoulder_look", name:"Shoulder Glance",   desc:"Walking away, glancing back over shoulder" },
    { id:"stretching",    name:"Side Stretch",      desc:"Arms overhead side stretch showing waistband" },
    { id:"water_break",   name:"Water Break",       desc:"Drinking from bottle post-workout, relaxed" },
    { id:"phone_check",   name:"Phone Check",       desc:"Checking phone on wrist, post-run pose" },
    { id:"earbuds",       name:"Earbuds In",        desc:"Adjusting earbuds, about to start workout" },
    { id:"selfie_pose",   name:"Mirror Selfie",     desc:"Gym mirror selfie pose showing front of garment" },
    { id:"meditation",    name:"Meditation Sit",    desc:"Cross-legged seated, hands on knees, eyes closed" },
    { id:"cool_down",     name:"Cool Down Walk",    desc:"Hands behind head, walking cool-down" },
  ],
  Yoga: [
    { id:"warrior",       name:"Warrior Pose",      desc:"Warrior I position, arms extended overhead" },
    { id:"side_stretch",  name:"Extended Side",     desc:"Side angle pose, one arm reaching overhead" },
    { id:"forward_fold",  name:"Forward Fold",      desc:"Standing forward fold, showing back of legs and top" },
    { id:"tree_balance",  name:"Tree Balance",      desc:"One-legged tree pose, arms overhead" },
    { id:"downward_dog",  name:"Downward Dog",      desc:"Classic downward dog, showing back panel" },
    { id:"cobra",         name:"Cobra Pose",        desc:"Cobra position showing front of sports bra/top" },
    { id:"pigeon",        name:"Pigeon Pose",       desc:"Seated pigeon stretch showing leggings/shorts" },
  ],
  "Back Views": [
    { id:"back_hips",     name:"Back Hands Hips",   desc:"Back view, hands on hips, showing rear panel" },
    { id:"back_right",    name:"Back ¾ Right",      desc:"Three-quarter rear angle from right side" },
    { id:"back_left",     name:"Back ¾ Left",       desc:"Three-quarter rear angle from left side" },
  ],
  Detail: [
    { id:"collar",        name:"Collar Detail",     desc:"Close-up of neckline and collar construction" },
    { id:"sleeve",        name:"Sleeve Detail",     desc:"Close-up of sleeve cuff and hem stitching" },
    { id:"hem_detail",    name:"Hem Detail",        desc:"Close-up of bottom hem, waistband or drawstring" },
    { id:"fabric_macro",  name:"Fabric Macro",      desc:"Extreme close-up of fabric texture and weave" },
    { id:"logo_feature",  name:"Logo Feature",      desc:"Close-up centred on logo placement" },
  ],
  "Flat Lay": [
    { id:"flat_front",    name:"Flat Lay Front",    desc:"Garment laid flat on white surface, front up, overhead shot" },
    { id:"flat_back",     name:"Flat Lay Back",     desc:"Garment laid flat, back side up, overhead shot" },
    { id:"flat_folded",   name:"Flat Lay Folded",   desc:"Garment neatly folded on white surface, branded look" },
  ],
  Angles: [
    { id:"left_profile",  name:"Left Side Profile", desc:"Pure left-side silhouette showing garment side seam" },
    { id:"right_profile", name:"Right Side Profile", desc:"Pure right-side silhouette showing garment side seam" },
    { id:"low_angle",     name:"Low Angle Power",   desc:"Camera below waist shooting up, powerful athletic stance" },
    { id:"overhead_edit", name:"Overhead Editorial", desc:"Top-down editorial flat lay with props and accessories" },
  ],
  Floor: [
    { id:"seated_cross",  name:"Seated Cross-Legged", desc:"Seated cross-legged on floor, casual athletic look" },
    { id:"low_kneel",     name:"Low Kneeling Lunge",  desc:"Low kneeling lunge showing leg garment in detail" },
  ],
  Fashion: [
    { id:"hand_heart",    name:"Hand on Heart",     desc:"One hand over heart, slight lean forward, emotional connection" },
    { id:"jump_kick",     name:"Jump Kick",         desc:"Mid-air side kick, dynamic action editorial" },
  ],
};

const ALL_POSES = Object.entries(POSES).flatMap(([cat, poses]) =>
  poses.map(p => ({ ...p, category: cat }))
);

const DEFAULT_SLOTS = [
  { poseId: "hero_front",    label: "Hero Front",         varied: false },
  { poseId: "back_view",     label: "Back View",          varied: false },
  { poseId: "three_quarter", label: "¾ Front Left",       varied: false },
  { poseId: "upper_body",    label: "Upper Body Close-Up", varied: false },
  { poseId: "flat_front",    label: "Flat Lay Front",     varied: false },
  { poseId: "running",       label: "Running Stride",     varied: true  },
  { poseId: "hands_hips",    label: "Hands on Hips",      varied: true  },
  { poseId: "fabric_macro",  label: "Fabric Macro",       varied: true  },
];

const CAT_COLORS = {
  Standard:"#6366f1", Action:"#ef4444", Lifestyle:"#f59e0b",
  Yoga:"#10b981","Back Views":"#8b5cf6", Detail:"#06b6d4",
  "Flat Lay":"#ec4899", Angles:"#f97316", Floor:"#84cc16", Fashion:"#a855f7"
};

const C = {
  bg:"#0A0A0F", surf:"#12121A", card:"#1A1A26", border:"#2A2A3E",
  purple:"#6366f1", teal:"#10b981", amber:"#f59e0b", danger:"#ef4444",
  text:"#F0F0F8", muted:"#6B7090"
};

// ─── Gemini Image Generation ──────────────────────────────────────────────────
async function generateImage(prompt, apiKey) {
  // Try Imagen 3 first (highest quality)
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: "3:4" }
        })
      }
    );
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    if (d.predictions?.[0]?.bytesBase64Encoded) {
      return { data: d.predictions[0].bytesBase64Encoded, mime: "image/png" };
    }
  } catch (e) {
    if (e.message?.includes("quota") || e.message?.includes("429")) throw new Error("QUOTA");
    if (e.message?.includes("401") || e.message?.includes("403") || e.message?.includes("API key")) throw new Error("AUTH");
    // Fall through to backup model
  }

  // Fallback: Gemini Flash image generation
  const r2 = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      })
    }
  );
  const d2 = await r2.json();
  if (d2.error) {
    if (d2.error.code === 429) throw new Error("QUOTA");
    if (d2.error.code === 401 || d2.error.code === 403) throw new Error("AUTH");
    throw new Error(d2.error.message);
  }
  const parts = d2.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return { data: part.inlineData.data, mime: part.inlineData.mimeType };
    }
  }
  throw new Error("No image returned from Gemini");
}

// ─── Canvas Processing ────────────────────────────────────────────────────────
async function processImage(base64Data, mime) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = 1948, H = 2656, PAD = Math.round(W * 0.04);
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min((W - PAD * 2) / img.width, (H - PAD * 2) / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      const sx = (W - sw) / 2, sy = (H - sh) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = reject;
    img.src = `data:${mime};base64,${base64Data}`;
  });
}

// ─── Build Prompt ─────────────────────────────────────────────────────────────
function buildPrompt(product, pose) {
  const { name, type, gender, color, brand, designNotes } = product;
  const genderModel = gender === "Women's" ? "female" : gender === "Men's" ? "male" : gender === "Youth" ? "young" : "athletic";
  const isFlat = pose.category === "Flat Lay";
  const isDetail = pose.category === "Detail";

  if (isFlat) {
    return `Professional product photography flat lay: ${color} ${brand} ${type}, ${pose.desc}. Pure white background #FFFFFF. Sharp focus, even studio lighting. No shadows, no props unless specified. Marketplace listing quality, Amazon standard, 3:4 aspect ratio.${designNotes ? ` Design details: ${designNotes}.` : ""}`;
  }
  if (isDetail) {
    return `Extreme close-up product photography: ${color} ${brand} ${type}. ${pose.desc}. Pure white background. Studio macro lighting, razor-sharp focus on fabric detail and construction. 3:4 aspect ratio. High-end activewear brand quality.${designNotes ? ` Design: ${designNotes}.` : ""}`;
  }
  return `Professional activewear product photography. ${genderModel} athletic model wearing ${color} ${brand} ${type}. ${pose.desc}. Pure white background #FFFFFF, full body visible, clean studio lighting, no shadows on background. Model face neutral/confident. Marketplace listing quality, Amazon/Noon standard. 3:4 portrait aspect ratio.${designNotes ? ` Product design notes: ${designNotes}.` : ""}`;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [product, setProduct] = useState({ name:"", type:"T-Shirt", gender:"Unisex", color:"", brand:"Actiwear", designNotes:"" });
  const [slots, setSlots] = useState(DEFAULT_SLOTS.map(s => ({ ...s, status:"idle", result:null, error:null })));
  const [apiKeys, setApiKeys] = useState(["", "", ""]);
  const [activeKeyIdx, setActiveKeyIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showPosePicker, setShowPosePicker] = useState(null); // slot index
  const [poseSearch, setPoseSearch] = useState("");
  const [poseCat, setPoseCat] = useState("All");
  const [refs, setRefs] = useState({ front:null, back:null, side:null, logo:null });
  const stopRef = useRef(false);

  const validKeys = apiKeys.filter(k => k.length > 20);
  const doneCount = slots.filter(s => s.status === "done").length;
  const errorCount = slots.filter(s => s.status === "error").length;
  const progress = Math.round((doneCount / 8) * 100);

  function updateSlot(i, patch) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s));
  }

  function randomizeVaried() {
    const variedPoses = ALL_POSES.filter(p =>
      !["Standard","Flat Lay","Detail","Back Views"].includes(p.category)
    );
    setSlots(prev => prev.map(s => {
      if (!s.varied) return s;
      const random = variedPoses[Math.floor(Math.random() * variedPoses.length)];
      return { ...s, poseId: random.id, label: random.name };
    }));
  }

  function getNextKey() {
    for (let i = 0; i < validKeys.length; i++) {
      const idx = (activeKeyIdx + i) % validKeys.length;
      return { key: validKeys[idx], idx };
    }
    return null;
  }

  async function generateAll() {
    if (validKeys.length === 0) { setShowKeyModal(true); return; }
    if (!product.name.trim()) { alert("Enter a product name first"); return; }
    stopRef.current = false;
    setStopped(false);
    setGenerating(true);
    setSlots(prev => prev.map(s => ({ ...s, status:"pending", result:null, error:null })));

    let keyIdx = activeKeyIdx;

    for (let i = 0; i < slots.length; i++) {
      if (stopRef.current) { updateSlot(i, { status:"idle" }); continue; }

      updateSlot(i, { status:"generating" });
      const pose = ALL_POSES.find(p => p.id === slots[i].poseId) || ALL_POSES[0];
      const prompt = buildPrompt(product, pose);

      let success = false;
      let attempts = 0;

      while (!success && attempts < validKeys.length * 2) {
        const key = validKeys[keyIdx % validKeys.length];
        try {
          const { data, mime } = await generateImage(prompt, key);
          const processed = await processImage(data, mime);
          updateSlot(i, { status:"done", result:processed });
          success = true;
        } catch (e) {
          if (e.message === "QUOTA" || e.message === "AUTH") {
            keyIdx = (keyIdx + 1) % validKeys.length;
            setActiveKeyIdx(keyIdx);
          } else {
            updateSlot(i, { status:"error", error: e.message });
            break;
          }
        }
        attempts++;
      }
      if (!success && attempts >= validKeys.length * 2) {
        updateSlot(i, { status:"error", error:"All API keys exhausted" });
      }
    }
    setGenerating(false);
  }

  async function regenerateSlot(i) {
    if (validKeys.length === 0) { setShowKeyModal(true); return; }
    updateSlot(i, { status:"generating", error:null });
    const pose = ALL_POSES.find(p => p.id === slots[i].poseId) || ALL_POSES[0];
    const prompt = buildPrompt(product, pose);
    try {
      const key = validKeys[activeKeyIdx % validKeys.length];
      const { data, mime } = await generateImage(prompt, key);
      const processed = await processImage(data, mime);
      updateSlot(i, { status:"done", result:processed });
    } catch (e) {
      updateSlot(i, { status:"error", error: e.message });
    }
  }

  function downloadAll() {
    const done = slots.filter(s => s.status === "done");
    if (done.length === 0) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = async () => {
      const zip = new window.JSZip();
      done.forEach((s, i) => {
        const base64 = s.result.split(",")[1];
        const idx = slots.indexOf(s) + 1;
        zip.file(`${product.name.replace(/\s+/g,"_")}_${idx}.jpg`, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type:"blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${product.name.replace(/\s+/g,"_")}_images.zip`;
      a.click(); URL.revokeObjectURL(url);
    };
    document.head.appendChild(script);
  }

  function downloadOne(slot, idx) {
    const a = document.createElement("a");
    a.href = slot.result;
    a.download = `${product.name.replace(/\s+/g,"_")}_${idx + 1}.jpg`;
    a.click();
  }

  function handleRefUpload(zone, file) {
    const reader = new FileReader();
    reader.onload = e => setRefs(prev => ({ ...prev, [zone]: e.target.result }));
    reader.readAsDataURL(file);
  }

  const filteredPoses = ALL_POSES.filter(p => {
    const matchCat = poseCat === "All" || p.category === poseCat;
    const matchSearch = !poseSearch || p.name.toLowerCase().includes(poseSearch.toLowerCase()) || p.desc.toLowerCase().includes(poseSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const S = {
    page: { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',sans-serif", padding:24 },
    card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 },
    label: { fontSize:12, color:C.muted, marginBottom:6, display:"block" },
    input: { width:"100%", background:C.surf, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" },
    btn: (color="#6366f1", outline=false) => ({
      padding:"9px 18px", borderRadius:8, border:outline?`1px solid ${color}`:"none",
      background:outline?"transparent":color, color:outline?color:"#fff",
      cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"opacity 0.15s"
    }),
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.5px" }}>Image Studio</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>AI-powered product photography · Actiwear</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setShowKeyModal(true)} style={{ ...S.btn(C.border, true), fontSize:12, color:C.muted }}>
            🔑 API Keys ({validKeys.length}/3)
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:20 }}>
        {/* Left panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Product details */}
          <div style={S.card}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Product Details</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <label style={S.label}>Product Name *</label>
                <input style={S.input} value={product.name} onChange={e => setProduct(p => ({...p, name:e.target.value}))} placeholder="e.g. Apex Training T-Shirt" />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={S.label}>Type</label>
                  <select style={S.input} value={product.type} onChange={e => setProduct(p => ({...p, type:e.target.value}))}>
                    {PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Gender</label>
                  <select style={S.input} value={product.gender} onChange={e => setProduct(p => ({...p, gender:e.target.value}))}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <label style={S.label}>Color</label>
                  <input style={S.input} value={product.color} onChange={e => setProduct(p => ({...p, color:e.target.value}))} placeholder="e.g. Midnight Black" />
                </div>
                <div>
                  <label style={S.label}>Brand</label>
                  <input style={S.input} value={product.brand} onChange={e => setProduct(p => ({...p, brand:e.target.value}))} />
                </div>
              </div>
              <div>
                <label style={S.label}>Design Notes</label>
                <textarea style={{ ...S.input, resize:"vertical", lineHeight:1.5 }} rows={3}
                  value={product.designNotes} onChange={e => setProduct(p => ({...p, designNotes:e.target.value}))}
                  placeholder="Logo placement, patterns, special features, reflective strips, mesh panels..." />
              </div>
            </div>
          </div>

          {/* Reference photos */}
          <div style={S.card}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Reference Photos</div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:14 }}>Upload your actual product photos for better AI accuracy</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {["front","back","side","logo"].map(zone => (
                <label key={zone} style={{ cursor:"pointer" }}>
                  <div style={{ border:`1px dashed ${refs[zone] ? C.teal : C.border}`, borderRadius:8, padding:12, textAlign:"center", background: refs[zone] ? `${C.teal}10` : "transparent", transition:"all 0.2s", position:"relative", overflow:"hidden" }}>
                    {refs[zone] ? (
                      <img src={refs[zone]} alt={zone} style={{ width:"100%", height:80, objectFit:"cover", borderRadius:4 }} />
                    ) : (
                      <>
                        <div style={{ fontSize:20, marginBottom:4 }}>📷</div>
                        <div style={{ fontSize:11, color:C.muted, textTransform:"capitalize" }}>{zone} View</div>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => e.target.files[0] && handleRefUpload(zone, e.target.files[0])} />
                </label>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <div style={S.card}>
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <button onClick={generateAll} disabled={generating} style={{ ...S.btn(), flex:1, fontSize:14, fontWeight:700 }}>
                {generating ? `⏳ Generating... ${doneCount}/8` : "⚡ Generate 8 Images"}
              </button>
              {generating && (
                <button onClick={() => { stopRef.current = true; setStopped(true); }} style={S.btn(C.danger, true)}>■ Stop</button>
              )}
            </div>
            {generating && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:C.muted }}>Progress</span>
                  <span style={{ fontSize:12, color:C.text }}>{progress}%</span>
                </div>
                <div style={{ height:6, background:C.border, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${progress}%`, background:C.purple, borderRadius:3, transition:"width 0.3s" }} />
                </div>
                <div style={{ display:"flex", gap:4, marginTop:10 }}>
                  {slots.map((s, i) => (
                    <div key={i} style={{ flex:1, height:6, borderRadius:2, background: s.status==="done"?C.teal : s.status==="generating"?C.amber : s.status==="error"?C.danger : C.border, transition:"background 0.3s" }} />
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:10, marginTop:generating?14:0 }}>
              <button onClick={randomizeVaried} style={{ ...S.btn(C.border, true), flex:1, fontSize:12, color:C.muted }}>
                🎲 Randomize Varied Slots
              </button>
              {doneCount > 0 && (
                <button onClick={downloadAll} style={{ ...S.btn(C.teal), fontSize:12 }}>
                  ⬇ ZIP ({doneCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — 8 image slots */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600 }}>Image Slots</div>
            <div style={{ fontSize:12, color:C.muted }}>Click slot header to change pose · Varied slots can be randomized</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {slots.map((slot, i) => {
              const pose = ALL_POSES.find(p => p.id === slot.poseId) || ALL_POSES[0];
              const catColor = CAT_COLORS[pose.category] || C.purple;
              return (
                <div key={i} style={{ ...S.card, padding:0, overflow:"hidden" }}>
                  {/* Slot header */}
                  <div onClick={() => setShowPosePicker(i)} style={{ padding:"10px 12px", background:C.surf, borderBottom:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:catColor, flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{pose.name}</div>
                      <div style={{ fontSize:10, color:C.muted }}>{pose.category} {slot.varied && "· varied"}</div>
                    </div>
                    <span style={{ fontSize:10, color:C.muted }}>#{i+1}</span>
                  </div>

                  {/* Image area */}
                  <div style={{ aspectRatio:"3/4", background:C.surf, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                    {slot.status === "done" && slot.result ? (
                      <div style={{ position:"relative", width:"100%", height:"100%" }}>
                        <img src={slot.result} alt={pose.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:0, transition:"all 0.2s" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(0,0,0,0.5)" || (e.currentTarget.style.opacity="1")}
                          onMouseLeave={e => e.currentTarget.style.background="rgba(0,0,0,0)" || (e.currentTarget.style.opacity="0")}>
                          <button onClick={() => regenerateSlot(i)} style={{ ...S.btn(C.purple), padding:"6px 10px", fontSize:12 }}>↻</button>
                          <button onClick={() => downloadOne(slot, i)} style={{ ...S.btn(C.teal), padding:"6px 10px", fontSize:12 }}>⬇</button>
                        </div>
                      </div>
                    ) : slot.status === "generating" ? (
                      <div style={{ textAlign:"center", color:C.amber }}>
                        <div style={{ fontSize:24, marginBottom:8, animation:"pulse 1s infinite" }}>⏳</div>
                        <div style={{ fontSize:11 }}>Generating...</div>
                      </div>
                    ) : slot.status === "error" ? (
                      <div style={{ textAlign:"center", padding:12 }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>❌</div>
                        <div style={{ fontSize:10, color:C.danger, marginBottom:8, lineHeight:1.4 }}>{slot.error?.slice(0,60)}</div>
                        <button onClick={() => regenerateSlot(i)} style={{ ...S.btn(C.purple), padding:"5px 10px", fontSize:11 }}>Retry</button>
                      </div>
                    ) : slot.status === "pending" ? (
                      <div style={{ textAlign:"center", color:C.muted }}>
                        <div style={{ fontSize:20, marginBottom:6 }}>⏸</div>
                        <div style={{ fontSize:11 }}>Pending</div>
                      </div>
                    ) : (
                      <div style={{ textAlign:"center", color:C.muted }}>
                        <div style={{ fontSize:28, marginBottom:8 }}>🖼</div>
                        <div style={{ fontSize:11, lineHeight:1.5, padding:"0 8px" }}>{pose.desc.slice(0,60)}...</div>
                      </div>
                    )}
                  </div>

                  {/* Filename */}
                  {product.name && (
                    <div style={{ padding:"6px 12px", borderTop:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:10, color:C.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {product.name.replace(/\s+/g,"_")}_{i+1}.jpg
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
          onClick={e => e.target===e.currentTarget && setShowKeyModal(false)}>
          <div style={{ ...S.card, width:480, maxWidth:"90vw" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>Gemini API Keys</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
              Add up to 3 API keys for automatic rotation. Each key gives ~1,500 images/day free.<br/>
              Get keys at <span style={{ color:C.purple }}>aistudio.google.com</span> → API Keys → Create API key
            </div>
            {[0,1,2].map(idx => (
              <div key={idx} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <label style={{ ...S.label, margin:0 }}>Key {idx+1}</label>
                  {apiKeys[idx].length > 20 && <span style={{ fontSize:11, color:C.teal }}>✓ Valid</span>}
                </div>
                <input type="password" placeholder="AIza..." value={apiKeys[idx]}
                  onChange={e => setApiKeys(prev => prev.map((k,i) => i===idx ? e.target.value : k))}
                  style={S.input} />
              </div>
            ))}
            <div style={{ padding:"12px 14px", background:`${C.teal}10`, border:`1px solid ${C.teal}30`, borderRadius:8, fontSize:12, color:C.teal, marginBottom:16 }}>
              ✓ {validKeys.length} key{validKeys.length!==1?"s":""} configured · ~{validKeys.length*1500} images/day capacity
            </div>
            <button onClick={() => setShowKeyModal(false)} style={{ ...S.btn(), width:"100%" }}>Save & Close</button>
          </div>
        </div>
      )}

      {/* Pose Picker Modal */}
      {showPosePicker !== null && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
          onClick={e => e.target===e.currentTarget && setShowPosePicker(null)}>
          <div style={{ ...S.card, width:680, maxWidth:"90vw", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>Select Pose — Slot {showPosePicker + 1}</div>
            <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>50 poses across 10 categories</div>

            {/* Search */}
            <input placeholder="Search poses..." value={poseSearch} onChange={e => setPoseSearch(e.target.value)}
              style={{ ...S.input, marginBottom:12 }} />

            {/* Category filter */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              {["All",...Object.keys(POSES)].map(cat => (
                <button key={cat} onClick={() => setPoseCat(cat)} style={{
                  padding:"4px 10px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, fontFamily:"inherit",
                  background: poseCat===cat ? (CAT_COLORS[cat]||C.purple) : C.surf,
                  color: poseCat===cat ? "#fff" : C.muted
                }}>{cat}</button>
              ))}
            </div>

            {/* Pose list */}
            <div style={{ overflowY:"auto", flex:1 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {filteredPoses.map(pose => {
                  const isSelected = slots[showPosePicker]?.poseId === pose.id;
                  const catColor = CAT_COLORS[pose.category] || C.purple;
                  return (
                    <div key={pose.id} onClick={() => {
                        setSlots(prev => prev.map((s,i) => i===showPosePicker ? {...s, poseId:pose.id, label:pose.name} : s));
                        setShowPosePicker(null);
                      }}
                      style={{ padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1px solid ${isSelected ? catColor : C.border}`, background:isSelected ? `${catColor}15` : C.surf, transition:"all 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:catColor, flexShrink:0 }} />
                        <span style={{ fontSize:13, fontWeight:600 }}>{pose.name}</span>
                        <span style={{ fontSize:10, color:catColor, background:`${catColor}20`, padding:"1px 6px", borderRadius:10, marginLeft:"auto" }}>{pose.category}</span>
                      </div>
                      <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{pose.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setShowPosePicker(null)} style={{ ...S.btn(C.border, true), marginTop:14, color:C.muted }}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        input:focus, textarea:focus, select:focus { outline: 1px solid #6366f1; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2A2A3E; border-radius: 2px; }
        select option { background: #1A1A26; }
      `}</style>
    </div>
  );
}
