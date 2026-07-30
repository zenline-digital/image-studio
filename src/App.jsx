import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════
//  CONSTANTS — MODELS
// ═══════════════════════════════════════════════════
const GARMENT_TYPES = ["T-Shirt","Tank Top","Shorts","Leggings","Sports Bra","Hoodie","Joggers","Zip Jacket","Gym Vest","Long Sleeve Top","Polo Shirt","Compression Tights"];

const MALE_MODELS = [
  {id:"m1", name:"Kai",     tag:"East Asian",       desc:"Athletic East Asian male, 26 years old, lean defined muscular physique, short black neatly styled hair, sharp Korean jawline, clear complexion, confident expression"},
  {id:"m2", name:"Arjun",   tag:"South Asian",      desc:"Athletic South Asian male, 29 years old, medium-dark complexion, short black hair, strong muscular build, defined shoulders, sharp Indian features"},
  {id:"m3", name:"Marcus",  tag:"West African",     desc:"Athletic West African male, 25 years old, very dark complexion, short natural hair, powerfully built wide shoulders, thick muscular arms, commanding presence"},
  {id:"m4", name:"Jomo",    tag:"East African",     desc:"Athletic East African male, 27 years old, dark complexion, close-cropped hair, tall lean build with long limbs, high cheekbones, runner's physique"},
  {id:"m5", name:"Luca",    tag:"European",         desc:"Athletic Southern European male, 28 years old, fair skin, light brown hair, blue-green eyes, well-built gym physique, clean sharp jawline"},
  {id:"m6", name:"Alexei",  tag:"Eastern European", desc:"Athletic Eastern European male, 27 years old, fair complexion, short dark hair, very strong muscular build, prominent cheekbones, intense expression"},
  {id:"m7", name:"Tariq",   tag:"Middle Eastern",   desc:"Athletic Lebanese male, 28 years old, warm olive complexion, short black hair, well-groomed dark stubble beard, strong lean build, handsome features"},
  {id:"m8", name:"Diego",   tag:"Latin",            desc:"Athletic Brazilian male, 25 years old, tan complexion, short dark wavy hair, muscular athletic build, warm skin tone, confident charming expression"},
  {id:"m9", name:"Yuto",    tag:"Japanese",         desc:"Athletic Japanese male, 27 years old, fair East Asian complexion, short black hair slightly textured, slim very toned physique, refined sharp features"},
  {id:"m10",name:"Andre",   tag:"African American", desc:"Athletic African-American male, 26 years old, medium-dark complexion, short fade haircut, muscular defined build, broad chest, strong jaw"},
  {id:"m11",name:"Kofi",    tag:"Ghanaian",         desc:"Athletic Ghanaian male, 28 years old, very dark complexion, shaved head, massively powerful build, thick arms and chest, extremely broad shoulders"},
  {id:"m12",name:"Rajan",   tag:"Sri Lankan",       desc:"Athletic Sri Lankan male, 26 years old, dark brown complexion, short black hair, lean defined natural musculature, naturally athletic South Asian build"},
  {id:"m13",name:"Erik",    tag:"Nordic",           desc:"Athletic Scandinavian male, 28 years old, very fair skin, short blond hair, pale blue eyes, tall lean athletic build, defined muscles, Nordic features"},
  {id:"m14",name:"Malik",   tag:"African American", desc:"Athletic African-American male, 27 years old, dark complexion, short natural textured hair, very muscular defined build, broad shoulders, intense expression"},
  {id:"m15",name:"Cyrus",   tag:"Persian",          desc:"Athletic Iranian male, 29 years old, medium olive complexion, short dark hair, short trimmed beard, strong lean athletic build, handsome Middle Eastern features"},
  {id:"m16",name:"Taka",    tag:"Pacific Islander", desc:"Athletic Polynesian male, 26 years old, warm brown complexion, short black hair, stocky powerfully built physique, very broad shoulders, Pacific Islander features"},
  {id:"m17",name:"Carlos",  tag:"Mexican",          desc:"Athletic Mexican male, 28 years old, medium tan complexion, short dark hair, lean defined athletic build, friendly confident expression, Latin features"},
  {id:"m18",name:"Amir",    tag:"Arab",             desc:"Athletic Arab male, 27 years old, warm olive complexion, short dark neat hair, clean shaven, lean muscular build, handsome sharp features, UAE look"},
  {id:"m19",name:"Samson",  tag:"Nigerian",         desc:"Athletic Nigerian male, 26 years old, very dark complexion, short natural hair, extremely broad shoulders, tall powerfully built physique, commanding presence"},
  {id:"m20",name:"Wei",     tag:"Chinese",          desc:"Athletic Chinese male, 25 years old, fair East Asian complexion, black hair neatly styled with slight wave, slim very toned physique, sharp refined features"},
];

const FEMALE_MODELS = [
  {id:"f1", name:"Soo-Jin",  tag:"Korean",               desc:"Athletic Korean female, 24 years old, lean toned build, long black straight hair, clear fair complexion, high cheekbones, graceful features, fitness model physique"},
  {id:"f2", name:"Priya",    tag:"South Asian",           desc:"Athletic South Asian female, 26 years old, warm golden complexion, long dark hair, toned defined physique, beautiful Indian features, high cheekbones, confident"},
  {id:"f3", name:"Amara",    tag:"West African",          desc:"Athletic West African female, 24 years old, very dark complexion, natural afro hair, powerfully toned build, wide shoulders, beautiful strong features"},
  {id:"f4", name:"Zara",     tag:"East African",          desc:"Athletic East African female, 25 years old, dark complexion, long box braids, tall lean build, very long legs, refined high cheekbones, elegant"},
  {id:"f5", name:"Emma",     tag:"European",              desc:"Athletic Northern European female, 25 years old, fair skin, long blonde hair, light blue eyes, toned athletic build with feminine curves, bright smile"},
  {id:"f6", name:"Sofia",    tag:"Southern European",     desc:"Athletic Italian female, 26 years old, medium-fair complexion, long brunette hair, green eyes, fit curvy athletic build, warm Mediterranean features"},
  {id:"f7", name:"Layla",    tag:"Lebanese",              desc:"Athletic Lebanese female, 25 years old, warm olive complexion, long dark wavy hair, lean toned figure, almond-shaped dark eyes, beautiful Arab features"},
  {id:"f8", name:"Isabella", tag:"Latin",                 desc:"Athletic Brazilian female, 24 years old, warm tan complexion, long dark wavy hair, curvy athletic build, striking Latina features, warm confident smile"},
  {id:"f9", name:"Yuki",     tag:"Japanese",              desc:"Athletic Japanese female, 24 years old, fair East Asian complexion, straight black hair to shoulders, slim very toned physique, delicate refined features"},
  {id:"f10",name:"Mia",      tag:"Mixed Heritage",        desc:"Athletic mixed-heritage female, 25 years old, medium caramel complexion, curly dark hair, lean defined athletic build, striking mixed European-African features"},
  {id:"f11",name:"Aisha",    tag:"West African",          desc:"Athletic West African female, 24 years old, very dark complexion, short natural hair, powerfully toned build, broad shoulders, strong beautiful features"},
  {id:"f12",name:"Nisha",    tag:"Southeast Asian",       desc:"Athletic Thai female, 25 years old, warm medium complexion, long black hair, lean defined physique, graceful Southeast Asian features, athletic and elegant"},
  {id:"f13",name:"Astrid",   tag:"Nordic",                desc:"Athletic Scandinavian female, 26 years old, very fair skin, long blonde hair, light blue eyes, tall lean athletic build, classic Nordic fitness model look"},
  {id:"f14",name:"Keisha",   tag:"African American",      desc:"Athletic African-American female, 25 years old, medium-dark complexion, natural curly hair, toned athletic build, beautiful strong features, radiant smile"},
  {id:"f15",name:"Leila",    tag:"Persian",               desc:"Athletic Iranian female, 25 years old, warm golden olive complexion, long dark wavy hair, lean toned figure, beautiful sharp Middle Eastern features"},
  {id:"f16",name:"Mei",      tag:"Chinese",               desc:"Athletic Chinese female, 24 years old, fair complexion, sleek black bob haircut, lean defined muscular build, sharp refined features, modern athletic look"},
  {id:"f17",name:"Camila",   tag:"Venezuelan",            desc:"Athletic Venezuelan female, 26 years old, medium complexion, long dark wavy hair, curvy toned athletic figure, striking Latina features, beautiful and fit"},
  {id:"f18",name:"Nadia",    tag:"Mixed African/European",desc:"Athletic mixed African-European female, 24 years old, warm caramel complexion, curly light-brown hair, lean defined athletic build, striking mixed features"},
  {id:"f19",name:"Fatou",    tag:"Senegalese",            desc:"Athletic Senegalese female, 25 years old, very dark complexion, long micro braids, strong toned build, broad shoulders, tall and powerful, regal presence"},
  {id:"f20",name:"Aria",     tag:"Mediterranean",         desc:"Athletic Greek female, 26 years old, warm medium olive complexion, long dark wavy hair, dark expressive eyes, lean fit physique, striking Mediterranean beauty"},
];

