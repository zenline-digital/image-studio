import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════
const SUPABASE_URL   = "https://ioniqxioapcdgenpksex.supabase.co";
const GEMINI_MODEL   = "gemini-3.1-flash-lite-image"; // confirmed working model
const ADMIN_EMAILS   = ["midhun@zenline.ae","midhun@thugfit.ae"]; // add your email here
// Supabase anon key — set VITE_SUPABASE_ANON_KEY in Vercel env vars (safe to expose, it's public)
const BUILT_IN_SUPA_KEY = typeof import.meta !== "undefined" && import.meta.env
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || "")
  : "";

// ═══════════════════════════════════════════════════
//  CONSTANTS — MODELS
// ═══════════════════════════════════════════════════
const GARMENT_TYPES = ["T-Shirt","Tank Top","Shorts","Leggings","Sports Bra","Hoodie","Joggers","Zip Jacket","Gym Vest","Long Sleeve Top","Polo Shirt","Compression Tights"];

const MALE_MODELS = [
  {id:"m1", name:"Kai",    tag:"East Asian",       desc:"Athletic East Asian male, 26 years old, lean defined muscular physique, short black neatly styled hair, sharp Korean jawline, clear complexion, confident expression"},
  {id:"m2", name:"Arjun",  tag:"South Asian",      desc:"Athletic South Asian male, 29 years old, medium-dark complexion, short black hair, strong muscular build, defined shoulders, sharp Indian features"},
  {id:"m3", name:"Marcus", tag:"West African",     desc:"Athletic West African male, 25 years old, very dark complexion, short natural hair, powerfully built wide shoulders, thick muscular arms, commanding presence"},
  {id:"m4", name:"Jomo",   tag:"East African",     desc:"Athletic East African male, 27 years old, dark complexion, close-cropped hair, tall lean build with long limbs, high cheekbones, runner's physique"},
  {id:"m5", name:"Luca",   tag:"European",         desc:"Athletic Southern European male, 28 years old, fair skin, light brown hair, blue-green eyes, well-built gym physique, clean sharp jawline"},
  {id:"m6", name:"Alexei", tag:"Eastern European", desc:"Athletic Eastern European male, 27 years old, fair complexion, short dark hair, very strong muscular build, prominent cheekbones, intense expression"},
  {id:"m7", name:"Tariq",  tag:"Middle Eastern",   desc:"Athletic Lebanese male, 28 years old, warm olive complexion, short black hair, well-groomed dark stubble beard, strong lean build, handsome features"},
  {id:"m8", name:"Diego",  tag:"Latin",            desc:"Athletic Brazilian male, 25 years old, tan complexion, short dark wavy hair, muscular athletic build, warm skin tone, confident charming expression"},
  {id:"m9", name:"Yuto",   tag:"Japanese",         desc:"Athletic Japanese male, 27 years old, fair East Asian complexion, short black hair slightly textured, slim very toned physique, refined sharp features"},
  {id:"m10",name:"Andre",  tag:"African American", desc:"Athletic African-American male, 26 years old, medium-dark complexion, short fade haircut, muscular defined build, broad chest, strong jaw"},
  {id:"m11",name:"Kofi",   tag:"Ghanaian",         desc:"Athletic Ghanaian male, 28 years old, very dark complexion, shaved head, massively powerful build, thick arms and chest, extremely broad shoulders"},
  {id:"m12",name:"Rajan",  tag:"Sri Lankan",       desc:"Athletic Sri Lankan male, 26 years old, dark brown complexion, short black hair, lean defined natural musculature, naturally athletic South Asian build"},
  {id:"m13",name:"Erik",   tag:"Nordic",           desc:"Athletic Scandinavian male, 28 years old, very fair skin, short blond hair, pale blue eyes, tall lean athletic build, defined muscles, Nordic features"},
  {id:"m14",name:"Malik",  tag:"African American", desc:"Athletic African-American male, 27 years old, dark complexion, short natural textured hair, very muscular defined build, broad shoulders, intense expression"},
  {id:"m15",name:"Cyrus",  tag:"Persian",          desc:"Athletic Iranian male, 29 years old, medium olive complexion, short dark hair, short trimmed beard, strong lean athletic build, handsome Middle Eastern features"},
  {id:"m16",name:"Taka",   tag:"Pacific Islander", desc:"Athletic Polynesian male, 26 years old, warm brown complexion, short black hair, stocky powerfully built physique, very broad shoulders, Pacific Islander features"},
  {id:"m17",name:"Carlos", tag:"Mexican",          desc:"Athletic Mexican male, 28 years old, medium tan complexion, short dark hair, lean defined athletic build, friendly confident expression, Latin features"},
  {id:"m18",name:"Amir",   tag:"Arab",             desc:"Athletic Arab male, 27 years old, warm olive complexion, short dark neat hair, clean shaven, lean muscular build, handsome sharp features, UAE look"},
  {id:"m19",name:"Samson", tag:"Nigerian",         desc:"Athletic Nigerian male, 26 years old, very dark complexion, short natural hair, extremely broad shoulders, tall powerfully built physique, commanding presence"},
  {id:"m20",name:"Wei",    tag:"Chinese",          desc:"Athletic Chinese male, 25 years old, fair East Asian complexion, black hair neatly styled with slight wave, slim very toned physique, sharp refined features"},
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

const POSE_POOL = [
  {id:"hero_front",    name:"Hero Front",         cat:"Standard", desc:"Full body front-facing, arms at sides, centered, confident athletic stance, complete garment fully visible from head to feet"},
  {id:"back_view",     name:"Back View",           cat:"Standard", desc:"Turned completely around showing full back, back panel of garment visible, looking away or slight over-shoulder glance"},
  {id:"front_left",    name:"¾ Front Left",        cat:"Standard", desc:"Body angled 45° to the left, natural casual stance, mostly front of garment visible, slight weight shift"},
  {id:"upper_close",   name:"Upper Body Close-Up", cat:"Standard", desc:"Framed from waist to top of head only, chest and upper body in focus, garment chest design and collar detail prominent"},
  {id:"flat_lay",      name:"Flat Lay – Front",    cat:"Flat Lay", desc:"Garment laid flat on pure white surface, front side up, top-down overhead shot, perfectly centered and neat"},
  {id:"action_run",    name:"Running Stride",      cat:"Action",   desc:"Mid-stride running pose, one leg extended forward, arms in natural running motion, dynamic athletic movement, full body"},
  {id:"hands_hips",    name:"Hands on Hips",       cat:"Lifestyle",desc:"Both hands on hips, front-facing, confident power pose, full garment front visible, strong athletic expression"},
  {id:"fabric_macro",  name:"Fabric Macro",        cat:"Detail",   desc:"Extreme close-up of the fabric texture and weave, logo or design element in sharp focus, premium material quality visible"},
  {id:"side_profile",  name:"Side Profile",        cat:"Standard", desc:"Body turned exactly 90° to the side, full side profile visible, arms natural, garment side silhouette and seams clear"},
  {id:"arms_crossed",  name:"Arms Crossed",        cat:"Lifestyle",desc:"Arms crossed over chest, front-facing, relaxed confident expression, upper to full body framing, casual power pose"},
  {id:"squat_pose",    name:"Squat Position",      cat:"Action",   desc:"In a deep squat position showing flexibility and athleticism, front-facing, garment fit and stretch visible"},
  {id:"overhead_reach",name:"Overhead Reach",      cat:"Action",   desc:"Arms raised overhead or reaching up, showing garment torso and waist area, full body, dynamic stretching motion"},
];
const DEFAULT_POSES = [POSE_POOL[0],POSE_POOL[1],POSE_POOL[2],POSE_POOL[3],POSE_POOL[4],POSE_POOL[5],POSE_POOL[6],POSE_POOL[7]];
const OUTPUT_SIZES  = [
  {label:"1080×1350  (Instagram Portrait 4:5)", w:1080,h:1350},
  {label:"1080×1080  (Instagram Square 1:1)",   w:1080,h:1080},
  {label:"1948×2656  (Large Portrait — Print)", w:1948,h:2656},
  {label:"1080×1920  (Stories / Reels 9:16)",   w:1080,h:1920},
];
const CAT_COLORS = {Standard:"#3b82f6",Action:"#f97316","Flat Lay":"#8b5cf6",Lifestyle:"#06b6d4",Detail:"#ec4899"};

// ═══════════════════════════════════════════════════
//  SUPABASE HELPERS (REST API — no SDK)
// ═══════════════════════════════════════════════════
async function sbFetch(path, method="GET", body=null, token, key) {
  if (!key) throw new Error("Supabase key missing — add it in Settings");
  const h = {"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${token||key}`};
  if (body && method!=="GET") h["Prefer"] = "return=minimal";
  const res = await fetch(`${SUPABASE_URL}${path}`,{method,headers:h,body:body?JSON.stringify(body):undefined});
  if (!res.ok) {
    const e = await res.json().catch(()=>({}));
    throw new Error(e.message||e.error_description||e.error||`Supabase ${res.status}`);
  }
  const ct = res.headers.get("content-type")||"";
  if (ct.includes("json")) return res.json();
  return null;
}

const sbAuth = {
  signIn:  (em,pw,k)  => sbFetch("/auth/v1/token?grant_type=password","POST",{email:em,password:pw},null,k),
  signOut: (tok,k)    => sbFetch("/auth/v1/logout","POST",{},tok,k),
  getUser: (tok,k)    => sbFetch("/auth/v1/user","GET",null,tok,k),
};
const sbGallery = {
  load:   (tok,k)      => sbFetch("/rest/v1/gallery_images?select=*&order=created_at.desc&limit=300","GET",null,tok,k),
  insert: (row,tok,k)  => sbFetch("/rest/v1/gallery_images","POST",row,tok,k),
  remove: (id,tok,k)   => sbFetch(`/rest/v1/gallery_images?id=eq.${id}`,"DELETE",null,tok,k),
};

// Silently refresh an expired access_token using the stored refresh_token
async function refreshSession(refreshToken, key) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":key},
    body:JSON.stringify({refresh_token:refreshToken}),
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json(); // returns { access_token, refresh_token, user }
}

// ═══════════════════════════════════════════════════
//  GEMINI + CANVAS UTILITIES
// ═══════════════════════════════════════════════════
async function callGemini(apiKey, parts, temperature=0.25) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts}],generationConfig:{responseModalities:["IMAGE","TEXT"],temperature}}),
  });
  if (!res.ok) {
    const e = await res.json().catch(()=>({}));
    throw new Error(e.error?.message||`Gemini error ${res.status}`);
  }
  const data = await res.json();
  const rp = data.candidates?.[0]?.content?.parts||[];
  const img = rp.find(p=>p.inlineData?.data);
  if (!img) throw new Error(rp.find(p=>p.text)?.text||"No image returned from Gemini. Try again.");
  return img.inlineData;
}

