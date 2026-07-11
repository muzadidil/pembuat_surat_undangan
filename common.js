/* ===== util bersama semua halaman =====
   Setiap halaman template wajib mendefinisikan sebelum memanggil initPage():
   - const PAGE = { format: "a4"|"a5", filename: "undangan-..." }
   - const EXAMPLE = { idField: nilaiContoh, ... }
   - function generate() — render kartu ke #invitation lalu set hasGenerated = true
   - (opsional) function afterReset() — bersih-bersih tambahan saat form dikosongkan
*/

function val(id){ return document.getElementById(id).value.trim(); }
function checked(id){ return document.getElementById(id).checked; }

function fmtTanggal(iso){
  if(!iso) return "";
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const [y,m,d] = iso.split("-").map(Number);
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][new Date(y,m-1,d).getDay()];
  return `${hari}, ${d} ${bulan[m-1]} ${y}`;
}

function fmtJam(t){
  if(!t) return "";
  return t + " WIB";
}

function escapeHtml(s){ const p=document.createElement("p"); p.textContent=s; return p.innerHTML; }
function nl2br(s){ return escapeHtml(s).replace(/\n/g,"<br>"); }

let hasGenerated = false;

function emptyMsg(){
  return '<div class="inv-empty">Isi form di kiri, lalu klik "Buat Undangan".<br>Pratinjau kartu undangan muncul di sini.</div>';
}

function resetFields(){
  document.querySelectorAll(".tpl-block input, .tpl-block textarea").forEach(el=>{
    if(el.type === "checkbox"){ el.checked = el.defaultChecked; }
    else { el.value = el.defaultValue; }
  });
  if(typeof afterReset === "function") afterReset();
}

function resetForm(){
  resetFields();
  document.getElementById("invitation").innerHTML = emptyMsg();
  hasGenerated = false;
  toast("Form dikembalikan ke awal");
}

function fillExample(){
  // kembalikan kalimat baku dulu, lalu isi data contoh
  resetFields();
  Object.entries(EXAMPLE).forEach(([id, value])=>{
    document.getElementById(id).value = value;
  });
  generate();
  toast("Contoh diisi");
}

function downloadPdf(){
  if(!hasGenerated){ toast("Buat undangan dulu"); return; }
  const el = document.getElementById("invitation");
  toast("Menyiapkan PDF...");
  // render elemen apa adanya (tanpa offset scroll), lalu tempel memenuhi 1 halaman penuh —
  // rasio elemen sudah sama dengan rasio kertas (1:√2) sehingga tidak terdistorsi
  html2canvas(el, { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, backgroundColor: "#ffffff" }).then(canvas=>{
    const pdf = new window.jspdf.jsPDF({ unit: "mm", format: PAGE.format, orientation: "portrait" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, pw, ph);
    pdf.save(PAGE.filename + ".pdf");
  }).catch(()=>{ toast("Gagal membuat PDF, coba lagi"); });
}

let toastT=null;
function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(toastT);
  toastT=setTimeout(()=>t.classList.remove("show"),1900);
}

/* dipanggil sekali di akhir tiap halaman */
function initPage(){
  // pratinjau langsung: setelah kartu pertama dibuat, ketikan apa pun memperbarui kartu
  document.querySelectorAll(".tpl-block input, .tpl-block textarea").forEach(el=>{
    el.addEventListener("input", ()=>{ if(hasGenerated) generate(); });
  });
  // saat halaman dibuka langsung tampilkan template siap pakai
  fillExample();
}
