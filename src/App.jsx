import { useState, useRef, useEffect } from "react";

// ─── IndexedDB Gallery ────────────────────────────────────────────────────────
const DB_NAME = "ImageStudioGallery", DB_VERSION = 1, STORE = "images";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath:"id", autoIncrement:true });
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbSave(record) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result.reverse()); // newest first
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const PRODUCT_TYPES = ["T-Shirt","Leggings","Sports Bra","Hoodie","Shorts","Tank Top","Joggers","Jacket","Compression Shirt","Compression Shorts","Sports Dress","Crop Top","Long Sleeve Shirt","Quarter Zip","Polo Shirt","Sweatshirt","Track Pants","Windbreaker","Vest","Base Layer Top","Base Layer Bottom","Swimwear"];
const GENDERS = ["Unisex","Men's","Women's","Youth"];
const MODELS_MALE = [
  "Athletic European male model, 6ft 1in, lean muscular physique, chiseled jawline, short dark hair, Mediterranean complexion",
  "Athletic Middle Eastern male model, 6ft, muscular athletic build, strong jaw, dark short hair, olive skin tone",
  "Athletic Latin male model, 6ft, defined muscular physique, sharp features, dark hair, light olive skin",
  "Athletic European male model, 6ft 2in, bodybuilder physique, wide shoulders, blond short hair, fair skin",
  "Athletic male model, 5ft 11in, lean runner physique, Mediterranean features, dark stubble, olive complexion",
  "Athletic European male model, 6ft, V-taper muscular build, square jaw, brown short hair, fair complexion",
  "Athletic male model, 6ft 1in, powerlifter build, strong broad shoulders, light stubble, Mediterranean skin tone",
  "Athletic male model, 6ft, defined abs and arms, sharp European features, clean shaven, olive skin",
];

const MODELS_FEMALE = [
  "Athletic European female model, 5ft 9in, lean toned physique, high cheekbones, long dark hair, fair skin",
  "Athletic Middle Eastern female model, 5ft 8in, toned athletic build, dark long hair, olive skin tone",
  "Athletic Latin female model, 5ft 8in, lean toned physique, long dark hair, warm olive complexion",
  "Athletic European female model, 5ft 10in, slim toned build, blonde hair, sharp features, fair skin",
  "Athletic female model, 5ft 7in, strong toned legs and arms, Mediterranean features, dark wavy hair",
  "Athletic European female model, 5ft 9in, lean muscular physique, brown hair, light olive skin, sharp jaw",
  "Athletic female model, 5ft 8in, defined athletic build, long dark hair, European features, fair complexion",
  "Athletic female model, 5ft 10in, model physique, high cheekbones, straight dark hair, olive skin",
];

const POSES = {
  Standard:[
    {id:"hero_front",name:"Hero Front",desc:"Front-facing, arms at sides, centered, confident stance. Full garment visible, properly centered."},
    {id:"back_view",name:"Back View",desc:"Straight rear view, full back of garment visible, properly centered."},
    {id:"three_quarter",name:"¾ Front Left",desc:"Body angled 45° to the left, natural casual stance, mostly front visible."},
    {id:"upper_body",name:"Upper Body Close-Up",desc:"Framed from waist up, chest design and fabric texture are the hero."},
  ],
  Action:[
    {id:"running",name:"Running Stride",desc:"Mid-stride running, one leg extended forward, arms in natural running motion."},
    {id:"jump",name:"Victory Jump",desc:"Two-foot jump, arms raised in celebration, full energy."},
    {id:"lunge",name:"Forward Lunge",desc:"Deep forward lunge, front knee at 90°, arms extended for balance."},
    {id:"squat",name:"Deep Squat",desc:"Parallel squat position, arms forward for balance, showing lower garment."},
    {id:"sprint_start",name:"Sprint Start",desc:"Low explosive sprint start position, leaning forward aggressively."},
    {id:"box_jump",name:"Box Jump",desc:"Mid-air during box jump, knees tucked, powerful athletic moment."},
    {id:"burpee",name:"Burpee",desc:"Jumping phase of burpee, arms overhead, full body visible."},
    {id:"plank",name:"Plank Hold",desc:"Perfect plank position, showing back panel and fit under tension."},
    {id:"deadlift",name:"Deadlift",desc:"Standing with weights, showing garment performance under load."},
  ],
  Lifestyle:[
    {id:"hands_hips",name:"Hands on Hips",desc:"Both hands on hips, front-facing, confident power pose."},
    {id:"arms_crossed",name:"Arms Crossed",desc:"Arms folded across chest, strong confident look."},
    {id:"natural_walk",name:"Natural Walk",desc:"Casual walking stride, relaxed and natural movement."},
    {id:"power_stance",name:"Power Stance",desc:"Wide stance, hands clasped in front, authoritative."},
    {id:"shoulder_look",name:"Shoulder Glance",desc:"Walking away, glancing back over shoulder — editorial feel."},
    {id:"side_stretch",name:"Side Stretch",desc:"Arms overhead side stretch clearly showing waistband detail."},
    {id:"water_break",name:"Water Break",desc:"Drinking from bottle post-workout, relaxed lifestyle pose."},
    {id:"earbuds",name:"Earbuds In",desc:"Adjusting earbuds, about to start workout, energetic."},
    {id:"selfie_pose",name:"Mirror Selfie",desc:"Gym mirror selfie style showing front of garment clearly."},
    {id:"meditation",name:"Meditation Sit",desc:"Cross-legged seated, hands on knees, calm focus."},
    {id:"cool_down",name:"Cool Down Walk",desc:"Hands behind head, walking cool-down, post-workout."},
    {id:"phone_check",name:"Phone Check",desc:"Checking smartwatch or phone, active lifestyle context."},
  ],
  Yoga:[
    {id:"warrior",name:"Warrior Pose",desc:"Warrior I, arms extended overhead, strong stance."},
    {id:"side_angle",name:"Extended Side",desc:"Side angle pose, one arm reaching overhead elegantly."},
    {id:"forward_fold",name:"Forward Fold",desc:"Standing forward fold showing back of legs and top."},
    {id:"tree_balance",name:"Tree Balance",desc:"One-legged tree pose, arms overhead, perfect balance."},
    {id:"downward_dog",name:"Downward Dog",desc:"Classic downward dog clearly showing back panel of garment."},
    {id:"cobra",name:"Cobra Pose",desc:"Cobra position showing front of sports bra or top."},
    {id:"pigeon",name:"Pigeon Pose",desc:"Seated pigeon stretch showing leggings or shorts detail."},
  ],
  "Back Views":[
    {id:"back_hips",name:"Back Hands Hips",desc:"Back view, hands on hips, clearly showing rear panel."},
    {id:"back_right",name:"Back ¾ Right",desc:"Three-quarter rear angle from right side of model."},
    {id:"back_left",name:"Back ¾ Left",desc:"Three-quarter rear angle from left side of model."},
  ],
  Detail:[
    {id:"collar",name:"Collar Detail",desc:"Close-up of neckline and collar construction quality."},
    {id:"sleeve",name:"Sleeve Detail",desc:"Close-up of sleeve cuff and hem stitching precision."},
    {id:"hem_detail",name:"Hem Detail",desc:"Close-up of bottom hem, waistband or drawstring detail."},
    {id:"fabric_macro",name:"Fabric Macro",desc:"Extreme close-up of fabric texture and weave, premium quality visible."},
    {id:"logo_feature",name:"Logo Feature",desc:"Close-up centred on logo placement and print quality."},
  ],
  "Flat Lay":[
    {id:"flat_front",name:"Flat Lay – Front",desc:"Garment laid flat on white surface, front up, top-down overhead shot, front sid..."},
    {id:"flat_back",name:"Flat Lay – Back",desc:"Garment flat, back side up, overhead top-down shot, clean white surface."},
    {id:"flat_folded",name:"Flat Lay – Folded",desc:"Garment neatly folded on white surface, branded presentation."},
  ],
  Angles:[
    {id:"left_profile",name:"Left Side Profile",desc:"Pure left-side silhouette showing garment side seam and fit."},
    {id:"right_profile",name:"Right Side Profile",desc:"Pure right-side silhouette showing garment side seam and fit."},
    {id:"low_angle",name:"Low Angle Power",desc:"Camera below waist shooting up, powerful athletic stance."},
    {id:"overhead_edit",name:"Overhead Editorial",desc:"Top-down editorial flat lay with props and accessories."},
  ],
  Floor:[
    {id:"seated_cross",name:"Seated Cross-Legged",desc:"Seated cross-legged on floor, casual athletic lifestyle."},
    {id:"low_kneel",name:"Low Kneeling Lunge",desc:"Low kneeling lunge showing leg garment detail clearly."},
  ],
  Fashion:[
    {id:"hand_heart",name:"Hand on Heart",desc:"One hand over heart, slight lean forward, emotional brand connection."},
    {id:"jump_kick",name:"Jump Kick",desc:"Mid-air side kick, dynamic action editorial shot."},
  ],
};