async function canvasResize(dataURL, w, h, quality=0.95, bg="#FFFFFF") {
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      const ctx=c.getContext("2d"); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
      const ratio=Math.min(w/img.width,h/img.height);
      const sw=Math.round(img.width*ratio),sh=Math.round(img.height*ratio);
      ctx.drawImage(img,(w-sw)/2,(h-sh)/2,sw,sh);
      resolve(c.toDataURL("image/jpeg",quality));
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

async function canvasEnhance(dataURL, outW, outH, quality=0.95) {
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement("canvas"); c.width=img.width; c.height=img.height;
      const ctx=c.getContext("2d"); ctx.drawImage(img,0,0);
      const id=ctx.getImageData(0,0,c.width,c.height); const d=id.data;
      const off=Math.max(5,Math.round(Math.min(c.width,c.height)*0.02));
      const pts=[[off,off],[c.width-off,off],[off,c.height-off],[c.width-off,c.height-off]];
      const smp=pts.map(([x,y])=>{const i=(y*c.width+x)*4;return[d[i],d[i+1],d[i+2]];});
      const bgR=Math.round(smp.reduce((s,v)=>s+v[0],0)/4);
      const bgG=Math.round(smp.reduce((s,v)=>s+v[1],0)/4);
      const bgB=Math.round(smp.reduce((s,v)=>s+v[2],0)/4);
      const vis=new Uint8Array(c.width*c.height);
      const q=[]; const thresh=45;
      for(let x=0;x<c.width;x++){q.push([x,0]);q.push([x,c.height-1]);}
      for(let y=1;y<c.height-1;y++){q.push([0,y]);q.push([c.width-1,y]);}
      while(q.length){
        const [x,y]=q.pop(); const idx=y*c.width+x;
        if(x<0||x>=c.width||y<0||y>=c.height||vis[idx])continue;
        vis[idx]=1; const pi=idx*4;
        if(Math.abs(d[pi]-bgR)+Math.abs(d[pi+1]-bgG)+Math.abs(d[pi+2]-bgB)>thresh*3)continue;
        d[pi]=255;d[pi+1]=255;d[pi+2]=255;
        q.push([x-1,y],[x+1,y],[x,y-1],[x,y+1]);
      }
      ctx.putImageData(id,0,0);
      const c2=document.createElement("canvas"); c2.width=outW; c2.height=outH;
      const ctx2=c2.getContext("2d"); ctx2.fillStyle="#FFFFFF"; ctx2.fillRect(0,0,outW,outH);
      const r2=Math.min(outW/c.width,outH/c.height)*0.9;
      ctx2.drawImage(c,(outW-c.width*r2)/2,(outH-c.height*r2)/2,c.width*r2,c.height*r2);
      resolve(c2.toDataURL("image/jpeg",quality));
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

async function resizeSquare(dataURL, size=280) {
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement("canvas"); c.width=size; c.height=size;
      const ctx=c.getContext("2d"); ctx.fillStyle="#fff"; ctx.fillRect(0,0,size,size);
      const s=Math.min(img.width,img.height);
      ctx.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,size,size);
      resolve(c.toDataURL("image/jpeg",0.75));
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

async function resizeForGallery(dataURL) { return canvasResize(dataURL,600,800,0.78); }

// Canvas upscale — multiplies pixel dimensions (1.5x or 2x) with high-quality smoothing
async function upscaleImage(dataURL, factor) {
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement("canvas");
      c.width=Math.round(img.width*factor);
      c.height=Math.round(img.height*factor);
      const ctx=c.getContext("2d");
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality="high";
      ctx.fillStyle="#FFFFFF";
      ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0,c.width,c.height);
      resolve(c.toDataURL("image/jpeg",0.96));
    };
    img.onerror=()=>resolve(dataURL);
    img.src=dataURL;
  });
}

// ═══════════════════════════════════════════════════
//  PROMPT BUILDERS
// ═══════════════════════════════════════════════════
function buildThumbPrompt(m) {
  return `Professional fitness model portrait. ${m.desc}. Wearing plain white fitted athletic top. Waist-up shot looking directly at camera. Pure white background. Even studio lighting. High quality commercial photography. No text, no watermarks.`;
}

function buildSlotPrompt(model, garmentType, pose, imgs) {
  const hasBack=!!imgs.back, hasSide=!!imgs.side, hasDetail=!!imgs.detail;

  const poseRef = pose.id==="back_view"
    ? (hasBack?"Refer to REFERENCE IMAGE 2 (BACK VIEW) for the back of the garment.":"No back photo provided — infer back design from the front reference.")
    : pose.id==="side_profile"
      ? (hasSide?"Refer to the SIDE VIEW reference for the garment side.":"Infer the side profile from the front reference.")
      : pose.id==="fabric_macro"
        ? (hasDetail?"Refer to the DETAIL/CLOSE-UP reference for fabric texture.":"Use any reference showing fabric texture best.")
        : "Refer to REFERENCE IMAGE 1 (FRONT VIEW) for the front of the garment.";

  return `TASK: Create a new professional product photo. A ${garmentType} reference image is attached.

═══ THE MODEL IN THE REFERENCE IMAGE IS NOT THE MODEL TO USE ═══
The reference photo was taken with a placeholder model for product documentation only.
That person must be 100% replaced. Their appearance — skin colour, face, hair, body — must not appear anywhere in your output.

═══ THE MODEL YOU MUST USE IS: ═══
${model.desc}
Generate this exact person. They are completely different from whoever is in the reference photos.
If your output does not match this description, it is WRONG.

═══ WHAT TO KEEP FROM THE REFERENCE (garment only): ═══
Study the ${garmentType} in the reference carefully:
• Exact colours and colour placement — do not change any colour
• Exact logo, text, graphics, prints — pixel-perfect match
• Exact cut: neckline, sleeve length, hem, overall silhouette
• Exact fabric texture, material, mesh panels, seams, stitching
• Exact fit proportions — do not alter the garment in any way
${poseRef}

═══ OUTPUT: ═══
• Model: ${model.desc} (the ONLY person in this image)
• Pose: ${pose.name} — ${pose.desc}
• Background: pure white (#FFFFFF), no shadows
• Lighting: even professional softbox studio lighting
• Full body or 3/4 body shot — complete ${garmentType} visible
• Sharp, commercial activewear photography quality

FINAL REMINDER: The output must show ${model.desc.split(',').slice(0,3).join(',')} — NOT the person from the reference image.`;
}

