
// Dataset mínimo de Región/Comunas (demo). Agrega más si lo deseas.
const REGIONES = [
  { nombre: "Región Metropolitana de Santiago", comunas: ["Santiago", "Providencia", "Maipú", "Las Condes", "Puente Alto", "La Florida"] },
  { nombre: "Región de Valparaíso", comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Quillota"] },
  { nombre: "Región del Biobío", comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante"] }
];

// Seleccionar los elementos del DOM
const regionSelect = document.getElementById("region");
const comunaSelect = document.getElementById("comuna");

// Cargar las regiones cuando cargue la página
window.addEventListener("DOMContentLoaded", () => {
  REGIONES.forEach(region => {
    let option = document.createElement("option");
    option.value = region.nombre;
    option.textContent = region.nombre;
    regionSelect.appendChild(option);
  });
});

// Cargar comunas al seleccionar una región
regionSelect.addEventListener("change", () => {
  // Limpiar comunas anteriores
  comunaSelect.innerHTML = "<option value=''>Seleccione comuna</option>";

  const regionSeleccionada = REGIONES.find(r => r.nombre === regionSelect.value);

  if (regionSeleccionada) {
    regionSeleccionada.comunas.forEach(comuna => {
      let option = document.createElement("option");
      option.value = comuna;
      option.textContent = comuna;
      comunaSelect.appendChild(option);
    });
  }
});