const ALL_POSES = Object.entries(POSES).flatMap(([cat,poses]) => poses.map(p => ({...p, category:cat})));

const CAT_COLORS = {Standard:"#6366f1",Action:"#ef4444",Lifestyle:"#f59e0b",Yoga:"#10b981","Back Views":"#8b5cf6",Detail:"#06b6d4","Flat Lay":"#ec4899",Angles:"#f97316",Floor:"#84cc16",Fashion:"#a855f7"};

const DEFAULT_SLOTS = [
  {poseId:"hero_front",varied:false},{poseId:"back_view",varied:false},
  {poseId:"three_quarter",varied:false},{poseId:"upper_body",varied:false},
  {poseId:"flat_front",varied:false},{poseId:"running",varied:true},
  {poseId:"hands_hips",varied:true},{poseId:"fabric_macro",varied:true},
];

const C = {bg:"#0D0D14",surf:"#13131E",card:"#1A1A28",border:"#252538",purple:"#6366f1",teal:"#10b981",amber:"#f59e0b",danger:"#ef4444",text:"#F0F0F8",muted:"#6B7090"};

async function generateImage(prompt, apiKey, refImageBase64=null, refMime=null, logoBase64=null, logoMime=null) {
  const parts = [];
  if(refImageBase64 && refMime){
    parts.push({inlineData:{mimeType:refMime, data:refImageBase64}});
    parts.push({text:"THIS IS THE REFERENCE PRODUCT. Study every detail: fabric pattern, texture, logo shape and position, seam lines, piping color, garment length and fit. You MUST replicate all of these exactly on the generated garment. Do NOT copy the person/model from this photo."});
  }
  if(logoBase64 && logoMime){
    parts.push({inlineData:{mimeType:logoMime, data:logoBase64}});
    parts.push({text:"BRAND LOGO — place this exact logo on the garment. Keep it small (no larger than 3cm in real life). Match position to reference product if shown, or place on left chest/left hip."});
  }
  parts.push({text: prompt});

  // Try Imagen 3 first (best quality, handles fabric texture and patterns)
  try {
    const imgPrompt = parts.map(p => p.text || "").filter(Boolean).join("\n\n");
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        instances:[{prompt: imgPrompt}],
        parameters:{sampleCount:1, aspectRatio:"3:4"}
      })
    });
    const d = await r.json();
    if(d.predictions?.[0]?.bytesBase64Encoded){
      return {data:d.predictions[0].bytesBase64Encoded, mime:"image/png"};
    }
    if(d.error) throw new Error(d.error.message);
  } catch(e) {
    if(e.message?.includes("not found") || e.message?.includes("not support")) {
      // Fall through to Gemini Flash
    } else {
      throw e;
    }
  }

  // Fallback: Gemini Flash Lite image
  const r2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`,{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts}],generationConfig:{responseModalities:["TEXT","IMAGE"]}})
  });
  const d2 = await r2.json();
  if(d2.error) throw new Error(d2.error.message);
  for(const part of d2.candidates?.[0]?.content?.parts||[])
    if(part.inlineData?.data) return {data:part.inlineData.data,mime:part.inlineData.mimeType};
  throw new Error("No image returned — check your API key and billing");
}

// ─── Supabase shared gallery ──────────────────────────────────────────────────
const SUPA_URL = "https://ioniqxioapcdgenpksex.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbmlxeGlvYXBjZGdlbnBrc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNDc1MDIsImV4cCI6MjEwMDcyMzUwMn0.PS80PFMqBYMf0e6uiYvTFk90gF7a7jo97C-dzzxUGho";

async function supaGalleryLoad() {
  const r = await fetch(`${SUPA_URL}/rest/v1/gallery_images?order=created_at.desc&limit=200`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
  });
  return r.json();
}

async function supaGallerySave(record) {
  const r = await fetch(`${SUPA_URL}/rest/v1/gallery_images`, {
    method: "POST",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(record)
  });
  return r.json();
}

async function supaGalleryDelete(id) {
  await fetch(`${SUPA_URL}/rest/v1/gallery_images?id=eq.${id}`, {
    method: "DELETE",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
  });
}

// Compress full image to small thumbnail for Supabase storage (~10KB)
async function toThumbnail(fullImageDataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 267;
      canvas.getContext("2d").drawImage(img, 0, 0, 200, 267);
      resolve(canvas.toDataURL("image/jpeg", 0.65));
    };
    img.onerror = () => resolve(null);
    img.src = fullImageDataUrl;
  });
}

// ─── Image Enhancement ────────────────────────────────────────────────────────
async function enhanceImage(imageDataUrl, scale=1.5) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = Math.round(img.width * scale);
      const H = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");

      // White base
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // High quality upscale pass 1
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, W, H);

      // Sharpening via pixel convolution
      const imageData = ctx.getImageData(0, 0, W, H);
      const d = imageData.data;
      const out = new Uint8ClampedArray(d.length);
      const kernel = [0,-1,0,-1,5,-1,0,-1,0]; // sharpen kernel

      for(let y = 1; y < H-1; y++){
        for(let x = 1; x < W-1; x++){
          for(let c = 0; c < 3; c++){
            let s = 0;
            for(let ky = -1; ky <= 1; ky++){
              for(let kx = -1; kx <= 1; kx++){
                s += d[((y+ky)*W+(x+kx))*4+c] * kernel[(ky+1)*3+(kx+1)];
              }
            }
            out[(y*W+x)*4+c] = Math.max(0, Math.min(255, s));
          }
          out[(y*W+x)*4+3] = 255;
        }
      }
      // Copy edges unchanged
      for(let x = 0; x < W; x++){
        for(let c = 0; c < 4; c++){
          out[x*4+c] = d[x*4+c];
          out[((H-1)*W+x)*4+c] = d[((H-1)*W+x)*4+c];
        }
      }
      for(let y = 0; y < H; y++){
        for(let c = 0; c < 4; c++){
          out[(y*W)*4+c] = d[(y*W)*4+c];
          out[(y*W+W-1)*4+c] = d[(y*W+W-1)*4+c];
        }
      }

      ctx.putImageData(new ImageData(out, W, H), 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 1.0)); // max JPEG quality
    };
    img.onerror = reject;
    img.src = imageDataUrl;
  });
}

async function analyzeProductPhoto(base64Image, mime) {
  const r = await fetch("https://zenline-digital.vercel.app/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mime, data: base64Image } },
          { type: "text", text: "You are analyzing an activewear product photo. Return ONLY a valid JSON object with exactly these two fields, no markdown, no explanation:\n{\"color\": \"the exact color name of the main garment (e.g. Jet Black, Navy Blue, Charcoal Grey, Forest Green, Off White)\", \"designNotes\": \"2-4 sentences describing: (1) logo placement — specify exactly where it appears: front chest only, front and back, sleeve, etc. and its size; (2) patterns or graphics visible; (3) special design features (mesh panels, reflective strips, color blocks, seam details, drawstrings, zip pockets, waistband type, piping); (4) fabric texture and construction\"}" }
        ]
      }]
    })
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  const text = d.content?.[0]?.text || "";
  try {
    const cleaned = text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    return JSON.parse(cleaned);
  } catch {
    return { color: "", designNotes: text };
  }
}

async function processImage(base64Data, mime) {
  return new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => {
      const W=1948,H=2656,PAD=Math.round(W*0.04);
      const canvas=document.createElement("canvas");
      canvas.width=W; canvas.height=H;
      const ctx=canvas.getContext("2d");
      ctx.fillStyle="#FFFFFF";
      ctx.fillRect(0,0,W,H);
      const scale=Math.min((W-PAD*2)/img.width,(H-PAD*2)/img.height);
      const sw=img.width*scale,sh=img.height*scale;
      const ox=Math.round((W-sw)/2), oy=Math.round((H-sh)/2);
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality="high";
      ctx.drawImage(img,ox,oy,sw,sh);

      const imageData=ctx.getImageData(0,0,W,H);
      const d=imageData.data;

      // Sample background from IMAGE CONTENT corners (not canvas corners which are white padding)
      const sx0=ox+4, sy0=oy+4;
      const sx1=Math.min(ox+Math.round(sw)-5, W-5);
      const sy1=Math.min(oy+Math.round(sh)-5, H-5);
      const samples=[[sx0,sy0],[sx1,sy0],[sx0,sy1],[sx1,sy1]];
      let rSum=0,gSum=0,bSum=0;
      samples.forEach(([x,y])=>{const i=(y*W+x)*4; rSum+=d[i];gSum+=d[i+1];bSum+=d[i+2];});
      const bgR=Math.round(rSum/4), bgG=Math.round(gSum/4), bgB=Math.round(bSum/4);

      // Is background gray (generated for white garment) or white/near-white?
      const isGray = bgR < 235 && Math.abs(bgR-bgG)<20 && Math.abs(bgG-bgB)<20;
      const tol = isGray ? 35 : 15; // wider tolerance for gray bg, narrow for white bg

      const visited=new Uint8Array(W*H);
      const isBg=(i)=>Math.abs(d[i]-bgR)<tol && Math.abs(d[i+1]-bgG)<tol && Math.abs(d[i+2]-bgB)<tol;

      // Seed flood-fill from image content corners + canvas edges
      const seeds=[[0,0],[W-1,0],[0,H-1],[W-1,H-1],
                   [sx0,sy0],[sx1,sy0],[sx0,sy1],[sx1,sy1]];
      const queue=[];
      seeds.forEach(([x,y])=>{
        const p=y*W+x;
        if(!visited[p]&&isBg(p*4)){visited[p]=1;queue.push(p);}
      });
      while(queue.length){
        const pos=queue.pop(); const px=pos*4;
        d[px]=255;d[px+1]=255;d[px+2]=255;
        const x=pos%W,y=Math.floor(pos/W);
        for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){
          const nx=x+dx,ny=y+dy;
          if(nx>=0&&nx<W&&ny>=0&&ny<H){
            const np=ny*W+nx;
            if(!visited[np]&&isBg(np*4)){visited[np]=1;queue.push(np);}
          }
        }
      }
      ctx.putImageData(imageData,0,0);
      resolve(canvas.toDataURL("image/jpeg",0.97));
    };
    img.onerror=reject;
    img.src=`data:${mime};base64,${base64Data}`;
  });
}

const LOWER_BODY = ["Leggings","Shorts","Compression Shorts","Swimwear","Track Pants","Joggers"];

function buildPrompt(product, pose, feedback="") {
  const {type,gender,color,brand,designNotes,lockedModel} = product;
  const gModel = gender==="Women's"?"female":gender==="Men's"?"male":gender==="Youth"?"young":"athletic";
  const modelDesc = lockedModel || `${gModel} athletic model with fit physique`;

  const isFlat = pose.category==="Flat Lay";
  const isDetail = pose.category==="Detail";

  const isWhiteGarment = color.toLowerCase().includes("white") || color.toLowerCase().includes("off-white") || color.toLowerCase().includes("cream") || color.toLowerCase().includes("ivory");

  const quality = isWhiteGarment
    ? `BACKGROUND: Use a LIGHT NEUTRAL GRAY background (#CCCCCC / RGB 204,204,204) — NOT white. This is essential so the white garment is clearly differentiated from the background. The background will be replaced with pure white in post-production. Studio lighting: soft even light, no harsh shadows. Show full fabric texture, mesh pattern, and all design details clearly — do not overexpose. The garment must be sharp and detailed with visible texture.`
    : `Background: PURE WHITE #FFFFFF — perfectly flat, no shadows, no gradients. Studio lighting: perfectly even, no hotspots. Ultra-sharp focus, high resolution. Suitable for Noon/Amazon marketplace and brand website hero images.`;

  // Logo only goes on front-facing views, not back views
  const isBackView = pose.id === "back_view" || pose.id === "back_hips" || pose.id === "back_right" || pose.id === "back_left" || pose.id === "flat_back";
  const logoInstructions = isBackView
    ? `LOGO RULE: This is a BACK VIEW. Do NOT place any logo on the back unless the design notes explicitly say the back has a logo. The back of this garment is clean/plain.`
    : `LOGO RULE: The reference product photo shows a specific logo on the FRONT. Copy that EXACT logo — same shape, same size (small, approximately 1 inch), centered on chest. Do NOT invent or redesign the logo. If a separate logo image is provided, use that exact logo.`;

  const designBlock = designNotes
    ? `MANDATORY DESIGN DETAILS — every point below is required in the output:
${designNotes}
Do not omit or change any of these details. The generated garment must include all of the above exactly.`
    : "";

  const changes = feedback ? `\nCHANGES REQUESTED BY USER: ${feedback}` : "";

  if(isFlat) return `Professional product flat lay photography.
Garment: ${color} ${brand} ${type}
Pose: ${pose.desc}
${designBlock}
${logoInstructions}
${quality}
Replicate every design detail from the reference photo exactly. 3:4 portrait aspect ratio.${changes}`;

  if(isDetail) return `Extreme close-up product photography.
Garment: ${color} ${brand} ${type}
Focus: ${pose.desc}
${designBlock}
${quality}
Show exact fabric texture, weave structure, stitching precision as in reference. 3:4 portrait.${changes}`;

  return `Professional activewear product photography for marketplace listing.

MODEL: ${modelDesc}. This must be a DIFFERENT person from anyone in the reference photo — different face, different skin tone, different nationality. Professional studio model only.

GARMENT: The model is wearing a ${color} ${brand} ${type}. Replicate this garment from the reference photo with 100% design accuracy:
${designBlock}
${logoInstructions}

POSE: ${pose.desc}

TECHNICAL: ${quality}

Full body visible. Model face neutral, confident. Garment is the hero — it must match the reference exactly in fabric, pattern, logo, seams, fit, and length. 3:4 portrait.${changes}`;
}