// ═══════════════════════════════════════════════════
//  CONSTANTS — POSES
// ═══════════════════════════════════════════════════
const POSE_POOL = [
  {id:"hero_front",   name:"Hero Front",         cat:"Standard", desc:"Full body front-facing, arms at sides, centered, confident athletic stance, complete garment fully visible from head to feet"},
  {id:"back_view",    name:"Back View",           cat:"Standard", desc:"Turned completely around showing full back, back panel of garment visible, looking away or slight over-shoulder glance"},
  {id:"front_left",   name:"¾ Front Left",        cat:"Standard", desc:"Body angled 45° to the left, natural casual stance, mostly front of garment visible, slight weight shift"},
  {id:"upper_close",  name:"Upper Body Close-Up", cat:"Standard", desc:"Framed from waist to top of head only, chest and upper body in focus, garment chest design and collar detail prominent"},
  {id:"flat_lay",     name:"Flat Lay – Front",    cat:"Flat Lay", desc:"Garment laid flat on pure white surface, front side up, top-down overhead shot, perfectly centered and neat"},
  {id:"action_run",   name:"Running Stride",      cat:"Action",   desc:"Mid-stride running pose, one leg extended forward, arms in natural running motion, dynamic athletic movement, full body"},
  {id:"hands_hips",   name:"Hands on Hips",       cat:"Lifestyle",desc:"Both hands on hips, front-facing, confident power pose, full garment front visible, strong athletic expression"},
  {id:"fabric_macro", name:"Fabric Macro",        cat:"Detail",   desc:"Extreme close-up of the fabric texture and weave, logo or design element in sharp focus, premium material quality visible"},
  {id:"side_profile", name:"Side Profile",        cat:"Standard", desc:"Body turned exactly 90° to the side, full side profile visible, arms natural, garment side silhouette and seams clear"},
  {id:"arms_crossed", name:"Arms Crossed",        cat:"Lifestyle",desc:"Arms crossed over chest, front-facing, relaxed confident expression, upper to full body framing, casual power pose"},
  {id:"squat_pose",   name:"Squat Position",      cat:"Action",   desc:"In a deep squat position showing flexibility and athleticism, front-facing, garment fit and stretch visible"},
  {id:"overhead_reach",name:"Overhead Reach",     cat:"Action",   desc:"Arms raised overhead or reaching up, showing garment torso and waist area, full body, dynamic stretching motion"},
];

const DEFAULT_SLOTS = [
  POSE_POOL[0], // Hero Front
  POSE_POOL[1], // Back View
  POSE_POOL[2], // ¾ Front Left
  POSE_POOL[3], // Upper Body Close-Up
  POSE_POOL[4], // Flat Lay
  POSE_POOL[5], // Running Stride
  POSE_POOL[6], // Hands on Hips
  POSE_POOL[7], // Fabric Macro
];

const OUTPUT_SIZES = [
  {label:"1080 × 1350  (Instagram Portrait 4:5)", w:1080, h:1350},
  {label:"1080 × 1080  (Instagram Square 1:1)",   w:1080, h:1080},
  {label:"1948 × 2656  (Large Portrait — Print)",  w:1948, h:2656},
  {label:"1080 × 1920  (Stories / Reels 9:16)",   w:1080, h:1920},
];

const CAT_COLOR = {Standard:"#3b82f6",Action:"#f97316","Flat Lay":"#8b5cf6",Lifestyle:"#06b6d4",Detail:"#ec4899"};

// ═══════════════════════════════════════════════════
//  API UTILITIES
// ═══════════════════════════════════════════════════
async function callGemini(apiKey, parts, temperature = 0.25) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      contents:[{parts}],
      generationConfig:{responseModalities:["IMAGE","TEXT"], temperature},
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error?.message || `Gemini API error ${res.status}`);
  }
  const data = await res.json();
  const rp = data.candidates?.[0]?.content?.parts || [];
  const img = rp.find(p => p.inlineData?.data);
  if (!img) {
    const txt = rp.find(p=>p.text)?.text || "";
    throw new Error(txt || "No image returned. Please retry.");
  }
  return img.inlineData;
}

async function toOutputSpec(dataURL, w, h, quality = 0.95) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      const ratio = Math.min(w / img.width, h / img.height);
      const sw = Math.round(img.width * ratio);
      const sh = Math.round(img.height * ratio);
      ctx.drawImage(img, (w-sw)/2, (h-sh)/2, sw, sh);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

async function resizeSquare(dataURL, size = 280) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d");
      ctx.fillStyle="#fff";
      ctx.fillRect(0,0,size,size);
      const s = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width-s)/2, (img.height-s)/2, s, s, 0, 0, size, size);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