// ═══════════════════════════════════════════════════
//  SET PASSWORD SCREEN (invite / password reset flow)
// ═══════════════════════════════════════════════════
function SetPasswordScreen({token, supaKey, onDone}) {
  const [pass, setPass]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(()=>{
    // Fetch user info from the invite token to show their email
    if (!supaKey||!token) return;
    fetch(`${SUPABASE_URL}/auth/v1/user`,{
      headers:{"apikey":supaKey,"Authorization":`Bearer ${token}`},
    }).then(r=>r.json()).then(d=>setUserEmail(d.email||"")).catch(()=>{});
  },[token,supaKey]);

  const submit = async () => {
    if (pass.length < 8)    { setError("Password must be at least 8 characters"); return; }
    if (pass !== confirm)   { setError("Passwords don't match"); return; }
    if (!supaKey)           { setError("Missing Supabase key — contact admin"); return; }
    setLoading(true); setError("");
    try {
      // Set the new password using the invite access token
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`,{
        method:"PUT",
        headers:{"Content-Type":"application/json","apikey":supaKey,"Authorization":`Bearer ${token}`},
        body: JSON.stringify({password:pass}),
      });
      if (!res.ok) {
        const e = await res.json().catch(()=>({}));
        throw new Error(e.message||"Failed to set password");
      }
      const userData = await res.json();
      // Clear invite params from URL so page reload shows login
      window.history.replaceState(null,"",window.location.pathname);
      onDone({token, user:userData});
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0d0d16",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:400,background:"#09090f",border:"1px solid #1a1a2e",borderRadius:16,padding:36}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,background:"linear-gradient(135deg,#7c3aed,#2563eb)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px"}}>🎉</div>
          <div style={{fontWeight:800,fontSize:20,color:"#f1f5f9"}}>You've been invited!</div>
          <div style={{fontSize:12,color:"#3a3a5c",marginTop:4}}>Image Studio · THUGFIT</div>
          {userEmail&&<div style={{fontSize:13,color:"#64748b",marginTop:8,background:"#13131f",border:"1px solid #1a1a2e",borderRadius:6,padding:"5px 12px",display:"inline-block"}}>{userEmail}</div>}
        </div>

        <div style={{fontSize:13,color:"#4a4a6a",textAlign:"center",marginBottom:22}}>Set your password to activate your account.</div>

        {error&&<div style={{background:"#ef444415",border:"1px solid #ef444430",color:"#fca5a5",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14}}>⚠ {error}</div>}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>New Password</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Minimum 8 characters"
            style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"11px 14px",borderRadius:8,fontSize:14,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Confirm Password</div>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password"
            style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"11px 14px",borderRadius:8,fontSize:14,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
        </div>

        <button onClick={submit} disabled={loading}
          style={{width:"100%",padding:"13px 0",borderRadius:9,border:"none",cursor:loading?"not-allowed":"pointer",fontSize:15,fontWeight:800,background:loading?"#1a1a2e":"linear-gradient(135deg,#7c3aed,#2563eb)",color:loading?"#2a2a40":"#fff"}}>
          {loading?"Setting up account…":"Activate Account →"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  LOGIN SCREEN
// ═══════════════════════════════════════════════════
function LoginScreen({onLogin}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [supaKey,setSupaKey]=useState(()=>BUILT_IN_SUPA_KEY||localStorage.getItem("is_supa_key")||"");
  const [showKeyInput,setShowKeyInput]=useState(!localStorage.getItem("is_supa_key"));

  const doLogin = async () => {
    if (!email||!pass) { setError("Enter email and password"); return; }
    const key = supaKey||localStorage.getItem("is_supa_key");
    if (!key) { setShowKeyInput(true); setError("Supabase key required — enter it below"); return; }
    setLoading(true); setError("");
    try {
      const data = await sbAuth.signIn(email,pass,key);
      localStorage.setItem("is_supa_key",key);
      localStorage.setItem("is_supa_session",JSON.stringify({
        access_token:data.access_token,
        refresh_token:data.refresh_token,
        user:data.user,
      }));
      onLogin({token:data.access_token,user:data.user,supaKey:key});
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#0d0d16",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:380,background:"#09090f",border:"1px solid #1a1a2e",borderRadius:16,padding:36}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,background:"linear-gradient(135deg,#7c3aed,#2563eb)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px"}}>📸</div>
          <div style={{fontWeight:800,fontSize:20,color:"#f1f5f9",letterSpacing:"-0.4px"}}>Image Studio</div>
          <div style={{fontSize:12,color:"#2a2a40",marginTop:4}}>THUGFIT · ZenLine Digital</div>
        </div>

        {error&&<div style={{background:"#ef444415",border:"1px solid #ef444430",color:"#fca5a5",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>⚠ {error}</div>}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@zenline.ae"
            style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"11px 14px",borderRadius:8,fontSize:14,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&doLogin()} />
        </div>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Password</div>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"
            style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"11px 14px",borderRadius:8,fontSize:14,outline:"none"}}
            onKeyDown={e=>e.key==="Enter"&&doLogin()} />
        </div>

        {showKeyInput&&<div style={{marginBottom:20,background:"#0d0d14",border:"1px solid #1a1a2e",borderRadius:8,padding:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Supabase Anon Key <span style={{color:"#ef4444"}}>*</span></div>
          <input type="password" value={supaKey} onChange={e=>setSupaKey(e.target.value)} placeholder="eyJhb..."
            style={{width:"100%",background:"#09090f",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"9px 12px",borderRadius:7,fontSize:12,outline:"none"}}/>
          <div style={{fontSize:10,color:"#2a2a40",marginTop:5}}>From Supabase Dashboard → Project Settings → API → anon public key</div>
        </div>}

        <button onClick={doLogin} disabled={loading}
          style={{width:"100%",padding:"13px 0",borderRadius:9,border:"none",cursor:loading?"not-allowed":"pointer",fontSize:15,fontWeight:800,background:loading?"#1a1a2e":"linear-gradient(135deg,#7c3aed,#2563eb)",color:loading?"#2a2a40":"#fff"}}>
          {loading?"Signing in…":"Sign In →"}
        </button>

        {!showKeyInput&&<button onClick={()=>setShowKeyInput(true)} style={{width:"100%",marginTop:10,background:"none",border:"none",color:"#2a2a40",fontSize:11,cursor:"pointer"}}>
          Update Supabase key
        </button>}

        <div style={{marginTop:20,fontSize:11,color:"#1e1e30",textAlign:"center",lineHeight:1.6}}>
          Access is by invitation only.<br/>Contact admin to get your login credentials.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════
export default function App() {
  // ── Auth ──────────────────────────────────────
  const [session, setSession] = useState(()=>{
    try { return JSON.parse(localStorage.getItem("is_supa_session")||"null"); } catch { return null; }
  });
  const [supaKey, setSupaKey] = useState(()=>BUILT_IN_SUPA_KEY||localStorage.getItem("is_supa_key")||"");
  const [inviteData, setInviteData] = useState(null); // {token, type} from invite URL
  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email||"");

  const handleLogin = ({token,user,supaKey:k}) => {
    setSession({access_token:token,user});
    setSupaKey(k);
  };
  const handleLogout = async () => {
    try { await sbAuth.signOut(session?.access_token,supaKey); } catch {}
    localStorage.removeItem("is_supa_session");
    setSession(null);
  };

  // ── Detect invite/reset tokens in URL on mount ───
  useEffect(()=>{
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const qp   = new URLSearchParams(window.location.search);
    // Hash-based flow (older Supabase): /#access_token=...&type=invite
    const hashToken = hash.get("access_token");
    const hashType  = hash.get("type");
    // PKCE query-param flow (newer): /?token_hash=...&type=invite
    const pkceHash  = qp.get("token_hash");
    const pkceType  = qp.get("type");

    if (hashToken && (hashType==="invite"||hashType==="recovery")) {
      setInviteData({token:hashToken}); return;
    }
    if (pkceHash && (pkceType==="invite"||pkceType==="recovery")) {
      // Exchange token_hash for access_token
      const k = BUILT_IN_SUPA_KEY||localStorage.getItem("is_supa_key")||"";
      if (!k) return;
      fetch(`${SUPABASE_URL}/auth/v1/verify`,{
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":k},
        body:JSON.stringify({token_hash:pkceHash,type:pkceType}),
      }).then(r=>r.json()).then(d=>{
        if (d.access_token) { setInviteData({token:d.access_token}); window.history.replaceState(null,"",window.location.pathname); }
      }).catch(()=>{});
    }
  },[]);

  // ── Auto-refresh session on load (keeps users logged in) ──
  useEffect(()=>{
    const stored = JSON.parse(localStorage.getItem("is_supa_session")||"null");
    if (!stored?.refresh_token) return; // nothing stored, show login
    const k = BUILT_IN_SUPA_KEY||localStorage.getItem("is_supa_key")||"";
    if (!k) return;
    // Try to silently get a fresh access_token
    refreshSession(stored.refresh_token, k)
      .then(data=>{
        const sess={access_token:data.access_token,refresh_token:data.refresh_token,user:data.user};
        localStorage.setItem("is_supa_session",JSON.stringify(sess));
        setSession(sess);
        setSupaKey(k);
      })
      .catch(()=>{
        // Refresh token also expired — clear everything, show login
        localStorage.removeItem("is_supa_session");
        setSession(null);
      });
  },[]);

  // ── API Keys ──────────────────────────────────
  const [geminiKey, setGeminiKey] = useState(()=>localStorage.getItem("is_gemini_key")||"");
  const [showSettings, setShowSettings] = useState(false);
  const [tempGemini, setTempGemini]   = useState("");
  const [tempSupa, setTempSupa]       = useState("");
  const saveSettings = () => {
    if (tempGemini) { localStorage.setItem("is_gemini_key",tempGemini.trim()); setGeminiKey(tempGemini.trim()); }
    if (tempSupa)   { localStorage.setItem("is_supa_key",tempSupa.trim()); setSupaKey(tempSupa.trim()); }
    setShowSettings(false);
  };

  // ── Mode ──────────────────────────────────────
  const [mode, setMode] = useState("model");

  // ── Product Inputs ────────────────────────────
  const [refImages, setRefImages] = useState({front:null,back:null,side:null,detail:null});
  const [garmentType, setGarmentType] = useState("T-Shirt");
  const [gender, setGender] = useState("female");
  const [selectedModel, setSelectedModel] = useState(null);
  const [sizeIdx, setSizeIdx] = useState(0);
  const outSize = OUTPUT_SIZES[sizeIdx];

  const handleFile = (f, slot) => {
    if (!f||!f.type.startsWith("image/")) return;
    const r=new FileReader();
    r.onload=e=>{ const url=e.target.result; setRefImages(prev=>({...prev,[slot]:{data:url.split(",")[1],mime:f.type,preview:url}})); resetSlots(); };
    r.readAsDataURL(f);
  };
  const removeRef = slot => { setRefImages(prev=>({...prev,[slot]:null})); resetSlots(); };

  // ── 8 Slots ───────────────────────────────────
  const [slots, setSlots] = useState(()=>DEFAULT_POSES.map((pose,i)=>({idx:i,pose,image:null,status:"idle",error:null})));
  const [slotComments, setSlotComments] = useState(()=>Array(8).fill(""));
  const [activePoseSlot, setActivePoseSlot] = useState(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const stopRef = useRef(false);
  const resetSlots = () => setSlots(prev=>prev.map(s=>({...s,image:null,status:"idle",error:null})));

  // ── Enhance ───────────────────────────────────
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceMode, setEnhanceMode] = useState("canvas");

  // ── Model Gallery ─────────────────────────────
  const [showGallery, setShowGallery] = useState(false);
  const [galleryTab, setGalleryTab]   = useState("female");
  const [thumbs, setThumbs] = useState(()=>{ try{return JSON.parse(localStorage.getItem("is_model_thumbs")||"{}")}catch{return {}} });
  const [thumbLoading, setThumbLoading] = useState({});
  const [isGenAllThumbs, setIsGenAllThumbs] = useState(false);
  const genAllRef = useRef(false);

  // ── Shared Gallery ────────────────────────────
  const [sharedGallery, setSharedGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [showSharedGallery, setShowSharedGallery] = useState(false);

  const loadSharedGallery = useCallback(async () => {
    if (!session?.access_token||!supaKey) return;
    setGalleryLoading(true); setGalleryError("");
    try {
      const rows = await sbGallery.load(session.access_token, supaKey);
      setSharedGallery(rows||[]);
    } catch(e) { setGalleryError(e.message); }
    finally { setGalleryLoading(false); }
  },[session,supaKey]);

  useEffect(()=>{ if(session&&supaKey) loadSharedGallery(); },[session?.access_token,supaKey]);

  const saveImageToGallery = async (imageDataURL, meta) => {
    if (!session?.access_token||!supaKey) return;
    try {
      const thumb = await resizeForGallery(imageDataURL);
      await sbGallery.insert({
        user_id: session.user.id,
        user_email: session.user.email,
        image_data: thumb,
        model_name: meta.modelName||"",
        model_tag: meta.modelTag||"",
        garment_type: meta.garmentType||"",
        pose_name: meta.poseName||"",
        gender: meta.gender||"",
      }, session.access_token, supaKey);
      loadSharedGallery();
    } catch(e) { console.warn("Gallery save failed:",e.message); }
  };

  const deleteGalleryItem = async (id) => {
    if (!session?.access_token||!supaKey) return;
    try { await sbGallery.remove(id,session.access_token,supaKey); setSharedGallery(prev=>prev.filter(i=>i.id!==id)); } catch {}
  };

  // ── Stats ─────────────────────────────────────
  const [totalGenerated,setTotalGenerated]=useState(()=>parseInt(localStorage.getItem("is_total_gen")||"0"));
  const [lightboxImg, setLightboxImg] = useState(null);

  // ── Model Thumbnails ──────────────────────────
  const saveThumb = useCallback((id,url)=>{
    setThumbs(prev=>{ const u={...prev,[id]:url}; try{localStorage.setItem("is_model_thumbs",JSON.stringify(u))}catch{}; return u; });
  },[]);

  const generateThumb = useCallback(async (model)=>{
    if(!geminiKey||thumbs[model.id]||thumbLoading[model.id]) return;
    setThumbLoading(p=>({...p,[model.id]:true}));
    try { const img=await callGemini(geminiKey,[{text:buildThumbPrompt(model)}],0.45); const r=await resizeSquare(`data:${img.mimeType};base64,${img.data}`,280); saveThumb(model.id,r); }
    catch {}
    finally { setThumbLoading(p=>({...p,[model.id]:false})); }
  },[geminiKey,thumbs,thumbLoading,saveThumb]);

  const generateAllThumbs = async ()=>{
    if (!geminiKey) return;
    setIsGenAllThumbs(true); genAllRef.current=true;
    const models=galleryTab==="male"?MALE_MODELS:FEMALE_MODELS;
    const missing=models.filter(m=>!thumbs[m.id]);
    for(let i=0;i<missing.length;i+=3){ if(!genAllRef.current)break; await Promise.all(missing.slice(i,i+3).map(generateThumb)); await new Promise(r=>setTimeout(r,700)); }
    setIsGenAllThumbs(false); genAllRef.current=false;
  };

  useEffect(()=>{
    if(!showGallery||!geminiKey) return;
    const models=(galleryTab==="male"?MALE_MODELS:FEMALE_MODELS).slice(0,8);
    models.filter(m=>!thumbs[m.id]&&!thumbLoading[m.id]).forEach(generateThumb);
  },[showGallery,galleryTab]); // eslint-disable-line

  const selectModel = m=>{
    setSelectedModel(m);
    setShowGallery(false);
    // Clear all generated images so user doesn't see old model's images
    resetSlots();
    setSlotComments(Array(8).fill(""));
  };
  const switchGender = g=>{ setGender(g); if(selectedModel&&selectedModel.id[0]!==g[0])setSelectedModel(null); };
  const openGallery  = ()=>{ setGalleryTab(gender); setShowGallery(true); };
  const changePose   = (i,pose)=>{ setSlots(prev=>prev.map((s,j)=>j===i?{...s,pose,image:null,status:"idle",error:null}:s)); setActivePoseSlot(null); };
  const randomizeSlots = ()=>{ const v=[...POSE_POOL.slice(4)].sort(()=>Math.random()-0.5); setSlots(prev=>prev.map((s,i)=>i<4?s:{...s,pose:v[i-4]||s.pose,image:null,status:"idle",error:null})); };

  // ── Generation ────────────────────────────────
  const generateSlot = async (idx)=>{
    if(!geminiKey||!refImages.front||!selectedModel) return;
    const pose=slots[idx].pose;
    setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"generating",error:null}:s));
    try {
      const parts=[];
      if(refImages.front){parts.push({inlineData:{mimeType:refImages.front.mime,data:refImages.front.data}});parts.push({text:"[REFERENCE IMAGE 1 — FRONT VIEW]"});}
      if(refImages.back) {parts.push({inlineData:{mimeType:refImages.back.mime, data:refImages.back.data}});parts.push({text:"[REFERENCE IMAGE 2 — BACK VIEW]"});}
      if(refImages.side) {parts.push({inlineData:{mimeType:refImages.side.mime, data:refImages.side.data}});parts.push({text:"[REFERENCE IMAGE 3 — SIDE VIEW]"});}
      if(refImages.detail){parts.push({inlineData:{mimeType:refImages.detail.mime,data:refImages.detail.data}});parts.push({text:"[REFERENCE IMAGE 4 — DETAIL]"});}
      const comment = slotComments[idx]?.trim();
      const basePrompt = buildSlotPrompt(selectedModel,garmentType,pose,refImages);
      const fullPrompt = comment
        ? basePrompt + `\n\nSPECIFIC CHANGE REQUESTED FOR THIS REGENERATION:\n"${comment}"\nApply this specific instruction while keeping everything else identical.`
        : basePrompt;
      parts.push({text:fullPrompt});
      const img=await callGemini(geminiKey,parts,0.2);
      const raw=`data:${img.mimeType};base64,${img.data}`;
      const processed=await canvasResize(raw,outSize.w,outSize.h,0.95);
      setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"done",image:processed,error:null}:s));
      setTotalGenerated(n=>{ const next=n+1; localStorage.setItem("is_total_gen",String(next)); return next; });
      // Auto-save to shared gallery
      saveImageToGallery(processed,{modelName:selectedModel.name,modelTag:selectedModel.tag,garmentType,poseName:pose.name,gender});
    } catch(e) {
      setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"error",error:e.message}:s));
    }
  };

  // ── Upscale download ─────────────────────────────
  const downloadUpscaled = async (slot, factor) => {
    if (!slot.image) return;
    const upscaled = await upscaleImage(slot.image, factor);
    const a=document.createElement("a");
    a.href=upscaled;
    a.download=`thugfit_${selectedModel?.name||"model"}_${slot.pose.name.replace(/ /g,"_")}_${factor}x.jpg`;
    a.click();
  };

  // ── AI Enhance a specific slot ────────────────────
  const aiEnhanceSlot = async (idx) => {
    const slot=slots[idx];
    if (!slot.image||!geminiKey) return;
    setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"generating",error:null}:s));
    try {
      const base64=slot.image.split(",")[1];
      const img=await callGemini(geminiKey,[
        {inlineData:{mimeType:"image/jpeg",data:base64}},
        {text:"You are a professional photo retoucher. Enhance the quality of this product photography image: sharpen details, improve lighting clarity, make colours more accurate and vivid, increase overall sharpness and professional finish. The product, model, pose, and white background must stay EXACTLY the same — only improve the visual quality and sharpness."},
      ],0.15);
      const raw=`data:${img.mimeType};base64,${img.data}`;
      const processed=await canvasResize(raw,outSize.w,outSize.h,0.95);
      setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"done",image:processed,error:null}:s));
      saveImageToGallery(processed,{modelName:selectedModel?.name,modelTag:selectedModel?.tag,garmentType,poseName:slot.pose.name,gender});
    } catch(e) {
      setSlots(prev=>prev.map((s,i)=>i===idx?{...s,status:"done",error:null}:s));
    }
  };

  const generateSample = async ()=>{ stopRef.current=false; await generateSlot(0); };
  const generateRemaining = async ()=>{
    setIsGeneratingAll(true); stopRef.current=false;
    for(let i=1;i<8;i++){ if(stopRef.current)break; await generateSlot(i); await new Promise(r=>setTimeout(r,400)); }
    setIsGeneratingAll(false);
  };
  const generateAll = async ()=>{
    setIsGeneratingAll(true); stopRef.current=false;
    for(let i=0;i<8;i++){ if(stopRef.current)break; await generateSlot(i); await new Promise(r=>setTimeout(r,400)); }
    setIsGeneratingAll(false);
  };
  const stopGenerating = ()=>{ stopRef.current=true; setIsGeneratingAll(false); };

  const runEnhance = async ()=>{
    if(!refImages.front) return;
    setIsEnhancing(true); setEnhancedImage(null);
    try {
      let out;
      if(enhanceMode==="ai"){
        const img=await callGemini(geminiKey,[
          {inlineData:{mimeType:refImages.front.mime,data:refImages.front.data}},
          {text:`Professional product photographer: Take this product image and output it with pure white (#FFFFFF) background. Keep product EXACTLY the same — same colors, logo, design, size, proportions. Remove existing background, place on clean white. Add clean even studio lighting. No shadows on background.`},
        ],0.15);
        out=await canvasResize(`data:${img.mimeType};base64,${img.data}`,outSize.w,outSize.h,0.95);
      } else {
        out=await canvasEnhance(refImages.front.preview,outSize.w,outSize.h,0.95);
      }
      setEnhancedImage(out);
      saveImageToGallery(out,{modelName:"Enhanced",garmentType,poseName:"Enhanced Ref",gender});
    } catch(e) { alert("Enhance failed: "+e.message); }
    finally { setIsEnhancing(false); }
  };

  const downloadSlot = s=>{ if(!s.image)return; const a=document.createElement("a"); a.href=s.image; a.download=`thugfit_${selectedModel?.name||"model"}_${s.pose.name.replace(/ /g,"_")}.jpg`; a.click(); };
  const downloadAll  = ()=>slots.filter(s=>s.image).forEach((s,i)=>setTimeout(()=>downloadSlot(s),i*200));

  // ── Derived ───────────────────────────────────
  const galleryModels = galleryTab==="male"?MALE_MODELS:FEMALE_MODELS;
  const missingThumbs = galleryModels.filter(m=>!thumbs[m.id]).length;
  const doneSlots = slots.filter(s=>s.status==="done").length;
  const anyGenerating = slots.some(s=>s.status==="generating");
  const slot0done = slots[0].status==="done";
  const canGenerate = !!(geminiKey&&refImages.front&&selectedModel);
  const estimatedCost = (totalGenerated*0.04).toFixed(2);
  const slotBorder = s=>s.status==="done"?"#16a34a30":s.status==="error"?"#ef444430":s.status==="generating"?"#7c3aed60":"#1a1a2e";
  const slotBg     = s=>s.status==="done"?"#0a1a0a":s.status==="error"?"#1a0a0a":s.status==="generating"?"#0a0a1a":"#0a0a12";

  // ── Not logged in / invite flow ────────────────────
  if (inviteData) return (
    <SetPasswordScreen
      token={inviteData.token}
      supaKey={supaKey||BUILT_IN_SUPA_KEY||localStorage.getItem("is_supa_key")||""}
      onDone={({token,user})=>{
        const sess={access_token:token,user};
        localStorage.setItem("is_supa_session",JSON.stringify(sess));
        setSession(sess); setInviteData(null);
      }}
    />
  );
  if (!session) return <LoginScreen onLogin={handleLogin}/>;

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
        select option{background:#0d0d16;color:#e2e8f0;} input::placeholder{color:#2a2a40;}
        .slot-card:hover .slot-ov{opacity:1!important;} .gcard:hover .gdel{opacity:1!important;}
        .mcard:hover{border-color:#7c3aed80!important;transform:translateY(-2px);}
        .pp:hover{background:#1a1a2e!important;} .bh:hover{opacity:.85;}
      `}</style>

      {/* ╔══ HEADER ══╗ */}
      <header style={{background:"#09090f",borderBottom:"1px solid #1a1a2e",padding:"0 22px",display:"flex",alignItems:"center",height:52,gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginRight:6}}>
          <div style={{width:30,height:30,background:"linear-gradient(135deg,#7c3aed,#2563eb)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📸</div>
          <div>
            <div style={{fontWeight:800,fontSize:14,letterSpacing:"-0.3px",color:"#f1f5f9"}}>Image Studio</div>
            <div style={{fontSize:9,color:"#2a2a40",marginTop:-1}}>THUGFIT</div>
          </div>
        </div>
        <div style={{display:"flex",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:7,padding:2,gap:2}}>
          {[["model","🤖 Product on Model"],["enhance","⭐ Enhance Reference"]].map(([m,label])=>(
            <button key={m} onClick={()=>setMode(m)} style={{padding:"5px 12px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:mode===m?"linear-gradient(135deg,#7c3aed,#2563eb)":"none",color:mode===m?"#fff":"#4a4a6a"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setShowSharedGallery(!showSharedGallery)} style={{background:showSharedGallery?"#7c3aed20":"#13131f",border:"1px solid",borderColor:showSharedGallery?"#7c3aed":"#1a1a2e",color:showSharedGallery?"#a78bfa":"#4a4a6a",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600}}>
            🖼 Team Gallery ({sharedGallery.length})
          </button>
          <div style={{fontSize:11,color:"#3a3a5c",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:5,padding:"4px 9px"}}>💰 {totalGenerated} imgs · ~${estimatedCost}</div>
          <div style={{fontSize:11,color:"#4a4a6a",background:"#13131f",border:"1px solid #1a1a2e",borderRadius:5,padding:"4px 9px",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            👤 {session.user.email}
          </div>
          <button onClick={()=>{setTempGemini(geminiKey);setTempSupa(supaKey);setShowSettings(true);}} style={{background:"none",border:"1px solid #1a1a2e",color:"#4a4a6a",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>⚙</button>
          <button onClick={handleLogout} style={{background:"none",border:"1px solid #1a1a2e",color:"#3a3a5c",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:11}}>Sign Out</button>
        </div>
      </header>

      {/* ╔══ SHARED GALLERY PANEL ══╗ */}
      {showSharedGallery&&<div style={{borderBottom:"1px solid #1a1a2e",background:"#09090f",padding:"16px 22px",maxHeight:320,overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontWeight:800,fontSize:13,color:"#e2e8f0"}}>Team Gallery <span style={{color:"#2a2a40",fontWeight:400,fontSize:11}}>— all images generated by your team</span></span>
          <button onClick={loadSharedGallery} style={{background:"none",border:"1px solid #1a1a2e",color:"#4a4a6a",padding:"4px 9px",borderRadius:5,cursor:"pointer",fontSize:11}}>↻ Refresh</button>
        </div>
        {galleryLoading&&<div style={{color:"#2a2a40",fontSize:12,textAlign:"center",padding:20}}>Loading gallery…</div>}
        {galleryError&&<div style={{color:"#f87171",fontSize:12,background:"#1a0a0a",border:"1px solid #3a1a1a",borderRadius:6,padding:"8px 12px",marginBottom:10}}>{galleryError}<br/><span style={{fontSize:10,color:"#3a3a5c"}}>Check Supabase table setup in Settings</span></div>}
        {!galleryLoading&&!galleryError&&sharedGallery.length===0&&<div style={{color:"#1e1e30",fontSize:12,textAlign:"center",padding:20}}>No images yet — generate some!</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
          {sharedGallery.map(item=>(
            <div key={item.id} className="gcard" style={{borderRadius:7,overflow:"hidden",background:"#0d0d16",border:"1px solid #1a1a2e",cursor:"pointer",position:"relative"}} onClick={()=>setLightboxImg(item.image_data)}>
              <img src={item.image_data} style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}} alt=""/>
              <div style={{padding:"5px 7px"}}>
                <div style={{fontSize:10,color:"#64748b",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.model_name||"—"}</div>
                <div style={{fontSize:9,color:"#2a2a40",marginTop:1}}>{item.garment_type}</div>
                <div style={{fontSize:8,color:"#1a1a2e",marginTop:1}}>{item.user_email?.split("@")[0]}</div>
              </div>
              {(item.user_id===session.user.id||isAdmin)&&
                <button className="gdel" onClick={e=>{e.stopPropagation();deleteGalleryItem(item.id);}} style={{position:"absolute",top:4,right:4,background:"#0d0d16cc",border:"none",color:"#ef4444",cursor:"pointer",borderRadius:3,padding:"1px 5px",fontSize:10,opacity:0,transition:"opacity .15s"}}>✕</button>
              }
            </div>
          ))}
        </div>
      </div>}

      {/* ╔══ MAIN BODY ══╗ */}
      <div style={{display:"grid",gridTemplateColumns:"330px 1fr",minHeight:`calc(100vh - 52px${showSharedGallery?" - 320px":""})`}}>

        {/* ── LEFT PANEL ── */}
        <div style={{borderRight:"1px solid #1a1a2e",background:"#09090f",padding:18,display:"flex",flexDirection:"column",gap:16,overflowY:"auto"}}>

          {/* Ref image slots */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>① Reference Photos</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[{key:"front",label:"Front",emoji:"🔵",req:true},{key:"back",label:"Back",emoji:"🟣",req:true},{key:"side",label:"Side",emoji:"🟡",req:false},{key:"detail",label:"Detail",emoji:"🔍",req:false}].map(({key,label,emoji,req})=>{
                const img=refImages[key];
                return (
                  <div key={key}>
                    <div style={{fontSize:9,fontWeight:700,color:req?(img?"#a78bfa":"#7f1d1d"):"#2a2a40",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{emoji} {label}{req&&!img&&" *"}</div>
                    <div style={{border:"1.5px dashed",borderColor:img?"#7c3aed60":req?"#3a1a1a":"#1a1a2e",borderRadius:7,padding:img?0:14,textAlign:"center",cursor:"pointer",background:"#0d0d16",overflow:"hidden",minHeight:72,display:"flex",alignItems:"center",justifyContent:"center"}}
                      onClick={()=>document.getElementById(`rfi-${key}`)?.click()}
                      onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0],key);}}
                      onDragOver={e=>e.preventDefault()}>
                      {img?<div style={{position:"relative",width:"100%"}}>
                        <img src={img.preview} style={{width:"100%",maxHeight:100,objectFit:"contain",display:"block",background:"#0a0a14",borderRadius:6}} alt={label}/>
                        <button onClick={e=>{e.stopPropagation();removeRef(key);}} style={{position:"absolute",top:3,right:3,background:"#0d0d16cc",border:"none",color:"#ef4444",cursor:"pointer",borderRadius:3,padding:"1px 5px",fontSize:10}}>✕</button>
                      </div>:<><div style={{fontSize:18,marginBottom:2}}>{emoji}</div><div style={{color:"#1e1e30",fontSize:9}}>Drop or click</div></>}
                    </div>
                    <input id={`rfi-${key}`} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0],key)}/>
                  </div>
                );
              })}
            </div>
            {refImages.front&&!refImages.back&&<div style={{fontSize:10,color:"#a06020",background:"#1a1500",border:"1px solid #2a2000",borderRadius:5,padding:"5px 9px",marginTop:5}}>💡 Add Back photo for accurate Back View pose</div>}
          </div>

          {/* Garment */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>② Garment Type</div>
            <select value={garmentType} onChange={e=>setGarmentType(e.target.value)} style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"9px 11px",borderRadius:7,fontSize:13,outline:"none"}}>
              {GARMENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Gender */}
          {mode==="model"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>③ Gender</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[["female","♀ Female"],["male","♂ Male"]].map(([g,l])=>(
                <button key={g} onClick={()=>switchGender(g)} style={{padding:"9px 0",borderRadius:7,border:"1px solid",fontSize:12,fontWeight:700,cursor:"pointer",background:gender===g?"#7c3aed18":"#0d0d16",borderColor:gender===g?"#7c3aed":"#1a1a2e",color:gender===g?"#a78bfa":"#3a3a5c"}}>{l}</button>
              ))}
            </div>
          </div>}

          {/* Model */}
          {mode==="model"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>④ Model</div>
            <button onClick={openGallery} style={{width:"100%",background:"#0d0d16",border:"1px solid",borderColor:selectedModel?"#7c3aed50":"#1a1a2e",padding:"10px 12px",borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
              {selectedModel
                ?<>{thumbs[selectedModel.id]?<img src={thumbs[selectedModel.id]} style={{width:40,height:40,borderRadius:6,objectFit:"cover",flexShrink:0}} alt=""/>:<div style={{width:40,height:40,borderRadius:6,background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div>}<div style={{flex:1}}><div style={{fontWeight:700,color:"#c4b5fd",fontSize:12}}>{selectedModel.name}</div><div style={{fontSize:10,color:"#3a3a5c",marginTop:1}}>{selectedModel.tag}</div></div><div style={{color:"#2a2a40",fontSize:10}}>Change▸</div></>
                :<><div style={{width:40,height:40,borderRadius:6,background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div><div style={{color:"#2a2a40",fontSize:12}}>Browse &amp; select a model →</div></>
              }
            </button>
          </div>}

          {/* Output size */}
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>⑤ Output Size</div>
            <select value={sizeIdx} onChange={e=>setSizeIdx(Number(e.target.value))} style={{width:"100%",background:"#0d0d16",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"9px 11px",borderRadius:7,fontSize:12,outline:"none"}}>
              {OUTPUT_SIZES.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
            </select>
            <div style={{display:"flex",gap:5,marginTop:5}}>
              {["JPEG 95%","White BG",`${outSize.w}×${outSize.h}`].map(t=>(
                <div key={t} style={{flex:1,background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:4,padding:"3px 0",textAlign:"center",fontSize:9,color:"#2a2a40"}}>{t}</div>
              ))}
            </div>
          </div>

          {/* Enhance options */}
          {mode==="enhance"&&<div>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Enhancement</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[["canvas","⚡ Canvas\n(Instant)"],["ai","🤖 AI\n(Better)"]].map(([m,l])=>(
                <button key={m} onClick={()=>setEnhanceMode(m)} style={{padding:"9px 0",borderRadius:7,border:"1px solid",fontSize:11,fontWeight:700,cursor:"pointer",background:enhanceMode===m?"#7c3aed18":"#0d0d16",borderColor:enhanceMode===m?"#7c3aed":"#1a1a2e",color:enhanceMode===m?"#a78bfa":"#3a3a5c",lineHeight:1.4}}>{l}</button>
              ))}
            </div>
            <button onClick={runEnhance} disabled={!refImages.front||(enhanceMode==="ai"&&!geminiKey)}
              style={{marginTop:8,width:"100%",padding:"11px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:800,background:(refImages.front&&(enhanceMode==="canvas"||geminiKey))?"linear-gradient(135deg,#7c3aed,#2563eb)":"#12121e",color:(refImages.front&&(enhanceMode==="canvas"||geminiKey))?"#fff":"#2a2a40"}}>
              {isEnhancing?"⏳ Processing…":"✨ Enhance Reference"}
            </button>
          </div>}

          {/* Checklist */}
          {mode==="model"&&!canGenerate&&<div style={{background:"#0d0d14",border:"1px solid #1a1a2e",borderRadius:7,padding:"9px 11px"}}>
            {[[!!geminiKey,"Gemini API key"],[!!refImages.front,"Front product photo"],[!!selectedModel,"Model selected"]].map(([ok,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:11,color:ok?"#4ade80":"#2a2a40"}}><span>{ok?"✓":"○"}</span>{l}</div>
            ))}
          </div>}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{padding:"18px 22px",overflowY:"auto"}}>

          {/* MODEL MODE */}
          {mode==="model"&&<>
            {/* Pose config */}
            <div style={{background:"#09090f",border:"1px solid #1a1a2e",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:12,color:"#64748b"}}>🎭 Pose Configuration <span style={{fontWeight:400,color:"#2a2a40",fontSize:10}}>· click any slot to change</span></div>
                <button onClick={randomizeSlots} className="bh" style={{background:"#7c3aed18",border:"1px solid #7c3aed40",color:"#a78bfa",padding:"4px 10px",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:600}}>↺ Randomize 5–8</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                {slots.map((s,i)=>(
                  <div key={i} style={{background:slotBg(s),border:"1px solid",borderColor:slotBorder(s),borderRadius:7,padding:"8px 10px",cursor:"pointer",position:"relative"}} onClick={()=>setActivePoseSlot(activePoseSlot===i?null:i)}>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                      <span style={{fontSize:9,fontWeight:700,color:"#2a2a40"}}>#{i+1}</span>
                      <span style={{fontSize:8,fontWeight:700,background:(CAT_COLORS[s.pose.cat]||"#3b82f6")+"25",color:CAT_COLORS[s.pose.cat]||"#3b82f6",padding:"1px 4px",borderRadius:2}}>{s.pose.cat}</span>
                      {s.status==="done"&&<span style={{fontSize:8,color:"#4ade80",marginLeft:"auto"}}>✓</span>}
                      {s.status==="error"&&<span style={{fontSize:8,color:"#ef4444",marginLeft:"auto"}}>✕</span>}
                      {s.status==="generating"&&<div style={{width:7,height:7,border:"1.5px solid #7c3aed30",borderTop:"1.5px solid #7c3aed",borderRadius:"50%",animation:"spin .7s linear infinite",marginLeft:"auto"}}/>}
                    </div>
                    <div style={{fontWeight:700,fontSize:11,color:"#e2e8f0"}}>{s.pose.name}</div>
                    {activePoseSlot===i&&(
                      <div style={{position:"absolute",top:"100%",left:0,zIndex:50,background:"#0d0d16",border:"1px solid #2a2a40",borderRadius:7,padding:5,width:220,maxHeight:240,overflowY:"auto",boxShadow:"0 12px 40px #00000090",marginTop:3}}>
                        {POSE_POOL.map(p=>(
                          <div key={p.id} className="pp" onClick={e=>{e.stopPropagation();changePose(i,p);}} style={{padding:"7px 9px",borderRadius:5,cursor:"pointer",border:"1px solid transparent",marginBottom:2,background:"none"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:8,background:(CAT_COLORS[p.cat]||"#3b82f6")+"25",color:CAT_COLORS[p.cat]||"#3b82f6",padding:"1px 4px",borderRadius:2,fontWeight:700}}>{p.cat}</span><span style={{fontWeight:700,fontSize:11,color:"#e2e8f0"}}>{p.name}</span>{s.pose.id===p.id&&<span style={{color:"#7c3aed",marginLeft:"auto",fontSize:9}}>✓</span>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate controls */}
            <div style={{background:"#09090f",border:"1px solid #1a1a2e",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:doneSlots>0?10:0}}>
                {!slot0done
                  ?<button onClick={generateSample} disabled={!canGenerate||anyGenerating} className="bh" style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",cursor:canGenerate&&!anyGenerating?"pointer":"not-allowed",fontSize:13,fontWeight:800,background:canGenerate&&!anyGenerating?"linear-gradient(135deg,#7c3aed,#2563eb)":"#12121e",color:canGenerate&&!anyGenerating?"#fff":"#2a2a40"}}>
                      {slots[0].status==="generating"?"⏳ Generating…":"⚡ Generate Sample (1 of 8) →"}
                    </button>
                  :<button onClick={generateRemaining} disabled={!canGenerate||isGeneratingAll} className="bh" style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",cursor:canGenerate&&!isGeneratingAll?"pointer":"not-allowed",fontSize:13,fontWeight:800,background:canGenerate&&!isGeneratingAll?"linear-gradient(135deg,#16a34a,#059669)":"#12121e",color:canGenerate&&!isGeneratingAll?"#fff":"#2a2a40"}}>
                      {isGeneratingAll?"⏳ Generating…":"▶ Generate Remaining (2–8) →"}
                    </button>
                }
                {!slot0done&&<button onClick={generateAll} disabled={!canGenerate||anyGenerating} className="bh" style={{padding:"11px 14px",borderRadius:8,border:"1px solid #1a1a2e",cursor:canGenerate&&!anyGenerating?"pointer":"not-allowed",fontSize:11,fontWeight:700,background:"#0d0d16",color:canGenerate&&!anyGenerating?"#64748b":"#2a2a40"}}>All 8</button>}
                {(isGeneratingAll||anyGenerating)&&<button onClick={stopGenerating} style={{padding:"11px 12px",borderRadius:8,border:"1px solid #ef444440",background:"#ef444415",color:"#f87171",cursor:"pointer",fontSize:11,fontWeight:700}}>⏹</button>}
              </div>
              {doneSlots>0&&<div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{flex:1,height:3,background:"#1a1a2e",borderRadius:2}}><div style={{height:"100%",width:`${(doneSlots/8)*100}%`,background:"linear-gradient(90deg,#7c3aed,#2563eb)",borderRadius:2,transition:"width .4s"}}/></div>
                <span style={{fontSize:10,color:"#3a3a5c"}}>{doneSlots}/8</span>
                {doneSlots>0&&<button onClick={downloadAll} className="bh" style={{background:"#0d0d16",border:"1px solid #1a1a2e",color:"#4a4a6a",padding:"3px 9px",borderRadius:5,cursor:"pointer",fontSize:10}}>⬇ All</button>}
              </div>}
            </div>

            {/* 8 slot grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {slots.map((s,i)=>(
                <div key={i} className="slot-card" style={{borderRadius:9,border:"1px solid",borderColor:slotBorder(s),background:slotBg(s),overflow:"hidden",position:"relative"}}>
                  <div style={{aspectRatio:"3/4",background:"#090912",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                    {s.image
                      ?<img src={s.image} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}} onClick={()=>setLightboxImg(s.image)} alt=""/>
                      :<div style={{textAlign:"center",padding:10}}>
                        {s.status==="generating"?<><div style={{width:22,height:22,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 7px"}}/><div style={{fontSize:9,color:"#3a3a5c",animation:"pulse 1.5s ease-in-out infinite"}}>Generating…</div></>
                          :s.status==="error"?<><div style={{fontSize:16,color:"#ef4444",marginBottom:3}}>✕</div><div style={{fontSize:8,color:"#ef4444",lineHeight:1.3}}>{s.error?.slice(0,50)}</div><button onClick={()=>generateSlot(i)} style={{marginTop:5,background:"#ef444420",border:"1px solid #ef444440",color:"#f87171",padding:"2px 7px",borderRadius:3,cursor:"pointer",fontSize:9}}>Retry</button></>
                          :<><div style={{fontSize:22,color:"#1a1a2e"}}>#{i+1}</div><div style={{fontSize:9,color:"#1e1e30",marginTop:2}}>{s.pose.name}</div></>
                        }
                      </div>
                    }
                    {s.image&&<div className="slot-ov" style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,#000000c0,transparent)",padding:"18px 5px 5px",display:"flex",gap:3,opacity:0,transition:"opacity .2s"}}>
                      <button onClick={()=>downloadSlot(s)}       title="Download" style={{flex:1,background:"#00000070",border:"none",color:"#fff",padding:"4px 0",borderRadius:3,cursor:"pointer",fontSize:9}}>⬇</button>
                      <button onClick={()=>downloadUpscaled(s,2)} title="Download 2× upscaled" style={{flex:1,background:"#00000070",border:"1px solid #ffffff30",color:"#fff",padding:"4px 0",borderRadius:3,cursor:"pointer",fontSize:9,fontWeight:700}}>2x</button>
                      <button onClick={()=>aiEnhanceSlot(i)}      title="AI Enhance quality" style={{flex:1,background:"#7c3aed90",border:"none",color:"#fff",padding:"4px 0",borderRadius:3,cursor:"pointer",fontSize:9}}>✨</button>
                      <button onClick={()=>generateSlot(i)}       title="Regenerate" style={{flex:1,background:"#2563eb80",border:"none",color:"#fff",padding:"4px 0",borderRadius:3,cursor:"pointer",fontSize:9}}>↻</button>
                    </div>}
                  </div>
                  <div style={{padding:"5px 7px",borderTop:"1px solid",borderColor:slotBorder(s)}}>
                    <div style={{fontSize:9,fontWeight:700,color:s.status==="done"?"#4ade80":s.status==="error"?"#ef4444":"#2a2a40",marginBottom:s.status==="done"?4:0}}>{s.pose.name}</div>
                    {s.status==="done"&&<>
                      <input
                        value={slotComments[i]}
                        onChange={e=>{const c=[...slotComments];c[i]=e.target.value;setSlotComments(c);}}
                        onKeyDown={e=>e.key==="Enter"&&slotComments[i].trim()&&generateSlot(i)}
                        placeholder="Type changes to redo…"
                        style={{width:"100%",background:"#0a0a12",border:"1px solid #1e1e30",color:"#e2e8f0",padding:"4px 6px",borderRadius:4,fontSize:9,outline:"none",marginBottom:slotComments[i]?4:0}}
                      />
                      {slotComments[i].trim()&&<button onClick={()=>generateSlot(i)} style={{width:"100%",background:"#7c3aed25",border:"1px solid #7c3aed50",color:"#a78bfa",padding:"3px 0",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:700}}>↻ Redo with note</button>}
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {/* ENHANCE MODE */}
          {mode==="enhance"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,maxWidth:860}}>
            {["original","enhanced"].map(t=>(
              <div key={t}>
                <div style={{fontWeight:700,fontSize:12,color:"#4a4a6a",marginBottom:8}}>{t==="original"?"Original":"Enhanced — white bg · JPEG 95%"}</div>
                <div style={{aspectRatio:"3/4",background:"#09090f",border:"1px solid #1a1a2e",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {t==="original"?(refImages.front?<img src={refImages.front.preview} style={{width:"100%",height:"100%",objectFit:"contain"}} alt=""/>:<div style={{color:"#1a1a2e",textAlign:"center"}}><div style={{fontSize:36}}>📷</div><div style={{fontSize:11,marginTop:4}}>Upload Front photo</div></div>)
                    :(isEnhancing?<div style={{textAlign:"center"}}><div style={{width:26,height:26,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 9px"}}/><div style={{color:"#3a3a5c",fontSize:11}}>Enhancing…</div></div>
                      :enhancedImage?<img src={enhancedImage} style={{width:"100%",height:"100%",objectFit:"contain",cursor:"pointer"}} onClick={()=>setLightboxImg(enhancedImage)} alt=""/>
                      :<div style={{color:"#1a1a2e",textAlign:"center"}}><div style={{fontSize:36}}>✨</div><div style={{fontSize:11,marginTop:4}}>Enhanced appears here</div></div>)
                  }
                </div>
                {t==="enhanced"&&enhancedImage&&<button onClick={()=>{const a=document.createElement("a");a.href=enhancedImage;a.download=`thugfit_enhanced.jpg`;a.click();}} className="bh" style={{marginTop:8,width:"100%",padding:"8px 0",borderRadius:7,border:"1px solid #7c3aed",background:"#7c3aed20",color:"#a78bfa",cursor:"pointer",fontSize:12,fontWeight:700}}>⬇ Download</button>}
              </div>
            ))}
          </div>}
        </div>
      </div>

      {/* ╔══ MODEL GALLERY MODAL ══╗ */}
      {showGallery&&<div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onClick={e=>e.target===e.currentTarget&&setShowGallery(false)}>
        <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:13,width:"100%",maxWidth:920,maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"15px 20px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <span style={{fontWeight:800,fontSize:15,color:"#f1f5f9"}}>Select Model</span>
            <button onClick={()=>setShowGallery(false)} style={{background:"none",border:"none",color:"#3a3a5c",cursor:"pointer",fontSize:20}}>✕</button>
          </div>
          <div style={{padding:"10px 20px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",gap:8,flexShrink:0,flexWrap:"wrap"}}>
            {[["female","♀ Female (20)"],["male","♂ Male (20)"]].map(([g,l])=>(
              <button key={g} onClick={()=>setGalleryTab(g)} style={{padding:"6px 14px",borderRadius:6,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:700,background:galleryTab===g?"#7c3aed20":"none",borderColor:galleryTab===g?"#7c3aed":"#1a1a2e",color:galleryTab===g?"#a78bfa":"#3a3a5c"}}>{l}</button>
            ))}
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              {isGenAllThumbs
                ?<button onClick={()=>{genAllRef.current=false;setIsGenAllThumbs(false);}} style={{background:"#ef444420",border:"1px solid #ef444440",color:"#f87171",padding:"5px 11px",borderRadius:5,cursor:"pointer",fontSize:11}}>⏹ Stop</button>
                :<button onClick={generateAllThumbs} style={{background:"#7c3aed20",border:"1px solid #7c3aed40",color:"#a78bfa",padding:"5px 11px",borderRadius:5,cursor:"pointer",fontSize:11,fontWeight:600}}>↻ Generate All Previews {missingThumbs>0&&`(${missingThumbs})`}</button>
              }
              <button onClick={()=>{localStorage.removeItem("is_model_thumbs");setThumbs({});}} style={{background:"none",border:"1px solid #1a1a2e",color:"#2a2a40",padding:"5px 9px",borderRadius:5,cursor:"pointer",fontSize:10}}>Clear cache</button>
            </div>
          </div>
          <div style={{padding:"6px 20px 8px",flexShrink:0}}>
            <div style={{fontSize:10,color:"#2a2a40",background:"#0d0d14",border:"1px solid #1a1a2e",borderRadius:5,padding:"5px 11px"}}>💡 First time: click <strong style={{color:"#3a3a5c"}}>Generate All Previews</strong> (~2 min for 20 models). Cached permanently after that.</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11,padding:"0 20px 20px",overflowY:"auto"}}>
            {galleryModels.map(m=>{
              const sel=selectedModel?.id===m.id, loading=thumbLoading[m.id], thumb=thumbs[m.id];
              return (
                <div key={m.id} className="mcard" onClick={()=>selectModel(m)} style={{borderRadius:8,overflow:"hidden",background:"#0d0d16",border:"2px solid",borderColor:sel?"#7c3aed":"#1a1a2e",cursor:"pointer",transition:"all .15s"}}>
                  {thumb?<img src={thumb} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}} alt={m.name}/>
                    :<div style={{width:"100%",aspectRatio:"1",background:loading?"#111120":"#090912",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                      {loading?<><div style={{width:18,height:18,border:"2px solid #7c3aed30",borderTop:"2px solid #7c3aed",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><div style={{fontSize:9,color:"#2a2a40"}}>generating…</div></>:<div style={{fontSize:28,color:"#1a1a2e"}}>👤</div>}
                    </div>
                  }
                  <div style={{padding:"7px 9px"}}><div style={{fontWeight:700,fontSize:11,color:sel?"#c4b5fd":"#e2e8f0"}}>{sel?"✓ ":""}{m.name}</div><div style={{fontSize:9,color:"#2a2a40",marginTop:1}}>{m.tag}</div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>}

      {/* ╔══ SETTINGS MODAL ══╗ */}
      {showSettings&&<div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",overflowY:"auto",padding:24}} onClick={e=>e.target===e.currentTarget&&setShowSettings(false)}>
        <div style={{background:"#0d0d16",border:"1px solid #1a1a2e",borderRadius:13,padding:26,width:460,maxWidth:"100%"}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:22,color:"#f1f5f9"}}>⚙ Settings</div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Gemini API Key</div>
            <input type="password" value={tempGemini} onChange={e=>setTempGemini(e.target.value)} placeholder={geminiKey?"••••••••••••":"AIzaSy..."} style={{width:"100%",background:"#09090f",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"10px 13px",borderRadius:7,fontSize:13,outline:"none"}}/>
            <div style={{fontSize:10,color:"#2a2a40",marginTop:4}}>Using model: <span style={{color:"#3a3a5c",fontFamily:"monospace"}}>{GEMINI_MODEL}</span></div>
          </div>

          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,fontWeight:700,color:"#3a3a5c",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Supabase Anon Key</div>
            <input type="password" value={tempSupa} onChange={e=>setTempSupa(e.target.value)} placeholder={supaKey?"••••••••••••":"eyJhb..."} style={{width:"100%",background:"#09090f",border:"1px solid #1a1a2e",color:"#e2e8f0",padding:"10px 13px",borderRadius:7,fontSize:13,outline:"none"}}/>
            <div style={{fontSize:10,color:"#2a2a40",marginTop:4}}>Project: <span style={{color:"#3a3a5c",fontFamily:"monospace",fontSize:9}}>ioniqxioapcdgenpksex.supabase.co</span></div>
          </div>

          {isAdmin&&<div style={{background:"#0d0d14",border:"1px solid #2a1a40",borderRadius:8,padding:14,marginBottom:22}}>
            <div style={{fontWeight:700,fontSize:12,color:"#a78bfa",marginBottom:8}}>👑 Admin Panel</div>
            <div style={{fontSize:11,color:"#3a3a5c",lineHeight:1.6,marginBottom:10}}>
              To add a team member:<br/>
              1. Go to <span style={{color:"#7c3aed",cursor:"pointer"}} onClick={()=>window.open("https://supabase.com/dashboard/project/ioniqxioapcdgenpksex/auth/users","_blank")}>Supabase Dashboard → Auth → Users</span><br/>
              2. Click <strong style={{color:"#e2e8f0"}}>"Invite user"</strong> → enter their email<br/>
              3. They receive an email to set their password<br/>
              4. They log in here with that email + password
            </div>
            <div style={{fontSize:10,color:"#2a2a40",background:"#0a0a12",border:"1px solid #1a1a2e",borderRadius:6,padding:"8px 10px",fontFamily:"monospace"}}>
              <div style={{color:"#4a4a6a",marginBottom:4}}>{/* SQL to create gallery table if needed: */}</div>
              <div>CREATE TABLE IF NOT EXISTS gallery_images (</div>
              <div style={{paddingLeft:12}}>id uuid DEFAULT gen_random_uuid() PRIMARY KEY,</div>
              <div style={{paddingLeft:12}}>created_at timestamptz DEFAULT now(),</div>
              <div style={{paddingLeft:12}}>user_id text, user_email text,</div>
              <div style={{paddingLeft:12}}>image_data text, model_name text,</div>
              <div style={{paddingLeft:12}}>model_tag text, garment_type text,</div>
              <div style={{paddingLeft:12}}>pose_name text, gender text</div>
              <div>);</div>
            </div>
          </div>}

          <div style={{display:"flex",gap:8}}>
            <button onClick={saveSettings} className="bh" style={{padding:"9px 20px",background:"linear-gradient(135deg,#7c3aed,#2563eb)",border:"none",color:"#fff",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:13}}>Save</button>
            <button onClick={()=>setShowSettings(false)} style={{padding:"9px 14px",background:"#12121e",border:"1px solid #1a1a2e",color:"#3a3a5c",borderRadius:7,cursor:"pointer",fontSize:13}}>Cancel</button>
            <button onClick={()=>{localStorage.removeItem("is_total_gen");setTotalGenerated(0);}} style={{marginLeft:"auto",padding:"9px 11px",background:"none",border:"1px solid #1a1a2e",color:"#2a2a40",borderRadius:7,cursor:"pointer",fontSize:10}}>Reset counter</button>
          </div>
        </div>
      </div>}

      {/* ╔══ LIGHTBOX ══╗ */}
      {lightboxImg&&<div style={{position:"fixed",inset:0,background:"#000000d0",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>setLightboxImg(null)}>
        <img src={lightboxImg} style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:10}} alt=""/>
      </div>}
    </div>
  );
}