export default function App() {
  const [product,setProduct] = useState({name:"",type:"T-Shirt",gender:"Unisex",color:"",brand:"Actiwear",designNotes:"",lockedModel:""});
  const [slots,setSlots] = useState(DEFAULT_SLOTS.map(s=>({...s,status:"idle",result:null,error:null})));
  const [apiKey,setApiKey] = useState(()=>{
    try{return localStorage.getItem("imageStudio_apiKey")||"";}catch{return"";}
  });
  const [generating,setGenerating] = useState(false);
  const [enhancing,setEnhancing] = useState({});
  const [mode,setMode] = useState("generate");
  const [enhancingAll,setEnhancingAll] = useState(false);
  const [sampleDone,setSampleDone] = useState(false);
  const [sampleFeedback,setSampleFeedback] = useState("");
  const [slotFeedback,setSlotFeedback] = useState({index:-1,text:""});
  const [modelPreview,setModelPreview] = useState(null);
  const [modelPreviewLoading,setModelPreviewLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => { loadGallery(); }, []);

  async function loadGallery() {
    // Try Supabase first (shared gallery)
    try {
      const rows = await supaGalleryLoad();
      // If Supabase returns error object or non-array, fall through to IndexedDB
      if (!Array.isArray(rows)) throw new Error("Supabase table missing — run SQL in settings");
      setGallery(rows);
      return;
    } catch(e) {
      console.log("Supabase gallery failed, loading from local:", e.message);
    }
    // Fallback: local IndexedDB
    try {
      const local = await dbGetAll();
      if (Array.isArray(local)) setGallery(local);
    } catch(e) {
      console.log("IndexedDB also failed:", e.message);
    }
  }

  async function saveToGallery(imageData, slotIndex, pose) {
    const thumbnail = await toThumbnail(imageData);
    const record = {
      product_name: product.name || "Unnamed",
      brand: product.brand,
      type: product.type,
      color: product.color,
      gender: product.gender,
      pose_name: pose?.name || "Unknown",
      pose_category: pose?.category || "",
      thumbnail, // compressed ~10KB for sharing
      filename: `${(product.name||"product").replace(/\s+/g,"_")}_${slotIndex+1}_${(pose?.name||"image").replace(/\s+/g,"_")}.jpg`,
      full_image: imageData, // full res stored locally only via IndexedDB
      created_at: new Date().toISOString()
    };
    // Save thumbnail to Supabase (visible to all team members)
    try {
      const saved = await supaGallerySave({ ...record, full_image: null });
      const id = saved?.[0]?.id;
      // Save full image locally
      await dbSave({ ...record, id });
      setGallery(prev => [{ ...record, id }, ...prev]);
    } catch(e) {
      // Fallback: local only
      try {
        const id = await dbSave(record);
        setGallery(prev => [{ ...record, id }, ...prev]);
      } catch {}
    }
  }

  const [imagesGenerated,setImagesGenerated] = useState(()=>{
    try{return parseInt(localStorage.getItem("imageStudio_count")||"0");}catch{return 0;}
  });
  const [showKeyModal,setShowKeyModal] = useState(false);
  const [showPosePicker,setShowPosePicker] = useState(null);
  const [poseSearch,setPoseSearch] = useState("");
  const [poseCat,setPoseCat] = useState("All");
  const [refs,setRefs] = useState({front:null,back:null,side:null,logo:null});
  const [analyzingRef,setAnalyzingRef] = useState(false);
  const [showLogoLibrary,setShowLogoLibrary] = useState(false);
  const [logoLibrary,setLogoLibrary] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("imageStudio_logos")||"[]");}catch{return[];}
  });
  const [newLogoName,setNewLogoName] = useState("");
  const stopRef = useRef(false);

  const doneCount = slots.filter(s=>s.status==="done").length;
  const progress = Math.round((doneCount/8)*100);

  function upd(i,patch){setSlots(p=>p.map((s,idx)=>idx===i?{...s,...patch}:s));}

  async function enhanceReference(){
    // Process uploaded reference photos — clean background, sharpen, upscale
    // No AI generation needed — uses the actual product photos
    const refPhotos = [refs.front, refs.back, refs.side].filter(Boolean);
    if(refPhotos.length === 0){
      alert("Upload at least one reference photo (Front, Back or Side) first");
      return;
    }
    setEnhancingAll(true);

    // Map reference photos to slots
    const slotMappings = [
      {slotIdx:0, photo:refs.front||refs.back},     // Hero Front
      {slotIdx:1, photo:refs.back||refs.front},     // Back View
      {slotIdx:2, photo:refs.front||refs.back},     // ¾ Front Left
      {slotIdx:3, photo:refs.front||refs.back},     // Upper Body
      {slotIdx:4, photo:refs.front||refs.back},     // Flat Lay
      {slotIdx:5, photo:refs.side||refs.front||refs.back}, // Running
      {slotIdx:6, photo:refs.front||refs.back},     // Hands on Hips
      {slotIdx:7, photo:refs.front||refs.back},     // Fabric Macro
    ].filter(m => m.photo);

    for(const {slotIdx, photo} of slotMappings){
      upd(slotIdx, {status:"generating", result:null, error:null});
      try{
        // Convert dataUrl to base64
        const base64 = photo.split(",")[1];
        const mime = photo.startsWith("data:image/png") ? "image/png" : "image/jpeg";
        // Process: white background + sharpen + upscale to 1948×2656
        const processed = await processImage(base64, mime);
        // Apply additional sharpening pass
        const enhanced = await enhanceImage(processed, 1.0); // same size, just sharpen + max quality
        upd(slotIdx, {status:"done", result:enhanced});
        trackImageGenerated();
        const pose = ALL_POSES.find(p=>p.id===slots[slotIdx].poseId)||ALL_POSES[0];
        await saveToGallery(enhanced, slotIdx, pose);
      }catch(e){
        upd(slotIdx, {status:"error", error:e.message});
      }
    }
    setEnhancingAll(false);
  }

  async function handleEnhance(i, scale=1.5){
    const slot = slots[i];
    if(!slot.result) return;
    setEnhancing(p => ({...p, [i]: true}));
    try{
      const enhanced = await enhanceImage(slot.result, scale);
      upd(i, {result: enhanced});
      // Save enhanced to gallery
      const pose = ALL_POSES.find(p=>p.id===slot.poseId)||ALL_POSES[0];
      await saveToGallery(enhanced, i, pose);
    }catch(e){ alert("Enhancement failed: "+e.message); }
    setEnhancing(p => ({...p, [i]: false}));
  }

  function randomizeVaried(){
    const pool=ALL_POSES.filter(p=>!["Standard","Flat Lay","Detail","Back Views"].includes(p.category));
    setSlots(p=>p.map(s=>{
      if(!s.varied)return s;
      const r=pool[Math.floor(Math.random()*pool.length)];
      return {...s,poseId:r.id};
    }));
  }

  async function randomizeModel(){
    const isFemale = product.gender === "Women's";
    const pool = isFemale ? MODELS_FEMALE : MODELS_MALE;
    const m = pool[Math.floor(Math.random()*pool.length)];
    setProduct(p=>({...p,lockedModel:m}));
    setModelPreview(null);

    // Generate a quick preview portrait of this model
    if(apiKey && apiKey.length > 20){
      setModelPreviewLoading(true);
      try{
        const previewPrompt = `Professional studio portrait of a ${m}. Plain white background. Neutral expression, looking at camera. Upper body only, cropped at waist. High quality, realistic photography. Suitable for activewear brand usage.`;
        const res = await generateImage(previewPrompt, apiKey);
        // Create small thumbnail from the result
        const thumb = await toThumbnail(`data:${res.mime};base64,${res.data}`);
        setModelPreview(thumb);
      }catch(e){ console.log("Model preview failed:", e.message); }
      setModelPreviewLoading(false);
    }
  }

  function trackImageGenerated(){
    const newCount = imagesGenerated + 1;
    setImagesGenerated(newCount);
    localStorage.setItem("imageStudio_count", String(newCount));
  }

  function saveLogo(){
    if(!refs.logo){alert("Upload a logo first");return;}
    const name=newLogoName.trim()||`Logo ${logoLibrary.length+1}`;
    const updated=[...logoLibrary,{id:Date.now(),name,dataUrl:refs.logo}];
    setLogoLibrary(updated);
    localStorage.setItem("imageStudio_logos",JSON.stringify(updated));
    setNewLogoName("");
    alert(`Logo "${name}" saved to library!`);
  }

  function deleteLogo(id){
    const updated=logoLibrary.filter(l=>l.id!==id);
    setLogoLibrary(updated);
    localStorage.setItem("imageStudio_logos",JSON.stringify(updated));
  }

  function selectLogo(logo){
    setRefs(p=>({...p,logo:logo.dataUrl}));
    setShowLogoLibrary(false);
  }

  async function analyzePhoto(){
    const photoToAnalyze=refs.front||refs.back;
    if(!photoToAnalyze){alert("Upload a Front or Back reference photo first");return;}
    setAnalyzingRef(true);
    try{
      const base64=photoToAnalyze.split(",")[1];
      const mime=photoToAnalyze.startsWith("data:image/png")?"image/png":"image/jpeg";
      const result=await analyzeProductPhoto(base64,mime);
      setProduct(p=>({
        ...p,
        designNotes: result.designNotes||p.designNotes,
        color: result.color||p.color
      }));
    }catch(e){alert("Analysis failed: "+e.message);}
    setAnalyzingRef(false);
  }

  async function handleRefUpload(zone,file){
    const reader=new FileReader();
    reader.onload=async(e)=>{
      const dataUrl=e.target.result;
      setRefs(p=>({...p,[zone]:dataUrl}));
    };
    reader.readAsDataURL(file);
  }

  function getRefData(){
    const refUrl = refs.front || refs.back;
    if(!refUrl) return {base64:null, mime:null};
    const base64 = refUrl.split(",")[1];
    const mime = refUrl.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    return {base64, mime};
  }

  function getLogoData(){
    if(!refs.logo) return {base64:null, mime:null};
    return {
      base64: refs.logo.split(",")[1],
      mime: refs.logo.startsWith("data:image/png") ? "image/png" : "image/jpeg"
    };
  }

  // Lock model for consistency across all 8 images — auto-pick if not set
  function ensureLockedModel() {
    if(product.lockedModel) return product.lockedModel;
    const isFemale = product.gender === "Women's";
    const pool = isFemale ? MODELS_FEMALE : MODELS_MALE;
    const m = pool[Math.floor(Math.random() * pool.length)];
    setProduct(p => ({...p, lockedModel: m}));
    return m;
  }

  async function buildPromptWithLogo(product, pose, feedback, lockedModel) {
    const productWithModel = {...product, lockedModel};
    return buildPrompt(productWithModel, pose, feedback);
  }

  async function generateSample(){
    if(!apiKey||apiKey.length<20){setShowKeyModal(true);return;}
    if(!product.name.trim()){alert("Enter a product name first");return;}
    stopRef.current=false;
    setSampleDone(false);
    setSampleFeedback("");
    setGenerating(true);
    // Lock model NOW — same model will be used for all 8 images
    const sessionModel = ensureLockedModel();
    const sessionProduct = {...product, lockedModel: sessionModel};
    setSlots(p=>p.map((s,i)=>i===0?{...s,status:"generating",result:null,error:null}:{...s,status:"idle",result:null,error:null}));
    const pose=ALL_POSES.find(p=>p.id===slots[0].poseId)||ALL_POSES[0];
    const {base64,mime}=getRefData();
    const {base64:logoB64,mime:logoMime}=getLogoData();
    try{
      const res=await generateImage(buildPrompt(sessionProduct,pose),apiKey,base64,mime,logoB64,logoMime);
      const processed=await processImage(res.data,res.mime);
      upd(0,{status:"done",result:processed});
      trackImageGenerated();
      await saveToGallery(processed,0,pose);
      setSampleDone(true);
    }catch(e){upd(0,{status:"error",error:e.message});}
    setGenerating(false);
  }

  async function regenSampleWithFeedback(){
    if(!apiKey||apiKey.length<20){setShowKeyModal(true);return;}
    setSampleDone(false);
    setGenerating(true);
    upd(0,{status:"generating",result:null,error:null});
    const pose=ALL_POSES.find(p=>p.id===slots[0].poseId)||ALL_POSES[0];
    const {base64,mime}=getRefData();
    const {base64:logoB64,mime:logoMime}=getLogoData();
    try{
      const res=await generateImage(buildPrompt(product,pose,sampleFeedback),apiKey,base64,mime,logoB64,logoMime);
      const processed=await processImage(res.data,res.mime);
      upd(0,{status:"done",result:processed});
      trackImageGenerated();
      await saveToGallery(processed,0,pose);
      setSampleDone(true);
    }catch(e){upd(0,{status:"error",error:e.message});}
    setGenerating(false);
  }

  async function generateAll(){
    if(!apiKey||apiKey.length<20){setShowKeyModal(true);return;}
    if(!product.name.trim()){alert("Enter a product name first");return;}
    stopRef.current=false;
    setGenerating(true);
    // Use same locked model for all remaining images
    const sessionModel = product.lockedModel || ensureLockedModel();
    const sessionProduct = {...product, lockedModel: sessionModel};
    const {base64,mime}=getRefData();
    const {base64:logoB64,mime:logoMime}=getLogoData();
    setSlots(p=>p.map((s,i)=>i===0?s:{...s,status:"pending",result:null,error:null}));
    for(let i=1;i<slots.length;i++){
      if(stopRef.current){upd(i,{status:"idle"});continue;}
      upd(i,{status:"generating"});
      const pose=ALL_POSES.find(p=>p.id===slots[i].poseId)||ALL_POSES[0];
      try{
        const res=await generateImage(buildPrompt(sessionProduct,pose),apiKey,base64,mime,logoB64,logoMime);
        const processed=await processImage(res.data,res.mime);
        upd(i,{status:"done",result:processed});
        trackImageGenerated();
        await saveToGallery(processed,i,pose);
      }catch(e){upd(i,{status:"error",error:e.message});}
    }
    setGenerating(false);
  }

  async function regenSlot(i){
    if(!apiKey||apiKey.length<20){setShowKeyModal(true);return;}
    setSlotFeedback({index:i,text:""});
  }

  async function doRegenSlot(i, feedback=""){
    upd(i,{status:"generating",error:null});
    const pose=ALL_POSES.find(p=>p.id===slots[i].poseId)||ALL_POSES[0];
    const {base64,mime}=getRefData();
    const {base64:logoB64,mime:logoMime}=getLogoData();
    try{
      const res=await generateImage(buildPrompt(product,pose,feedback),apiKey,base64,mime,logoB64,logoMime);
      const processed=await processImage(res.data,res.mime);
      upd(i,{status:"done",result:processed});
      trackImageGenerated();
      await saveToGallery(processed,i,pose);
    }catch(e){upd(i,{status:"error",error:e.message});}
    setSlotFeedback({index:-1,text:""});
  }

  function downloadAll(){
    const done=slots.filter(s=>s.status==="done");
    if(!done.length)return;
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload=async()=>{
      const zip=new window.JSZip();
      slots.forEach((sl,i)=>{if(sl.status==="done")zip.file(`${product.name.replace(/\s+/g,"_")}_${i+1}.jpg`,sl.result.split(",")[1],{base64:true});});
      const blob=await zip.generateAsync({type:"blob"});
      const u=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=u;a.download=`${product.name.replace(/\s+/g,"_")}_images.zip`;a.click();URL.revokeObjectURL(u);
    };
    document.head.appendChild(s);
  }

  const filteredPoses=ALL_POSES.filter(p=>(poseCat==="All"||p.category===poseCat)&&(!poseSearch||p.name.toLowerCase().includes(poseSearch.toLowerCase())||p.desc.toLowerCase().includes(poseSearch.toLowerCase())));

  const inp={width:"100%",background:C.surf,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",color:C.text,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"};
  const btn=(bg,outline=false)=>({padding:"8px 16px",borderRadius:7,border:outline?`1px solid ${bg}`:"none",background:outline?"transparent":bg,color:outline?bg:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",transition:"opacity 0.15s"});

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',sans-serif",fontSize:13}}>
      {/* Header */}
      <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:C.purple,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎨</div>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Image Studio</div>
            <div style={{fontSize:11,color:C.muted}}>Actiwear · SM</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setShowGallery(true)} style={{...btn(C.border,true),fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:5}}>
            🖼 Gallery ({gallery.length})
          </button>
          <div style={{fontSize:11,color:C.muted,background:C.card,padding:"5px 12px",borderRadius:20,border:`1px solid ${C.border}`}}>
            💰 {imagesGenerated} images · ~${(imagesGenerated*0.04).toFixed(3)} spent
          </div>
          <button onClick={()=>setShowKeyModal(true)} style={{...btn(apiKey.length>20?C.teal:C.purple),fontSize:11,display:"flex",alignItems:"center",gap:6}}>
            🔑 {apiKey.length>20?"✓ API Key Set":"Add API Key"}
          </button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:0,height:"calc(100vh - 57px)",overflow:"hidden"}}>
        {/* Left sidebar */}
        <div style={{background:C.surf,borderRight:`1px solid ${C.border}`,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:14}}>
          {/* Product details */}
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:14}}>🎯</span>
              <span style={{fontWeight:600,fontSize:13}}>Product details</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Product name *</div>
                <input style={inp} placeholder="e.g. Pro Fit Tee Black" value={product.name} onChange={e=>setProduct(p=>({...p,name:e.target.value}))} />
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Type</div>
                  <select style={inp} value={product.type} onChange={e=>setProduct(p=>({...p,type:e.target.value}))}>
                    {PRODUCT_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Gender</div>
                  <select style={inp} value={product.gender} onChange={e=>setProduct(p=>({...p,gender:e.target.value}))}>
                    {GENDERS.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Color *</div>
                  <input style={inp} placeholder="e.g. Jet Black" value={product.color} onChange={e=>setProduct(p=>({...p,color:e.target.value}))} />
                </div>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Brand</div>
                  <input style={inp} value={product.brand} onChange={e=>setProduct(p=>({...p,brand:e.target.value}))} />
                </div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <div style={{fontSize:11,color:C.muted}}>
                    Design notes
                    {analyzingRef&&<span style={{color:C.amber}}> · AI analyzing...</span>}
                  </div>
                  <button onClick={analyzePhoto} disabled={analyzingRef||(!refs.front&&!refs.back)}
                    style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${C.purple}`,background:analyzingRef?`${C.purple}20`:"transparent",color:C.purple,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit",opacity:(!refs.front&&!refs.back)?0.4:1}}>
                    {analyzingRef?"⏳ Analyzing...":"🔍 Analyze Photo"}
                  </button>
                </div>
                <textarea style={{...inp,resize:"vertical",lineHeight:1.5,minHeight:70}} rows={3}
                  placeholder="e.g. Reflective stripe on left sleeve, mesh back panels... (or upload Front/Back photo and click Analyze)"
                  value={product.designNotes} onChange={e=>setProduct(p=>({...p,designNotes:e.target.value}))} />
                <div style={{fontSize:10,color:C.muted,marginTop:3}}>Upload Front or Back photo → click 🔍 Analyze to auto-fill</div>
              </div>
            </div>
          </div>

          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>👤</span>
                <span style={{fontWeight:600,fontSize:13}}>Model</span>
              </div>
              <button onClick={randomizeModel} disabled={modelPreviewLoading} style={{...btn(C.border,true),padding:"4px 10px",fontSize:11,color:C.muted}}>
                {modelPreviewLoading?"⏳ Previewing...":"↺ Randomize"}
              </button>
            </div>

            {/* Model preview */}
            {modelPreviewLoading && (
              <div style={{padding:"10px",textAlign:"center",color:C.muted,fontSize:11,marginBottom:8}}>
                Generating model preview...
              </div>
            )}
            {modelPreview && !modelPreviewLoading && (
              <div style={{marginBottom:8,borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`,aspectRatio:"3/4",maxHeight:160}}>
                <img src={modelPreview} alt="Model preview" style={{width:"100%",height:"100%",objectFit:"cover"}} />
              </div>
            )}

            {product.lockedModel
              ? <div style={{fontSize:11,color:C.teal,background:`${C.teal}15`,padding:"6px 10px",borderRadius:6,border:`1px solid ${C.teal}30`,lineHeight:1.5,marginBottom:6}}>{product.lockedModel}</div>
              : <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:6}}>Click Randomize to pick a model and see a preview. Same model used for all 8 images.</div>}

            {/* Custom model input */}
            <div style={{marginTop:6}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:4}}>Or paste your own model description:</div>
              <textarea
                placeholder="e.g. Athletic European male model, 6ft 2in, lean muscular physique, dark short hair, olive skin..."
                rows={2}
                style={{width:"100%",background:C.surf,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 9px",color:C.text,fontSize:11,resize:"vertical",fontFamily:"inherit",lineHeight:1.5,boxSizing:"border-box"}}
                onBlur={e=>{if(e.target.value.trim())setProduct(p=>({...p,lockedModel:e.target.value.trim()}));}}
                defaultValue=""
              />
            </div>

            {product.lockedModel&&<button onClick={()=>{setProduct(p=>({...p,lockedModel:""}));setModelPreview(null);}} style={{...btn(C.border,true),padding:"3px 8px",fontSize:10,color:C.muted,marginTop:4}}>✕ Clear</button>}
          </div>

          {/* Reference photos */}
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:14}}>📸</span>
              <span style={{fontWeight:600,fontSize:13}}>Reference photos</span>
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Upload actual product photos. Use 🔍 Analyze to extract design notes.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {["front","back","side"].map(zone=>(
                <label key={zone} style={{cursor:"pointer"}}>
                  <div style={{border:`1px dashed ${refs[zone]?C.teal:C.border}`,borderRadius:7,overflow:"hidden",background:refs[zone]?`${C.teal}08`:"transparent",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4,transition:"all 0.2s",position:"relative"}}>
                    {refs[zone]
                      ? <><img src={refs[zone]} alt={zone} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          <button onClick={e=>{e.preventDefault();e.stopPropagation();setRefs(p=>({...p,[zone]:null}));}} style={{position:"absolute",top:4,right:4,width:18,height:18,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.6)",color:"#fff",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                        </>
                      : <><span style={{fontSize:18}}>📷</span><span style={{fontSize:10,color:C.muted,textTransform:"capitalize"}}>{zone}</span></>}
                  </div>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleRefUpload(zone,e.target.files[0])} />
                </label>
              ))}
              {/* Logo slot with library */}
              <div>
                <div style={{border:`1px dashed ${refs.logo?C.amber:C.border}`,borderRadius:7,overflow:"hidden",background:refs.logo?`${C.amber}08`:"transparent",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:4,position:"relative"}}>
                  {refs.logo
                    ? <><img src={refs.logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain",padding:4}} />
                        <button onClick={()=>setRefs(p=>({...p,logo:null}))} style={{position:"absolute",top:4,right:4,width:18,height:18,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.6)",color:"#fff",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                      </>
                    : <><span style={{fontSize:18}}>🏷</span><span style={{fontSize:10,color:C.muted}}>Logo</span></>}
                </div>
                <div style={{display:"flex",gap:4,marginTop:5}}>
                  <label style={{flex:1,cursor:"pointer"}}>
                    <div style={{padding:"4px 0",borderRadius:5,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer",fontSize:10,fontWeight:600,textAlign:"center"}}>Upload</div>
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleRefUpload("logo",e.target.files[0])} />
                  </label>
                  <button onClick={()=>setShowLogoLibrary(true)} style={{flex:1,padding:"4px 0",borderRadius:5,border:`1px solid ${C.amber}`,background:"transparent",color:C.amber,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>
                    Library ({logoLibrary.length})
                  </button>
                </div>
                {refs.logo&&(
                  <button onClick={saveLogo} style={{width:"100%",padding:"4px 0",borderRadius:5,border:`1px solid ${C.teal}`,background:"transparent",color:C.teal,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit",marginTop:4}}>
                    💾 Save to Library
                  </button>
                )}
              </div>
            </div>
            {refs.logo&&(
              <div style={{marginBottom:6}}>
                <input style={{...inp,fontSize:11}} placeholder="Logo name (for library)..." value={newLogoName} onChange={e=>setNewLogoName(e.target.value)} />
              </div>
            )}
          </div>

          {/* Output specs */}
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:14}}>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[["Output size","1948 × 2656 px"],["Format","JPEG 95% quality"],["Background","Pure white #FFFFFF"],["Images per product","8"],["AI model","Imagen 3 → Gemini Flash (fallback)"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.muted}}>{k}</span>
                  <span style={{fontSize:11,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right main area */}
        <div style={{overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>

          {/* MODE SELECTOR — top of screen, always visible */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div onClick={()=>setMode("generate")} style={{
              padding:"14px 16px",borderRadius:10,cursor:"pointer",transition:"all 0.2s",
              border:`2px solid ${mode==="generate"?C.purple:C.border}`,
              background:mode==="generate"?`${C.purple}20`:C.card,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:mode==="generate"?C.purple:`${C.purple}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"background 0.2s"}}>🤖</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:mode==="generate"?C.purple:C.text}}>Generate New</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>AI creates with a new model</div>
                </div>
                {mode==="generate"&&<div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:C.purple}}/>}
              </div>
            </div>
            <div onClick={()=>setMode("enhance")} style={{
              padding:"14px 16px",borderRadius:10,cursor:"pointer",transition:"all 0.2s",
              border:`2px solid ${mode==="enhance"?C.teal:C.border}`,
              background:mode==="enhance"?`${C.teal}20`:C.card,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:mode==="enhance"?C.teal:`${C.teal}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"background 0.2s"}}>✨</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:mode==="enhance"?C.teal:C.text}}>Enhance Reference</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>Clean up your product photos</div>
                </div>
                {mode==="enhance"&&<div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:C.teal}}/>}
              </div>
            </div>
          </div>

          {/* Pose configuration */}
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14}}>🎭</span>
                <span style={{fontWeight:600}}>Pose configuration</span>
                <span style={{fontSize:11,color:C.muted}}>· click any slot to change</span>
              </div>
              <button onClick={randomizeVaried} style={{...btn(C.border,true),fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:5}}>
                ↺ Randomize 6-8
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {slots.map((slot,i)=>{
                const pose=ALL_POSES.find(p=>p.id===slot.poseId)||ALL_POSES[0];
                const cc=CAT_COLORS[pose.category]||C.purple;
                return(
                  <div key={i} onClick={()=>setShowPosePicker(i)} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:8,padding:12,cursor:"pointer",transition:"border-color 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=cc} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:10,color:C.muted}}>#{i+1}</span>
                      <span style={{fontSize:10,color:cc,background:`${cc}20`,padding:"1px 6px",borderRadius:10}}>{pose.category}</span>
                    </div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:4}}>{pose.name}</div>
                    <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{pose.desc.slice(0,70)}...</div>
                    {slot.varied&&<div style={{marginTop:6,fontSize:10,color:C.amber}}>● varied slot</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate section */}
          <div style={{background:C.card,borderRadius:10,border:`1px solid ${C.border}`,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:11,color:C.muted}}>
                {mode==="generate"
                  ? apiKey.length>20?"1 key configured · Imagen 3 active":"Add API key to enable generation"
                  : "No API key needed · processes your reference photos"}
              </div>
              {doneCount>0&&<button onClick={downloadAll} style={btn(C.teal)}>⬇ ZIP ({doneCount})</button>}
            </div>

            {/* ENHANCE MODE */}
            {mode==="enhance"&&(
              <div>
                {(!refs.front&&!refs.back&&!refs.side) ? (
                  <div style={{padding:"14px",background:`${C.amber}10`,border:`1px solid ${C.amber}30`,borderRadius:8,fontSize:12,color:C.amber,marginBottom:10}}>
                    ⚠ Upload at least one reference photo first (Front, Back or Side)
                  </div>
                ):(
                  <div style={{padding:"12px",background:`${C.teal}10`,border:`1px solid ${C.teal}30`,borderRadius:8,fontSize:12,color:C.teal,marginBottom:10}}>
                    ✓ {[refs.front&&"Front",refs.back&&"Back",refs.side&&"Side"].filter(Boolean).join(", ")} photo{[refs.front,refs.back,refs.side].filter(Boolean).length>1?"s":""} ready to enhance
                  </div>
                )}
                <button onClick={enhancingAll?()=>{}:enhanceReference} disabled={enhancingAll||(!refs.front&&!refs.back&&!refs.side)}
                  style={{...btn(enhancingAll?C.border:C.teal),width:"100%",fontSize:13,fontWeight:700,padding:"11px",marginBottom:8}}>
                  {enhancingAll?`⏳ Enhancing... ${doneCount}/8`:"✨ Enhance Reference Photos"}
                </button>
                <div style={{fontSize:11,color:C.muted,lineHeight:1.6}}>
                  What this does: removes background → replaces with pure white → sharpens fabric details → upscales to 1948×2656px → exports at maximum quality. No new model generated.
                </div>
              </div>
            )}

            {/* GENERATE MODE */}
            {mode==="generate"&&(
              <div>
                {/* Step 1 — Sample */}
                {!sampleDone&&!slots[0].result&&(
                  <button onClick={generating?()=>{stopRef.current=true;setGenerating(false);}:generateSample}
                    style={{...btn(generating?C.danger:C.purple),width:"100%",fontSize:13,fontWeight:700,padding:"11px",marginBottom:8}}>
                    {generating?"■ Stop":"⚡ Generate Sample (1 of 8) →"}
                  </button>
                )}

                {/* Sample done — feedback + approve */}
                {(sampleDone||slots[0].result)&&!generating&&(
                  <div style={{background:`${C.purple}10`,border:`1px solid ${C.purple}30`,borderRadius:8,padding:12,marginBottom:10}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.purple,marginBottom:8}}>✓ Sample ready — review slot #1 (Hero Front)</div>
                    <textarea value={sampleFeedback} onChange={e=>setSampleFeedback(e.target.value)}
                      placeholder="Optional: describe changes e.g. 'make model taller, darker background, show logo more prominently'"
                      style={{...{width:"100%",background:C.surf,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 10px",color:C.text,fontSize:11,fontFamily:"inherit",boxSizing:"border-box"},resize:"vertical",lineHeight:1.5,minHeight:50}}
                      rows={2} />
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      {sampleFeedback.trim()&&(
                        <button onClick={regenSampleWithFeedback} style={{...btn(C.amber),flex:1,fontSize:12}}>↺ Redo with Changes</button>
                      )}
                      <button onClick={generateAll} style={{...btn(C.teal),flex:2,fontSize:12,fontWeight:700}}>✓ Looks Good — Generate All 8</button>
                    </div>
                  </div>
                )}

                {/* Generating remaining */}
                {generating&&sampleDone&&(
                  <button onClick={()=>{stopRef.current=true;setGenerating(false);}} style={{...btn(C.danger),width:"100%",fontSize:12,marginBottom:8}}>
                    ■ Stop Generation
                  </button>
                )}
              </div>
            )}

            {/* Progress bar — both modes */}
            {slots.some(s=>s.status!=="idle")&&(
              <div style={{marginTop:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:C.muted}}>Progress</span>
                  <span style={{fontSize:11}}>{doneCount}/8 done</span>
                </div>
                <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${progress}%`,background:mode==="enhance"?C.teal:C.purple,borderRadius:3,transition:"width 0.4s"}} />
                </div>
                <div style={{display:"flex",gap:3}}>
                  {slots.map((s,i)=>(
                    <div key={i} style={{flex:1,height:4,borderRadius:2,background:s.status==="done"?C.teal:s.status==="generating"?C.amber:s.status==="error"?C.danger:C.border,transition:"background 0.3s"}} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image preview grid */}
          {slots.some(s=>s.status!=="idle")&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {slots.map((slot,i)=>{
                const pose=ALL_POSES.find(p=>p.id===slot.poseId)||ALL_POSES[0];
                const cc=CAT_COLORS[pose.category]||C.purple;
                return(
                  <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                    <div style={{aspectRatio:"3/4",background:C.surf,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {slot.status==="done"&&slot.result?(
                        <div style={{position:"relative",width:"100%",height:"100%"}}>
                          <img src={slot.result} alt={pose.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          {enhancing[i]&&(
                            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                              <div style={{fontSize:20,animation:"spin 1s linear infinite"}}>✨</div>
                              <div style={{fontSize:11,color:"#fff"}}>Enhancing...</div>
                            </div>
                          )}
                          {!enhancing[i]&&(
                            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",opacity:0,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"opacity 0.2s",flexWrap:"wrap",padding:8}}
                              onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0"}>
                              <button onClick={()=>regenSlot(i)} style={{...btn(C.purple),padding:"5px 8px",fontSize:10}}>↻ Redo</button>
                              <button onClick={()=>handleEnhance(i,1.5)} style={{...btn("#f59e0b"),padding:"5px 8px",fontSize:10}}>✨ 1.5×</button>
                              <button onClick={()=>handleEnhance(i,2)} style={{...btn("#a855f7"),padding:"5px 8px",fontSize:10}}>✨ 2×</button>
                              <button onClick={()=>{const a=document.createElement("a");a.href=slot.result;a.download=`${product.name.replace(/\s+/g,"_")}_${i+1}.jpg`;a.click();}} style={{...btn(C.teal),padding:"5px 8px",fontSize:10}}>⬇</button>
                            </div>
                          )}
                        </div>
                      ):slot.status==="generating"?(
                        <div style={{textAlign:"center",color:C.amber}}>
                          <div style={{fontSize:20,marginBottom:6,animation:"spin 1s linear infinite"}}>⏳</div>
                          <div style={{fontSize:11}}>Generating...</div>
                        </div>
                      ):slot.status==="error"?(
                        <div style={{textAlign:"center",padding:10}}>
                          <div style={{fontSize:18,marginBottom:6}}>❌</div>
                          <div style={{fontSize:10,color:C.danger,marginBottom:6,lineHeight:1.4}}>{slot.error?.slice(0,80)}</div>
                          <button onClick={()=>regenSlot(i)} style={{...btn(C.purple),padding:"4px 8px",fontSize:10}}>Retry</button>
                        </div>
                      ):slot.status==="pending"?(
                        <div style={{textAlign:"center",color:C.muted}}>
                          <div style={{fontSize:18,marginBottom:4}}>⏸</div>
                          <div style={{fontSize:10}}>Queued</div>
                        </div>
                      ):null}
                    </div>
                    <div style={{padding:"8px 10px",borderTop:`1px solid ${C.border}`}}>
                      <div style={{fontSize:11,fontWeight:600,marginBottom:2}}>{pose.name}</div>
                      {product.name&&<div style={{fontSize:10,color:C.muted}}>{product.name.replace(/\s+/g,"_")}_{i+1}.jpg</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Per-slot feedback panel */}
            {slotFeedback.index>=0&&slots[slotFeedback.index]&&(
              <div style={{background:`${C.purple}10`,border:`1px solid ${C.purple}30`,borderRadius:10,padding:14,marginTop:4}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.purple}}>
                    ↻ Redo Slot #{slotFeedback.index+1} — {ALL_POSES.find(p=>p.id===slots[slotFeedback.index].poseId)?.name}
                  </div>
                  <button onClick={()=>setSlotFeedback({index:-1,text:""})} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>✕</button>
                </div>
                <textarea
                  value={slotFeedback.text}
                  onChange={e=>setSlotFeedback(p=>({...p,text:e.target.value}))}
                  placeholder="Describe changes e.g. 'make model taller', 'show logo more clearly', 'wider shoulders', 'different pose'... or leave blank to just regenerate"
                  rows={2}
                  style={{width:"100%",background:C.surf,border:`1px solid ${C.border}`,borderRadius:7,padding:"8px 10px",color:C.text,fontSize:12,fontFamily:"inherit",resize:"vertical",lineHeight:1.5,boxSizing:"border-box",marginBottom:10}}
                />
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>doRegenSlot(slotFeedback.index,"")}
                    style={{...btn(C.border,true),flex:1,fontSize:12,color:C.muted}}>
                    ↻ Regenerate (no changes)
                  </button>
                  <button onClick={()=>doRegenSlot(slotFeedback.index,slotFeedback.text)}
                    style={{...btn(C.purple),flex:2,fontSize:12,fontWeight:700}}>
                    ✓ {slotFeedback.text.trim()?"Apply Changes & Regenerate":"Regenerate"}
                  </button>
                </div>
              </div>
            )}
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}
          onClick={e=>e.target===e.currentTarget&&setShowKeyModal(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24,width:440,maxWidth:"90vw"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>Gemini API Key</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:20,lineHeight:1.6}}>
              Uses Imagen 3 (billing enabled — ~$0.03/image, no daily limit).<br/>
              Get key → <span style={{color:C.purple}}>aistudio.google.com</span> → API Keys → Create API key
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Your Gemini API Key</div>
            <input type="password" placeholder="AIza..." value={apiKey} onChange={e=>setApiKey(e.target.value)}
              style={{...inp,marginBottom:14,padding:"10px 12px",fontSize:13}} />
            <div style={{padding:"10px 14px",background:apiKey.length>20?`${C.teal}15`:`${C.amber}15`,border:`1px solid ${apiKey.length>20?C.teal:C.amber}40`,borderRadius:8,fontSize:12,color:apiKey.length>20?C.teal:C.amber,marginBottom:16}}>
              {apiKey.length>20?"✓ Key entered — reference photo analysis + image generation ready":"⚠ Enter your API key to enable all features"}
            </div>
            <button onClick={()=>{localStorage.setItem("imageStudio_apiKey",apiKey);setShowKeyModal(false);}} style={{...btn(C.purple),width:"100%",padding:"10px"}}>Save & Close</button>
          </div>
        </div>
      )}

      {/* Pose Picker Modal */}
      {showPosePicker!==null&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}
          onClick={e=>e.target===e.currentTarget&&setShowPosePicker(null)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,width:700,maxWidth:"90vw",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Select Pose — Slot {showPosePicker+1}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:14}}>50 poses across 10 categories</div>
            <input placeholder="Search poses..." value={poseSearch} onChange={e=>setPoseSearch(e.target.value)}
              style={{...inp,marginBottom:12,padding:"8px 12px"}} />
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {["All",...Object.keys(POSES)].map(cat=>(
                <button key={cat} onClick={()=>setPoseCat(cat)} style={{padding:"3px 10px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",background:poseCat===cat?(CAT_COLORS[cat]||C.purple):C.surf,color:poseCat===cat?"#fff":C.muted}}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {filteredPoses.map(pose=>{
                  const sel=slots[showPosePicker]?.poseId===pose.id;
                  const cc=CAT_COLORS[pose.category]||C.purple;
                  return(
                    <div key={pose.id} onClick={()=>{setSlots(p=>p.map((s,i)=>i===showPosePicker?{...s,poseId:pose.id}:s));setShowPosePicker(null);}}
                      style={{padding:"10px 12px",borderRadius:8,cursor:"pointer",border:`1px solid ${sel?cc:C.border}`,background:sel?`${cc}15`:C.surf,transition:"all 0.15s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:cc,flexShrink:0}} />
                        <span style={{fontSize:12,fontWeight:600}}>{pose.name}</span>
                        <span style={{fontSize:10,color:cc,background:`${cc}20`,padding:"1px 6px",borderRadius:10,marginLeft:"auto"}}>{pose.category}</span>
                      </div>
                      <div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{pose.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button onClick={()=>setShowPosePicker(null)} style={{...btn(C.border,true),marginTop:14,color:C.muted}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Logo Library Modal */}
      {showLogoLibrary&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}
          onClick={e=>e.target===e.currentTarget&&setShowLogoLibrary(false)}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24,width:480,maxWidth:"90vw",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:15}}>Logo Library</div>
              <button onClick={()=>setShowLogoLibrary(false)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>✕ Close</button>
            </div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Saved logos persist across sessions. Click any logo to use it.</div>
            {logoLibrary.length===0
              ? <div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:13}}>
                  No logos saved yet.<br/>Upload a logo in Reference Photos → click 💾 Save to Library
                </div>
              : <div style={{overflowY:"auto",flex:1}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                    {logoLibrary.map(logo=>(
                      <div key={logo.id} style={{background:C.surf,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                        <div onClick={()=>selectLogo(logo)} style={{aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",padding:8,cursor:"pointer",background:"#fff"}}>
                          <img src={logo.dataUrl} alt={logo.name} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}} />
                        </div>
                        <div style={{padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{logo.name}</div>
                          <button onClick={()=>deleteLogo(logo.id)} style={{padding:"2px 6px",borderRadius:4,border:`1px solid ${C.danger}`,background:"transparent",color:C.danger,cursor:"pointer",fontSize:10,fontFamily:"inherit",marginLeft:6}}>🗑</button>
                        </div>
                        <div style={{padding:"0 10px 8px"}}>
                          <button onClick={()=>selectLogo(logo)} style={{width:"100%",padding:"5px 0",borderRadius:5,border:"none",background:C.amber,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit"}}>
                            Use This Logo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>}
          </div>
        </div>
      )}
      {/* Gallery Modal */}
      {showGallery&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",flexDirection:"column",zIndex:200}}>
          {/* Gallery header */}
          <div style={{background:C.surf,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>🖼 Image Gallery</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{gallery.length} images saved · auto-saves every generated image</div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <input placeholder="Search by product name..." value={gallerySearch} onChange={e=>setGallerySearch(e.target.value)}
                style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 12px",color:C.text,fontSize:12,fontFamily:"inherit",width:220}} />
              {gallery.length>0&&(
                <button onClick={async()=>{if(confirm(`Delete all ${gallery.length} images from gallery?`)){await dbClear();setGallery([]);}}}
                  style={{...btn(C.danger,true),fontSize:11}}>🗑 Clear All</button>
              )}
              <button onClick={()=>setShowGallery(false)} style={{...btn(C.border,true),fontSize:12,color:C.muted}}>✕ Close</button>
            </div>
          </div>

          {/* Gallery grid */}
          <div style={{flex:1,overflowY:"auto",padding:24}}>
            {gallery.length===0?(
              <div style={{textAlign:"center",color:C.muted,padding:"80px 20px"}}>
                <div style={{fontSize:40,marginBottom:16}}>🖼</div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:8,color:C.text}}>No images yet</div>
                <div style={{fontSize:13,lineHeight:1.6}}>Every image you generate is automatically saved here.<br/>Generate your first image to see it appear.</div>
              </div>
            ):(
              <>
                {/* Group by product */}
                {(() => {
                  const filtered = gallery.filter(img =>
                    !gallerySearch || img.product_name.toLowerCase().includes(gallerySearch.toLowerCase()) || img.brand.toLowerCase().includes(gallerySearch.toLowerCase())
                  );
                  const groups = {};
                  filtered.forEach(img => {
                    const key = `${img.product_name} — ${img.brand} ${img.type} ${img.color}`;
                    if(!groups[key]) groups[key] = [];
                    groups[key].push(img);
                  });
                  return Object.entries(groups).map(([groupName, images]) => (
                    <div key={groupName} style={{marginBottom:32}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div>
                          <div style={{fontWeight:600,fontSize:14}}>{groupName}</div>
                          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{images.length} image{images.length!==1?"s":""} · {new Date(images[0].created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                        </div>
                        <button onClick={()=>{
                          const s=document.createElement("script");
                          s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                          s.onload=async()=>{
                            const zip=new window.JSZip();
                            images.forEach(img=>zip.file(img.filename,img.thumbnail || img.full_image || img.imageData.split(",")[1],{base64:true}));
                            const blob=await zip.generateAsync({type:"blob"});
                            const u=URL.createObjectURL(blob);
                            const a=document.createElement("a");a.href=u;a.download=`${images[0].product_name.replace(/\s+/g,"_")}_all.zip`;a.click();URL.revokeObjectURL(u);
                          };
                          document.head.appendChild(s);
                        }} style={{...btn(C.teal),fontSize:11}}>⬇ Download All ({images.length})</button>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
                        {images.map(img=>(
                          <div key={img.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                            <div style={{aspectRatio:"3/4",overflow:"hidden",position:"relative"}}>
                              <img src={img.thumbnail || img.full_image || img.imageData} alt={img.filename} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                            </div>
                            <div style={{padding:"8px 10px"}}>
                              <div style={{fontSize:11,fontWeight:600,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{img.pose_name}</div>
                              <div style={{fontSize:10,color:C.muted,marginBottom:6}}>{img.pose_category} · {new Date(img.created_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
                              <div style={{display:"flex",gap:5}}>
                                <button onClick={()=>{const a=document.createElement("a");a.href=img.thumbnail || img.full_image || img.imageData;a.download=img.filename;a.click();}}
                                  style={{flex:1,padding:"4px 0",borderRadius:5,border:"none",background:C.purple,color:"#fff",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>⬇</button>
                                <button onClick={async()=>{await supaGalleryDelete(img.id);await dbDelete(img.id).catch(()=>{});setGallery(p=>p.filter(x=>x.id!==img.id));}}
                                  style={{padding:"4px 8px",borderRadius:5,border:`1px solid ${C.danger}`,background:"transparent",color:C.danger,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>🗑</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;}
        input:focus,textarea:focus,select:focus{outline:1px solid #6366f1;}
        button:disabled{opacity:0.4;cursor:not-allowed;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#252538;border-radius:2px;}
        select option{background:#1A1A28;}
      `}</style>
    </div>
  );
}