// Canvas-based background removal for Enhance mode
async function canvasEnhance(dataURL, outW, outH, quality) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      // Step 1: remove background
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img,0,0);
      const id = ctx.getImageData(0,0,c.width,c.height);
      const d = id.data;
      // Sample bg from corners (offset 5px inside to avoid border artifacts)
      const off = Math.max(5, Math.round(Math.min(c.width,c.height)*0.02));
      const samples = [];
      for(let dx=-off;dx<=off;dx+=off) for(let dy=-off;dy<=off;dy+=off){
        const px = Math.max(0,Math.min(c.width-1,(dx>=0?dx:c.width+dx)));
        const py = Math.max(0,Math.min(c.height-1,(dy>=0?dy:c.height+dy)));
        const pi=(py*c.width+px)*4;
        samples.push([d[pi],d[pi+1],d[pi+2]]);
      }
      const bgR=Math.round(samples.reduce((s,v)=>s+v[0],0)/samples.length);
      const bgG=Math.round(samples.reduce((s,v)=>s+v[1],0)/samples.length);
      const bgB=Math.round(samples.reduce((s,v)=>s+v[2],0)/samples.length);
      // Flood fill from edges
      const visited=new Uint8Array(c.width*c.height);
      const queue=[];
      for(let x=0;x<c.width;x++){queue.push(x,0);queue.push(x,(c.height-1)*c.width);}
      for(let y=1;y<c.height-1;y++){queue.push(0,y*c.width);queue.push(c.width-1+y*c.width,0);}
      const thresh=45;
      while(queue.length){
        const flat=queue.pop(); const y2=Math.floor(flat/c.width); const x2=flat%c.width;
        if(x2<0||x2>=c.width||y2<0||y2>=c.height||visited[flat]) continue;
        visited[flat]=1;
        const pi=flat*4;
        if(Math.abs(d[pi]-bgR)+Math.abs(d[pi+1]-bgG)+Math.abs(d[pi+2]-bgB)>thresh*3) continue;
        d[pi]=255;d[pi+1]=255;d[pi+2]=255;
        queue.push(flat+1,flat-1,flat+c.width,flat-c.width);
      }
      ctx.putImageData(id,0,0);
      // Step 2: output spec
      const c2=document.createElement("canvas");
      c2.width=outW;c2.height=outH;
      const ctx2=c2.getContext("2d");
      ctx2.fillStyle="#FFFFFF";
      ctx2.fillRect(0,0,outW,outH);
      const r=Math.min(outW/c.width,outH/c.height)*0.9;
      const sw=c.width*r,sh=c.height*r;
      ctx2.drawImage(c,(outW-sw)/2,(outH-sh)/2,sw,sh);
      resolve(c2.toDataURL("image/jpeg",quality));
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

function buildThumbPrompt(model) {
  return `Professional fitness model portrait. ${model.desc}. Wearing plain white fitted athletic top. Waist-up shot looking directly at camera. Pure white background. Even studio lighting. High quality commercial photography. No text, no watermarks.`;
}

function buildSlotPrompt(model, garmentType, pose) {
  return `You are a professional activewear product photographer.

TASK: I am providing a reference product image of a ${garmentType}. Create a high-quality studio product photo of this EXACT ${garmentType} worn by a fitness model.

PRESERVE THE PRODUCT EXACTLY — THIS IS CRITICAL:
• Same colors — do not alter any color whatsoever
• Same logo, text, graphics — replicate with complete pixel-perfect accuracy
• Same neckline, sleeve length, cut, and silhouette
• Same fabric texture, seams, stitching, mesh panels, and material finish
• Same fit — do not make it tighter, looser, shorter, or longer

THE MODEL: ${model.desc}. Physically fit, confident, professional activewear model.

POSE FOR THIS SHOT — "${pose.name}":
${pose.desc}

TECHNICAL OUTPUT REQUIREMENTS:
• Background: pure white (#FFFFFF) — absolutely zero shadows or gradients on background
• Lighting: even professional softbox studio lighting — no harsh directional shadows on garment
• Sharp focus throughout, commercially print-ready quality
• The ${garmentType} must be the clear focal point and fully visible as the pose allows
• Clean professional activewear catalogue photography

STRICTLY PROHIBITED: Do not change product colors, logos, or design. Product must be identical to the reference image.`;
}

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════
export default function App() {
  // ── Mode ────────────────────────────────────────
  const [mode, setMode] = useState("model"); // "model" | "enhance"

  // ── API Key ────────────────────────────────────
  const [geminiKey, setGeminiKey] = useState(()=>localStorage.getItem("is_gemini_key")||"");
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState("");

  // ── Product inputs ────────────────────────────
  const [refImage, setRefImage] = useState(null);
  const [garmentType, setGarmentType] = useState("T-Shirt");
  const [gender, setGender] = useState("female");
  const [selectedModel, setSelectedModel] = useState(null);

  // ── Output config ──────────────────────────────
  const [sizeIdx, setSizeIdx] = useState(0);
  const outSize = OUTPUT_SIZES[sizeIdx];

  // ── Slots (8 poses) ────────────────────────────
  const [slots, setSlots] = useState(() =>
    DEFAULT_SLOTS.map((pose, i) => ({idx:i, pose, image:null, status:"idle", error:null}))
  );
  const [activePoseSlot, setActivePoseSlot] = useState(null); // slot index being configured
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const stopRef = useRef(false);

  // ── Enhance mode ──────────────────────────────
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceMode, setEnhanceMode] = useState("canvas"); // "canvas" | "ai"

  // ── Model gallery ─────────────────────────────
  const [showGallery, setShowGallery] = useState(false);
  const [galleryTab, setGalleryTab] = useState("female");
  const [thumbs, setThumbs] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("is_model_thumbs")||"{}")}catch{return {}}
  });
  const [thumbLoading, setThumbLoading] = useState({});
  const [isGenAllThumbs, setIsGenAllThumbs] = useState(false);
  const genAllRef = useRef(false);

  // ── Stats ─────────────────────────────────────
  const [totalGenerated, setTotalGenerated] = useState(()=>parseInt(localStorage.getItem("is_total_gen")||"0"));

  // ── Gallery ───────────────────────────────────
  const [savedGallery, setSavedGallery] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("is_saved_gallery")||"[]")}catch{return []}
  });
  const [lightboxImg, setLightboxImg] = useState(null);

  const fileRef = useRef();

  // ── Settings ──────────────────────────────────
  const openSettings = () => { setTempKey(geminiKey); setShowSettings(true); };
  const saveSettings = () => {
    localStorage.setItem("is_gemini_key", tempKey.trim());
    setGeminiKey(tempKey.trim());
    setShowSettings(false);
  };

  // ── File upload ───────────────────────────────
  const handleFile = f => {
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => {
      const url = e.target.result;
      setRefImage({data:url.split(",")[1], mime:f.type, preview:url});
      setSlots(prev=>prev.map(s=>({...s,image:null,status:"idle",error:null})));
      setEnhancedImage(null);
    };
    r.readAsDataURL(f);
  };

  // ── Model thumbnails ──────────────────────────
  const saveThumb = useCallback((id, dataURL) => {
    setThumbs(prev=>{
      const u={...prev,[id]:dataURL};
      try{localStorage.setItem("is_model_thumbs",JSON.stringify(u))}catch{
        try{localStorage.setItem("is_model_thumbs",JSON.stringify({[id]:dataURL}))}catch{}
      }
      return u;
    });
  },[]);

  const generateThumb = useCallback(async (model) => {
    if (!geminiKey||thumbs[model.id]||thumbLoading[model.id]) return;
    setThumbLoading(p=>({...p,[model.id]:true}));
    try {
      const img = await callGemini(geminiKey,[{text:buildThumbPrompt(model)}],0.45);
      const r = await resizeSquare(`data:${img.mimeType};base64,${img.data}`,280);
      saveThumb(model.id,r);
    } catch {}
    finally { setThumbLoading(p=>({...p,[model.id]:false})); }
  },[geminiKey,thumbs,thumbLoading,saveThumb]);

  const generateAllThumbs = async () => {
    if (!geminiKey) return;
    setIsGenAllThumbs(true); genAllRef.current=true;
    const models = galleryTab==="male"?MALE_MODELS:FEMALE_MODELS;
    const missing = models.filter(m=>!thumbs[m.id]);
    for (let i=0;i<missing.length;i+=3) {
      if(!genAllRef.current) break;
      await Promise.all(missing.slice(i,i+3).map(generateThumb));
      await new Promise(r=>setTimeout(r,700));
    }
    setIsGenAllThumbs(false); genAllRef.current=false;
  };

  useEffect(()=>{
    if(!showGallery||!geminiKey) return;
    const models=(galleryTab==="male"?MALE_MODELS:FEMALE_MODELS).slice(0,8);
    models.filter(m=>!thumbs[m.id]&&!thumbLoading[m.id]).forEach(generateThumb);
  },[showGallery,galleryTab]); // eslint-disable-line

  const selectModel = m => { setSelectedModel(m); setShowGallery(false); };
  const switchGender = g => { setGender(g); if(selectedModel&&selectedModel.id[0]!==g[0]) setSelectedModel(null); };
  const openGallery = () => { setGalleryTab(gender); setShowGallery(true); };

  // ── Slot pose change ──────────────────────────
  const changePose = (slotIdx, pose) => {
    setSlots(prev=>prev.map((s,i)=>i===slotIdx?{...s,pose,image:null,status:"idle",error:null}:s));
    setActivePoseSlot(null);
  };

  const randomizeSlots = (from=4) => {
    const variable = POSE_POOL.slice(4);
    const shuffled = [...variable].sort(()=>Math.random()-0.5);
    setSlots(prev=>prev.map((s,i)=>{
      if(i<from) return s;
      const newPose=shuffled[i-from]||s.pose;
      return {...s,pose:newPose,image:null,status:"idle",error:null};
    }));
  };

  // ── Generate a single slot ────────────────────
  const generateSlot = async (slotIdx) => {
    if (!geminiKey||!refImage||!selectedModel) return;
    const pose = slots[slotIdx].pose;
    setSlots(prev=>prev.map((s,i)=>i===slotIdx?{...s,status:"generating",error:null}:s));
    try {
      const img = await callGemini(geminiKey,[
        {inlineData:{mimeType:refImage.mime, data:refImage.data}},
        {text:buildSlotPrompt(selectedModel,garmentType,pose)},
      ],0.2);
      const raw = `data:${img.mimeType};base64,${img.data}`;
      const processed = await toOutputSpec(raw, outSize.w, outSize.h, 0.95);
      setSlots(prev=>prev.map((s,i)=>i===slotIdx?{...s,status:"done",image:processed,error:null}:s));
      setTotalGenerated(n=>{
        const next=n+1;
        localStorage.setItem("is_total_gen",String(next));
        return next;
      });
    } catch(e) {
      setSlots(prev=>prev.map((s,i)=>i===slotIdx?{...s,status:"error",error:e.message}:s));
    }
  };

  // ── Generate sample (slot 0 only) ─────────────
  const generateSample = async () => {
    if (!geminiKey||!refImage||!selectedModel) return;
    stopRef.current=false;
    await generateSlot(0);
  };

  // ── Generate remaining (slots 1-7) ────────────
  const generateRemaining = async () => {
    if (!geminiKey||!refImage||!selectedModel) return;
    setIsGeneratingAll(true);
    stopRef.current=false;
    for(let i=1;i<8;i++){
      if(stopRef.current) break;
      await generateSlot(i);
      await new Promise(r=>setTimeout(r,500));
    }
    setIsGeneratingAll(false);
  };

  // ── Generate all 8 ───────────────────────────
  const generateAll = async () => {
    if (!geminiKey||!refImage||!selectedModel) return;
    setIsGeneratingAll(true);
    stopRef.current=false;
    for(let i=0;i<8;i++){
      if(stopRef.current) break;
      await generateSlot(i);
      await new Promise(r=>setTimeout(r,500));
    }
    setIsGeneratingAll(false);
  };

  const stopGenerating = () => { stopRef.current=true; setIsGeneratingAll(false); };

  // ── Enhance reference ─────────────────────────
  const runEnhance = async () => {
    if (!refImage) return;
    setIsEnhancing(true); setEnhancedImage(null);
    try {
      if (enhanceMode==="ai") {
        const img = await callGemini(geminiKey,[
          {inlineData:{mimeType:refImage.mime,data:refImage.data}},
          {text:`Professional product photographer task: Take this product image and output it with a perfectly pure white (#FFFFFF) background. Keep the product EXACTLY the same — same size, same colors, same logo, same design, same proportions. Just remove any existing background and place on clean pure white. Add clean even studio lighting. Professional product photography quality. High resolution, sharp, no shadows on white background.`},
        ],0.15);
        const raw=`data:${img.mimeType};base64,${img.data}`;
        const out=await toOutputSpec(raw,outSize.w,outSize.h,0.95);
        setEnhancedImage(out);
      } else {
        const out=await canvasEnhance(refImage.preview,outSize.w,outSize.h,0.95);
        setEnhancedImage(out);
      }
    } catch(e) {
      alert("Enhance failed: "+e.message);
    } finally { setIsEnhancing(false); }
  };

  // ── Gallery ───────────────────────────────────
  const saveSlotToGallery = (slot) => {
    if (!slot.image) return;
    const item={id:Date.now(),url:slot.image,model:selectedModel?.name,tag:selectedModel?.tag,garment:garmentType,pose:slot.pose.name,gender,date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short"})};
    const u=[item,...savedGallery].slice(0,80);
    setSavedGallery(u);
    try{localStorage.setItem("is_saved_gallery",JSON.stringify(u))}catch{}
  };
  const saveAllToGallery = () => {
    const done=slots.filter(s=>s.image);
    const items=done.map(s=>({id:Date.now()+s.idx,url:s.image,model:selectedModel?.name,tag:selectedModel?.tag,garment:garmentType,pose:s.pose.name,gender,date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}));
    const u=[...items,...savedGallery].slice(0,80);
    setSavedGallery(u);
    try{localStorage.setItem("is_saved_gallery",JSON.stringify(u))}catch{}
  };
  const downloadSlot = (slot) => {
    if (!slot.image) return;
    const a=document.createElement("a");
    a.href=slot.image;
    a.download=`thugfit_${selectedModel?.name||"model"}_${slot.pose.name.replace(/ /g,"_")}.jpg`;
    a.click();
  };
  const downloadAll = () => slots.filter(s=>s.image).forEach((s,i)=>setTimeout(()=>downloadSlot(s),i*200));
  const deleteFromGallery = id => {
    const u=savedGallery.filter(i=>i.id!==id);
    setSavedGallery(u);
    try{localStorage.setItem("is_saved_gallery",JSON.stringify(u))}catch{}
  };

  // ── Computed ──────────────────────────────────
  const galleryModels = galleryTab==="male"?MALE_MODELS:FEMALE_MODELS;
  const missingThumbs = galleryModels.filter(m=>!thumbs[m.id]).length;
  const doneSlots = slots.filter(s=>s.status==="done").length;
  const anyGenerating = slots.some(s=>s.status==="generating");
  const slot0done = slots[0].status==="done";
  const canGenerate = !!(geminiKey&&refImage&&selectedModel);
  const estimatedCost = (totalGenerated*0.04).toFixed(2);

  // ── Slot status helpers ────────────────────────
  const slotBg = s => s.status==="done"?"#0a1a0a":s.status==="error"?"#1a0a0a":s.status==="generating"?"#0a0a1a":"#0a0a12";
  const slotBorder = s => s.status==="done"?"#16a34a30":s.status==="error"?"#ef444430":s.status==="generating"?"#7c3aed60":"#1a1a2e";

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  return (
    <div style={{minHeight:"100vh",background:"#0d0d16",color:"#e2e8f0",fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",fontSize:14}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0d0d16;} ::-webkit-scrollbar-thumb{background:#2a2a40;border-radius:2px;}
        select option{background:#0d0d16;color:#e2e8f0;}
        input::placeholder{color:#2a2a40;}
        .slot-card:hover .slot-actions{opacity:1!important;}
        .gcard:hover .gdel{opacity:1!important;}
        .model-card:hover{border-color:#7c3aed80!important;transform:translateY(-2px);box-shadow:0 6px 20px #7c3aed15;}
        .pose-pick:hover{background:#1a1a2e!important;border-color:#3a3a5c!important;}
        .btn-hover:hover{opacity:.85;}
      `}</style>

      {/* ╔══ HEADER ══╗ */}
      <header style={{background:"#09090f",borderBottom:"1px solid #1a1a2e",padding:"0 24px",display:"flex",alignItems:"center",height:54,gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:8}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#7c3aed,#2563eb)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📸</div>
          <div>
            <div style={{fontWeight:800,fontSize:15,letterSpacing:"-0.3px",color:"#f1f5f9"}}>Image Studio</div>
            <div style={{fontSize:10,color:"#3a3a5c",marginTop:-1}}>THUGFIT · Product on Model</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{display:"flex",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:8,padding:3,gap:2}}>
          {[["model","🤖 Product on Model"],["enhance","⭐ Enhance Reference"]].map(([m,label])=>(
            <button key={m} onClick={()=>setMode(m)} style={{padding:"5px 14px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:mode===m?"linear-gradient(135deg,#7c3aed,#2563eb)":"none",color:mode===m?"#fff":"#4a4a6a",transition:"all .15s"}}>
              {label}
            </button>
          ))}
        </div>

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {savedGallery.length>0&&<div style={{fontSize:12,color:"#4a4a6a",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:6,padding:"4px 10px",cursor:"pointer"}} onClick={()=>document.getElementById("gallery-section")?.scrollIntoView({behavior:"smooth"})}>🖼 Gallery ({savedGallery.length})</div>}
          <div style={{fontSize:12,color:"#4a4a6a",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:6,padding:"4px 10px"}}>💰 {totalGenerated} images · ~${estimatedCost}</div>
          <button onClick={openSettings} style={{background:"none",border:"1px solid #1a1a2e",color:"#64748b",padding:"5px 12px",borderRadius:7,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
            ⚙ Settings{!geminiKey&&<span style={{background:"#ef444430",color:"#f87171",padding:"1px 5px",borderRadius:3,fontSize:10}}>NO KEY</span>}
          </button>
        </div>
      </header>

      {/* ╔══ MAIN BODY ══╗ */}
      <div style={{display:"grid",gridTemplateColumns:"340px 1fr",minHeight:"calc(100vh - 54px)"}}>

        {/* ── LEFT PANEL ── */}
        <div style={{borderRight:"1px solid #1a1a2e",background:"#09090f",padding:20,display:"flex",flexDirection:"column",gap:18,overflowY:"auto"}}>

          {/* Ref image */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>① Reference Product Photo</div>
            <div
              style={{border:"2px dashed",borderColor:refImage?"#7c3aed60":"#1a1a2e",borderRadius:10,padding:refImage?0:22,textAlign:"center",cursor:"pointer",background:"#0d0d16",overflow:"hidden"}}
              onClick={()=>fileRef.current?.click()}
              onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
              onDragOver={e=>e.preventDefault()}
            >
              {refImage
                ?<img src={refImage.preview} style={{width:"100%",maxHeight:200,objectFit:"contain",display:"block",background:"#0a0a14",borderRadius:9}} alt="ref"/>
                :<><div style={{fontSize:32,marginBottom:6}}>📷</div><div style={{color:"#2a2a40",fontSize:12}}>Drop product photo here or click</div><div style={{color:"#1a1a2e",fontSize:11,marginTop:3}}>Any background OK</div></>
              }
            </div>
            {refImage&&<button onClick={()=>{setRefImage(null);setSlots(prev=>prev.map(s=>({...s,image:null,status:"idle",error:null})));setEnhancedImage(null);}} style={{marginTop:6,width:"100%",background:"none",border:"1px solid #1a1a2e",color:"#3a3a5c",padding:"6px 0",borderRadius:7,cursor:"pointer",fontSize:11}}>✕ Remove image</button>}
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          </div>

          {/* Garment */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>② Garment Type</div>
            <select value={garmentType} onChange={e=>setGarmentType(e.target.value)} style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"10px 12px",borderRadius:8,fontSize:13,outline:"none"}}>
              {GARMENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Gender (model mode only) */}
          {mode==="model"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>③ Model Gender</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["female","♀ Female"],["male","♂ Male"]].map(([g,label])=>(
                <button key={g} onClick={()=>switchGender(g)} style={{padding:"10px 0",borderRadius:8,border:"1px solid",fontSize:13,fontWeight:700,cursor:"pointer",background:gender===g?"#7c3aed18":"#0d0d16",borderColor:gender===g?"#7c3aed":"#1a1a2e",color:gender===g?"#a78bfa":"#3a3a5c"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>}

          {/* Model selector (model mode only) */}
          {mode==="model"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>④ Choose Model</div>
            <button onClick={openGallery} style={{width:"100%",background:"#0d0d16",border:"1px solid",borderColor:selectedModel?"#7c3aed50":"#1a1a2e",padding:"11px 12px",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
              {selectedModel
                ?<>{thumbs[selectedModel.id]?<img src={thumbs[selectedModel.id]} style={{width:42,height:42,borderRadius:7,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:42,height:42,borderRadius:7,background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👤</div>}<div style={{flex:1}}><div style={{fontWeight:700,color:"#c4b5fd",fontSize:13}}>{selectedModel.name}</div><div style={{fontSize:11,color:"#3a3a5c",marginTop:1}}>{selectedModel.tag}</div></div><div style={{color:"#2a2a40",fontSize:11}}>Change▸</div></>
                :<><div style={{width:42,height:42,borderRadius:7,background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👤</div><div style={{color:"#2a2a40",fontSize:13}}>Browse &amp; select a model →</div></>
              }
            </button>
          </div>}

          {/* Output size */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{mode==="model"?"⑤":""} Output Size &amp; Format</div>
            <select value={sizeIdx} onChange={e=>setSizeIdx(Number(e.target.value))} style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"10px 12px",borderRadius:8,fontSize:12,outline:"none"}}>
              {OUTPUT_SIZES.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
            </select>
            <div style={{fontSize:11,color:"#2a2a40",marginTop:5,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
              <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:5,padding:"4px 8px",textAlign:"center"}}>JPEG 95%</div>
              <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:5,padding:"4px 8px",textAlign:"center"}}>White BG</div>
              <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:5,padding:"4px 8px",textAlign:"center"}}>{outSize.w}×{outSize.h}</div>
            </div>
          </div>

          {/* Enhance mode options */}
          {mode==="enhance"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Enhancement Method</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["canvas","⚡ Canvas\n(Instant)"],["ai","🤖 AI Gemini\n(Better quality)"]].map(([m,label])=>(
                <button key={m} onClick={()=>setEnhanceMode(m)} style={{padding:"10px 0",borderRadius:8,border:"1px solid",fontSize:11,fontWeight:700,cursor:"pointer",background:enhanceMode===m?"#7c3aed18":"#0d0d16",borderColor:enhanceMode===m?"#7c3aed":"#1a1a2e",color:enhanceMode===m?"#a78bfa":"#3a3a5c",lineHeight:1.4}}>
                  {label}
                </button>
              ))}
            </div>
            {enhanceMode==="ai"&&!geminiKey&&<div style={{fontSize:11,color:"#f87171",marginTop:6}}>⚠ AI Enhance requires a Gemini API key</div>}
            <button onClick={runEnhance} disabled={!refImage||(enhanceMode==="ai"&&!geminiKey)} style={{marginTop:10,width:"100%",padding:"12px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:800,background:(refImage&&(enhanceMode==="canvas"||geminiKey))?"linear-gradient(135deg,#7c3aed,#2563eb)":"#12121e",color:(refImage&&(enhanceMode==="canvas"||geminiKey))?"#fff":"#2a2a40"}}>
              {isEnhancing?"⏳ Processing…":"✨ Enhance Reference Photo"}
            </button>
          </div>}

          {/* Checklist (model mode) */}
          {mode==="model"&&!canGenerate&&<div style={{background:"#0d0d14",border:"1px solid #1a1a2e",borderRadius:8,padding:"10px 12px"}}>
            {[[!!geminiKey,"Gemini API key"],[!!refImage,"Product reference image"],[!!selectedModel,"Model selected"]].map(([ok,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:ok?"#4ade80":"#2a2a40"}}>
                <span>{ok?"✓":"○"}</span>{l}
              </div>
            ))}
          </div>}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{padding:"20px 24px",overflowY:"auto"}}>

          {/* ── MODEL MODE ── */}
          {mode==="model"&&<>
            {/* Pose configuration bar */}
            <div style={{background:"#09090f",border:"1px solid #1a1a2e",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:13,color:"#94a3b8"}}>🎭 Pose Configuration <span style={{fontWeight:400,color:"#2a2a40",fontSize:11}}>· click any slot to change</span></div>
                <button onClick={()=>randomizeSlots(4)} className="btn-hover" style={{background:"#7c3aed18",border:"1px solid #7c3aed40",color:"#a78bfa",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>↺ Randomize 5–8</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {slots.map((s,i)=>(
                  <div key={i} style={{background:slotBg(s),border:"1px solid",borderColor:slotBorder(s),borderRadius:8,padding:"9px 11px",cursor:"pointer",position:"relative"}}
                    onClick={()=>setActivePoseSlot(activePoseSlot===i?null:i)}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                      <span style={{fontSize:10,fontWeight:700,color:"#3a3a5c"}}>#{i+1}</span>
                      <span style={{fontSize:9,fontWeight:700,background:CAT_COLOR[s.pose.cat]+"25",color:CAT_COLOR[s.pose.cat],padding:"1px 5px",borderRadius:3}}>{s.pose.cat}</span>
                      {s.status==="done"&&<span style={{fontSize:9,color:"#4ade80",marginLeft:"auto"}}>✓</span>}
                      {s.status==="error"&&<span style={{fontSize:9,color:"#ef4444",marginLeft:"auto"}}>✕</span>}
                      {s.status==="generating"&&<div style={{width:8,height:8,border:"1.5px solid #7c3aed30",borderTop:"1.5px solid #7c3aed",borderRadius:"50%",animation:"spin .7s linear infinite",marginLeft:"auto"}}/>}
                    </div>
                    <div style={{fontWeight:700,fontSize:12,color:"#e2e8f0",marginBottom:2}}>{s.pose.name}</div>
                    <div style={{fontSize:10,color:"#2a2a40",lineHeight:1.3,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.pose.desc.slice(0,60)}…</div>
                    {/* Pose picker dropdown */}
                    {activePoseSlot===i&&(
                      <div style={{position:"absolute",top:"100%",left:0,zIndex:50,background:"#0d0d16",border:"1px solid #2a2a40",borderRadius:8,padding:6,width:240,maxHeight:260,overflowY:"auto",boxShadow:"0 12px 40px #00000090",marginTop:4}}>
                        {POSE_POOL.map(p=>(
                          <div key={p.id} className="pose-pick" onClick={(e)=>{e.stopPropagation();changePose(i,p);}} style={{padding:"8px 10px",borderRadius:6,cursor:"pointer",border:"1px solid transparent",background:"none",marginBottom:3}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <span style={{fontSize:9,background:CAT_COLOR[p.cat]+"25",color:CAT_COLOR[p.cat],padding:"1px 5px",borderRadius:3,fontWeight:700}}>{p.cat}</span>
                              <span style={{fontWeight:700,fontSize:12,color:"#e2e8f0"}}>{p.name}</span>
                              {s.pose.id===p.id&&<span style={{color:"#7c3aed",marginLeft:"auto",fontSize:10}}>✓</span>}
                            </div>
                            <div style={{fontSize:10,color:"#3a3a5c",marginTop:2,lineHeight:1.3}}>{p.desc.slice(0,70)}…</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate controls */}
            <div style={{background:"#09090f",border:"1px solid #1a1a2e",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:doneSlots>0?10:0}}>
                {!slot0done
                  ?<button onClick={generateSample} disabled={!canGenerate||anyGenerating} className="btn-hover" style={{flex:1,padding:"12px 0",borderRadius:9,border:"none",cursor:canGenerate&&!anyGenerating?"pointer":"not-allowed",fontSize:13,fontWeight:800,background:canGenerate&&!anyGenerating?"linear-gradient(135deg,#7c3aed,#2563eb)":"#12121e",color:canGenerate&&!anyGenerating?"#fff":"#2a2a40"}}>
                      {slots[0].status==="generating"?"⏳ Generating Sample…":"⚡ Generate Sample (1 of 8) →"}
                    </button>
                  :<button onClick={generateRemaining} disabled={!canGenerate||isGeneratingAll} className="btn-hover" style={{flex:1,padding:"12px 0",borderRadius:9,border:"none",cursor:canGenerate&&!isGeneratingAll?"pointer":"not-allowed",fontSize:13,fontWeight:800,background:canGenerate&&!isGeneratingAll?"linear-gradient(135deg,#16a34a,#059669)":"#12121e",color:canGenerate&&!isGeneratingAll?"#fff":"#2a2a40"}}>
                      {isGeneratingAll?"⏳ Generating Remaining…":"▶ Generate Remaining (2–8) →"}
                    </button>
                }
                {!slot0done&&<button onClick={generateAll} disabled={!canGenerate||anyGenerating} className="btn-hover" style={{padding:"12px 16px",borderRadius:9,border:"1px solid #1a1a2e",cursor:canGenerate&&!anyGenerating?"pointer":"not-allowed",fontSize:12,fontWeight:700,background:"#0d0d16",color:canGenerate&&!anyGenerating?"#64748b":"#2a2a40"}}>Generate All 8</button>}
                {(isGeneratingAll||anyGenerating)&&<button onClick={stopGenerating} style={{padding:"12px 14px",borderRadius:9,border:"1px solid #ef444440",background:"#ef444415",color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700}}>⏹ Stop</button>}
              </div>
              {doneSlots>0&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(doneSlots/8)*100}%`,background:"linear-gradient(90deg,#7c3aed,#2563eb)",borderRadius:2,transition:"width .4s"}}/>
                </div>
                <span style={{fontSize:11,color:"#4a4a6a",flexShrink:0}}>{doneSlots}/8 done</span>
                {doneSlots>0&&<button onClick={saveAllToGallery} className="btn-hover" style={{background:"#7c3aed18",border:"1px solid #7c3aed40",color:"#a78bfa",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>💾 Save All</button>}
                {doneSlots>0&&<button onClick={downloadAll} className="btn-hover" style={{background:"#0d0d16",border:"1px solid #1a1a2e",color:"#64748b",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>⬇ Download All</button>}
              </div>}
            </div>

            {/* 8-slot grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {slots.map((s,i)=>(
                <div key={i} className="slot-card" style={{borderRadius:10,border:"1px solid",borderColor:slotBorder(s),background:slotBg(s),overflow:"hidden",position:"relative"}}>
                  {/* Slot image or placeholder */}
                  <div style={{aspectRatio:"3/4",background:"#090912",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    {s.image
                      ?<img src={s.image} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}} onClick={()=>setLightboxImg(s.image)} alt={s.pose.name}/>
                      :<div style={{textAlign:"center",padding:12}}>
                        {s.status==="generating"
                          ?<><div style={{width:24,height:24,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 8px"}}/><div style={{fontSize:10,color:"#3a3a5c",animation:"pulse 1.5s ease-in-out infinite"}}>Generating…</div></>
                          :s.status==="error"
                            ?<><div style={{fontSize:20,marginBottom:4}}>✕</div><div style={{fontSize:9,color:"#ef4444",lineHeight:1.4}}>{s.error?.slice(0,60)}</div><button onClick={()=>generateSlot(i)} style={{marginTop:6,background:"#ef444420",border:"1px solid #ef444440",color:"#f87171",padding:"3px 8px",borderRadius:4,cursor:"pointer",fontSize:10}}>Retry</button></>
                            :<><div style={{fontSize:28,color:"#1a1a2e",marginBottom:4}}>#{i+1}</div><div style={{fontSize:10,color:"#2a2a40"}}>{s.pose.name}</div></>
                        }
                      </div>
                    }
                    {/* Slot actions overlay */}
                    {s.image&&<div className="slot-actions" style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,#000000c0,transparent)",padding:"20px 8px 8px",display:"flex",gap:5,opacity:0,transition:"opacity .2s"}}>
                      <button onClick={()=>downloadSlot(s)} style={{flex:1,background:"#00000060",border:"none",color:"#fff",padding:"5px 0",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:600}}>⬇</button>
                      <button onClick={()=>saveSlotToGallery(s)} style={{flex:1,background:"#00000060",border:"none",color:"#fff",padding:"5px 0",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:600}}>💾</button>
                      <button onClick={()=>generateSlot(i)} style={{flex:1,background:"#7c3aed80",border:"none",color:"#fff",padding:"5px 0",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:600}}>↻</button>
                    </div>}
                  </div>
                  {/* Slot info */}
                  <div style={{padding:"7px 9px",borderTop:"1px solid",borderColor:slotBorder(s)}}>
                    <div style={{fontSize:10,fontWeight:700,color:s.status==="done"?"#4ade80":s.status==="error"?"#ef4444":"#3a3a5c"}}>{s.pose.name}</div>
                    <div style={{fontSize:9,color:"#1e1e30",marginTop:1}}>{s.pose.cat}</div>
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ── ENHANCE MODE ── */}
          {mode==="enhance"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,maxWidth:900}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#64748b",marginBottom:10}}>Original</div>
              <div style={{aspectRatio:"3/4",background:"#09090f",border:"1px solid #1a1a2e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                {refImage?<img src={refImage.preview} style={{width:"100%",height:"100%",objectFit:"contain"}} alt="original"/>:<div style={{color:"#1a1a2e",textAlign:"center"}}><div style={{fontSize:40}}>📷</div><div style={{fontSize:12}}>Upload product image on the left</div></div>}
              </div>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"#64748b",marginBottom:10}}>Enhanced <span style={{fontWeight:400,fontSize:11}}>— white bg · {outSize.w}×{outSize.h} · JPEG 95%</span></div>
              <div style={{aspectRatio:"3/4",background:"#09090f",border:"1px solid #1a1a2e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                {isEnhancing&&<div style={{textAlign:"center"}}><div style={{width:28,height:28,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/><div style={{color:"#3a3a5c",fontSize:12}}>Enhancing…</div></div>}
                {!isEnhancing&&enhancedImage&&<img src={enhancedImage} style={{width:"100%",height:"100%",objectFit:"contain",cursor:"pointer"}} onClick={()=>setLightboxImg(enhancedImage)} alt="enhanced"/>}
                {!isEnhancing&&!enhancedImage&&<div style={{color:"#1a1a2e",textAlign:"center"}}><div style={{fontSize:40}}>✨</div><div style={{fontSize:12}}>Enhanced image appears here</div></div>}
              </div>
              {enhancedImage&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10}}>
                <button onClick={()=>{const a=document.createElement("a");a.href=enhancedImage;a.download=`thugfit_enhanced_${Date.now()}.jpg`;a.click();}} className="btn-hover" style={{padding:"9px 0",borderRadius:7,border:"1px solid #7c3aed",background:"#7c3aed20",color:"#a78bfa",cursor:"pointer",fontSize:12,fontWeight:700}}>⬇ Download</button>
                <button onClick={()=>{const item={id:Date.now(),url:enhancedImage,model:"Enhanced",garment:"Reference",pose:"Enhanced",gender,date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short"})};const u=[item,...savedGallery].slice(0,80);setSavedGallery(u);try{localStorage.setItem("is_saved_gallery",JSON.stringify(u))}catch{}}} className="btn-hover" style={{padding:"9px 0",borderRadius:7,border:"1px solid #1a1a2e",background:"#0d0d16",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:700}}>💾 Save</button>
              </div>}
            </div>
          </div>}
        </div>
      </div>

      {/* ╔══ SAVED GALLERY ══╗ */}
      {savedGallery.length>0&&<div id="gallery-section" style={{borderTop:"1px solid #1a1a2e",background:"#09090f",padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontWeight:800,fontSize:14,color:"#e2e8f0"}}>Saved Gallery <span style={{color:"#3a3a5c",fontWeight:400}}>({savedGallery.length})</span></span>
          <button onClick={()=>{setSavedGallery([]);localStorage.removeItem("is_saved_gallery");}} style={{background:"none",border:"1px solid #1a1a2e",color:"#3a3a5c",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Clear All</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
          {savedGallery.map(item=>(
            <div key={item.id} className="gcard" style={{borderRadius:8,overflow:"hidden",background:"#0d0d16",border:"1px solid #1a1a2e",cursor:"pointer",position:"relative"}} onClick={()=>setLightboxImg(item.url)}>
              <img src={item.url} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}} alt=""/>
              <div style={{padding:"6px 8px"}}>
                <div style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>{item.model}</div>
                <div style={{fontSize:10,color:"#2a2a40",marginTop:1}}>{item.garment} · {item.date}</div>
              </div>
              <button className="gdel" onClick={e=>{e.stopPropagation();deleteFromGallery(item.id);}} style={{position:"absolute",top:5,right:5,background:"#0d0d16cc",border:"none",color:"#ef4444",cursor:"pointer",borderRadius:4,padding:"2px 6px",fontSize:11,opacity:0,transition:"opacity .15s"}}>✕</button>
            </div>
          ))}
        </div>
      </div>}

      {/* ╔══ MODEL GALLERY MODAL ══╗ */}
      {showGallery&&<div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>e.target===e.currentTarget&&setShowGallery(false)}>
        <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:14,width:"100%",maxWidth:940,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"16px 22px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <span style={{fontWeight:800,fontSize:16,color:"#f1f5f9"}}>Select Model</span>
            <button onClick={()=>setShowGallery(false)} style={{background:"none",border:"none",color:"#3a3a5c",cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
          </div>
          <div style={{padding:"12px 22px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",gap:8,flexShrink:0,flexWrap:"wrap"}}>
            {[["female","♀ Female (20)"],["male","♂ Male (20)"]].map(([g,label])=>(
              <button key={g} onClick={()=>setGalleryTab(g)} style={{padding:"6px 16px",borderRadius:7,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:700,background:galleryTab===g?"#7c3aed20":"none",borderColor:galleryTab===g?"#7c3aed":"#1a1a2e",color:galleryTab===g?"#a78bfa":"#3a3a5c"}}>{label}</button>
            ))}
            <div style={{marginLeft:"auto",display:"flex",gap:7,alignItems:"center"}}>
              {isGenAllThumbs
                ?<button onClick={()=>{genAllRef.current=false;setIsGenAllThumbs(false);}} style={{background:"#ef444420",border:"1px solid #ef444440",color:"#f87171",padding:"6px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>⏹ Stop</button>
                :<button onClick={generateAllThumbs} style={{background:"#7c3aed20",border:"1px solid #7c3aed40",color:"#a78bfa",padding:"6px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>↻ Generate All Previews {missingThumbs>0&&`(${missingThumbs} missing)`}</button>
              }
              <button onClick={()=>{localStorage.removeItem("is_model_thumbs");setThumbs({});}} style={{background:"none",border:"1px solid #1a1a2e",color:"#2a2a40",padding:"6px 10px",borderRadius:6,cursor:"pointer",fontSize:10}}>Clear cache</button>
            </div>
          </div>
          <div style={{padding:"6px 22px 10px",flexShrink:0}}>
            <div style={{fontSize:11,color:"#2a2a40",background:"#0d0d14",border:"1px solid #1a1a2e",borderRadius:6,padding:"6px 12px"}}>
              💡 First time: click <strong style={{color:"#3a3a5c"}}>Generate All Previews</strong> to load model photos (~2 min for 20 models). After that, previews are cached permanently.
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,padding:"0 22px 22px",overflowY:"auto"}}>
            {galleryModels.map(model=>{
              const sel=selectedModel?.id===model.id;
              const loading=thumbLoading[model.id];
              const thumb=thumbs[model.id];
              return (
                <div key={model.id} className="model-card" onClick={()=>selectModel(model)} style={{borderRadius:9,overflow:"hidden",background:"#0d0d16",border:"2px solid",borderColor:sel?"#7c3aed":"#1a1a2e",cursor:"pointer",transition:"all .15s"}}>
                  {thumb
                    ?<img src={thumb} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}} alt={model.name}/>
                    :<div style={{width:"100%",aspectRatio:"1",background:loading?"#111120":"#090912",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:7}}>
                      {loading?<><div style={{width:18,height:18,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><div style={{fontSize:9,color:"#2a2a40"}}>generating…</div></>:<div style={{fontSize:30,color:"#1a1a2e"}}>👤</div>}
                    </div>
                  }
                  <div style={{padding:"7px 10px"}}>
                    <div style={{fontWeight:700,fontSize:12,color:sel?"#c4b5fd":"#e2e8f0"}}>{sel?"✓ ":""}{model.name}</div>
                    <div style={{fontSize:10,color:"#2a2a40",marginTop:1}}>{model.tag}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>}

      {/* ╔══ SETTINGS MODAL ══╗ */}
      {showSettings&&<div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setShowSettings(false)}>
        <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:13,padding:26,width:400}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:20,color:"#f1f5f9"}}>⚙ Settings</div>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7}}>Gemini API Key</div>
          <input type="password" value={tempKey} onChange={e=>setTempKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveSettings()} placeholder="AIzaSy..." style={{width:"100%",background:"#09090f",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"10px 12px",borderRadius:8,fontSize:13,outline:"none"}}/>
          <div style={{fontSize:11,color:"#2a2a40",marginTop:5,marginBottom:20}}>Get your key at <span style={{color:"#3a3a5c"}}>console.cloud.google.com → Gemini API</span></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveSettings} className="btn-hover" style={{padding:"9px 22px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",color:"#fff",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>Save</button>
            <button onClick={()=>setShowSettings(false)} style={{padding:"9px 16px",background:"#12121e",border:"1px solid #1a1a2e",color:"#3a3a5c",borderRadius:8,cursor:"pointer",fontSize:13}}>Cancel</button>
            {geminiKey&&<button onClick={()=>{localStorage.removeItem("is_total_gen");setTotalGenerated(0);}} style={{marginLeft:"auto",padding:"9px 12px",background:"none",border:"1px solid #1a1a2e",color:"#2a2a40",borderRadius:8,cursor:"pointer",fontSize:11}}>Reset counter</button>}
          </div>
        </div>
      </div>}

      {/* ╔══ LIGHTBOX ══╗ */}
      {lightboxImg&&<div style={{position:"fixed",inset:0,background:"#000000d0",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>setLightboxImg(null)}>
        <img src={lightboxImg} style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:10}} alt="Full size"/>
      </div>}
    </div>
  );
}
