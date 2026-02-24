const STORAGE_KEY = 'planilla-combustible-v1';
const STORAGE_KEY2 = 'horaentrada';
const STORAGE_KEY3 = 'playero'

window.onload = function() {
  // Mostrar modal si no hay hora ni nombre
  if (!localStorage.getItem(STORAGE_KEY2) || !localStorage.getItem(STORAGE_KEY3)) {
    document.getElementById('login-dialog').style.display = 'flex';
  } else {
    document.getElementById('login-dialog').style.display = 'none';
  }
}

let modo = 'inicio'; // o 'cierre'
const contenedor = document.getElementById('contenedor');
let expActual = 1;

const precios = {
    1: 5700, 2: 7200, 3: 8200, 4: 5700, 5: 7200, 6: 8200,
    7: 5700, 8: 7200, 9: 6200, 10: 5700, 11: 7200, 12: 6200,
    13: 4500
};

const datos = {
  1: { nombre: 'ESPECIAL 93 (CALLE)', ini: '', cie: '' },
  2: { nombre: 'SUPER 97 (CALLE)', ini: '', cie: '' },
  3: { nombre: 'DIESEL SMART (CALLE)', ini: '', cie: '' },
  4: { nombre: 'ESPECIAL 93 (DENTRO)', ini: '', cie: '' },
  5: { nombre: 'SUPER 97 (DENTRO)', ini: '', cie: '' },
  6: { nombre: 'DIESEL SMART (DENTRO)', ini: '', cie: '' },
  7: { nombre: 'ESPECIAL 93 (CALLE)', ini: '', cie: '' },
  8: { nombre: 'SUPER 97 (CALLE)', ini: '', cie: '' },
  9: { nombre: 'DIESEL (CALLE)', ini: '', cie: '' },
  10: { nombre: 'ESPECIAL 93 (DENTRO)', ini: '', cie: '' },
  11: { nombre: 'SUPER 97 (DENTRO)', ini: '', cie: '' },
  12: { nombre: 'DIESEL (DENTRO)', ini: '', cie: '' },
    13: { nombre: 'GLP', ini: '', cie: '' }


};

function actualizarHeaderTurno() {
    const nombre = localStorage.getItem(STORAGE_KEY3) || '-';
    const horaISO = localStorage.getItem(STORAGE_KEY2);

    let hora = '-';
    if (horaISO) {
        const d = new Date(horaISO);
        hora = d.toLocaleTimeString();
    }

    document.getElementById("turno-nombre").textContent = `Operador: ${nombre}`;
    document.getElementById("turno-hora").textContent = `Hora inicio: ${hora}`;
}

function iniciarturno(){
     const nombre = document.getElementById('nombre-operator').value.trim();
  if (!nombre) {
    alert("Ingrese su nombre para iniciar turno");
    return;
  }

  // Guardar nombre
  localStorage.setItem(STORAGE_KEY3, nombre);


    guardarhoraentrada()

     document.getElementById('login-dialog').style.display = 'none';

      actualizarHeaderTurno()
}

function guardarhoraentrada(){
const guardado = localStorage.getItem(STORAGE_KEY2);
    const ahora = new Date();

    if (!guardado) {
        // No existe turno
        localStorage.setItem(STORAGE_KEY2, ahora.toISOString());
        return;
    }

    const fechaGuardada = new Date(guardado);

    const mismoDia =
        fechaGuardada.getFullYear() === ahora.getFullYear() &&
        fechaGuardada.getMonth() === ahora.getMonth() &&
        fechaGuardada.getDate() === ahora.getDate();

    if (!mismoDia) {
        // Turno viejo → sobrescribir
        localStorage.setItem(STORAGE_KEY2, ahora.toISOString());
    }
}

function borrarhoraentrada(){
const fechahoraS = localStorage.getItem(STORAGE_KEY2);
if (fechahoraS){
localStorage.removeItem(STORAGE_KEY2)
}
}

function borrarplayero(){
const playero = localStorage.getItem(STORAGE_KEY3);
if (playero){
localStorage.removeItem(STORAGE_KEY3)
}
}



function guardarEstado() {
    const estado = {
        datos,
        modo,
        expActual
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function renderMangueras() {
    contenedor.innerHTML = '';

    // Determinar rango según expActual
    let inicio, fin;
    if (expActual === 1) {        // Máquina 1
        inicio = 1;
        fin = 6;
    } else if (expActual === 2) { // Máquina 2
        inicio = 7;
        fin = 12;
    } else if (expActual === 3) { // Máquina 3
        inicio = 13;
        fin = 13; // solo GLP
    }

    for (let i = inicio; i <= fin; i++) {
        const estadoClase =
            (datos[i].cie > datos[i].ini && datos[i].ini > 0) ? 'ready' :
            (datos[i].cie > 0 && datos[i].cie <= datos[i].ini) ? 'error' : '';

        contenedor.innerHTML += `
            <div class="card ${estadoClase}">
                <div class="manguera-info">
                    <span>${datos[i].nombre}</span>
                    <span class="precio-tag">Precio: $${precios[i]}</span>
                </div>
                <div class="input-row">
                   <div>
                        <label>INICIO</label>
                        <input type="number" inputmode="decimal" value="${datos[i].ini}" 
                            ${modo === 'cierre' ? 'readonly' : ''} 
                            oninput="actualizarDato(${i}, 'ini', this.value)">
                    </div>
                    <div>
                        <label>CIERRE</label>
                        <input type="number" inputmode="decimal" value="${datos[i].cie}" 
                            ${modo === 'inicio' ? 'readonly' : ''} 
                            oninput="actualizarDato(${i}, 'cie', this.value)">
                    </div>
                </div>
                <div class="resultado-box">
                    <div>
                        <label>Litros</label><br>
                        <span class="litros-valor">${calcularLitros(i)}</span>
                    </div>
                    <div>
                        <label>Importe</label><br>
                        <span class="importe-valor">$ ${calcularImporte(i)}</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function exportarPDF() {
    const nombrePlayero =  localStorage.getItem(STORAGE_KEY3) || '-';
    const fecha = new Date().toLocaleDateString();
    const hora = new Date().toLocaleTimeString();


    const horaInicioISO  = localStorage.getItem(STORAGE_KEY2);
let horaInicioFormateada = '-';
  const d = new Date(horaInicioISO);
    horaInicioFormateada = d.toLocaleTimeString();




    const estado = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!estado) {
        alert('No hay datos guardados');
        return;
    }

    // 🧮 Inputs de caja
    const inicial = parseFloat(document.getElementById('dinero-inicial').value) || 0;
    const qr = parseFloat(document.getElementById('ventas-qr').value) || 0;
    const posterior = parseFloat(document.getElementById('pago-posterior').value) || 0;
    const contado = parseFloat(document.getElementById('dinero-contado').value) || 0;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 10;

    // 🧾 TÍTULO
    pdf.setFontSize(14);
    pdf.text('PLANILLA DE VENTAS DE COMBUSTIBLE', 10, y);
    y += 8;

    // 📅 INFO GENERAL
    pdf.setFontSize(10);
    pdf.text(`Fecha: ${fecha}`, 10, y);
    y += 6;

   
    pdf.text(`HoraInicio: ${horaInicioFormateada}`, 10, y);
    y += 6;

 pdf.text(`HoraFin: ${hora}`, 10, y);
    y += 6;
    pdf.text(`Playero: ${nombrePlayero}`, 10, y);
    y += 10;

    // 🔄 DATOS POR MÁQUINA
    const maquinas = {
        1: { inicio: 1, fin: 6 },
        2: { inicio: 7, fin: 12 },
        3: { inicio: 13, fin: 13 } // GLP
    };

    let totalDinero = 0;

    for (let m = 1; m <= 3; m++) {
        const { inicio, fin } = maquinas[m];

        // 📊 ENCABEZADO TABLA
        pdf.setFontSize(10);
        pdf.text(`SURTIDOR ${m}`, 10, y);
        y += 6;
        pdf.text('NOMBRE', 10, y);
        pdf.text('INICIO', 70, y);
        pdf.text('CIERRE', 90, y);
        pdf.text('LITROS', 120, y);
        pdf.text('IMPORTE', 150, y);
        y += 5;
        pdf.line(10, y, 200, y);
        y += 5;

        for (let i = inicio; i <= fin; i++) {
            const d = estado.datos[i];
            if (!d) continue;

            const ini = parseFloat(d.ini) || 0;
            const cie = parseFloat(d.cie) || 0;
            let lts = 0;
            let imp = 0;

            if (cie > ini && ini > 0) {
                lts = cie - ini;
                imp = lts * precios[i];
                totalDinero += imp;
            }

            pdf.text(d.nombre, 10, y);
            pdf.text(ini ? String(ini) : '-', 70, y);
            pdf.text(cie ? String(cie) : '-', 90, y);
            pdf.text(lts ? lts.toFixed(2) : '-', 120, y);
            pdf.text(imp ? `$ ${imp.toLocaleString()}` : '-', 150, y);

            y += 6;

            if (y > 280) {
                pdf.addPage();
                y = 10;
            }
        }

        y += 10;
    }

    // 📦 TOTALES
    pdf.line(10, y, 200, y);
    y += 8;
    pdf.setFontSize(11);
    pdf.text(`TOTAL IMPORTE: $ ${totalDinero.toLocaleString()}`, 10, y);
    y += 8;

    // 💵 EFECTIVO ESPERADO
    const efectivoEsperado = totalDinero - qr - posterior + inicial;
    const diferencia = efectivoEsperado - contado;

    pdf.text(`CAJA INICIO: $${inicial.toLocaleString()}`, 10, y);
    y += 6;
    pdf.text(`VENTA VIRTUAL: $${qr.toLocaleString()}`, 10, y);
    y += 6;
    pdf.text(`COBRANZAS: $${posterior.toLocaleString()}`, 10, y);
    y += 6;
    pdf.text(`CAJA CIERRE: $${contado.toLocaleString()}`, 10, y);
    y += 6;
    pdf.text(`EFECTIVO ESPERADO: $${efectivoEsperado.toLocaleString()}`, 10, y);
    y += 6;

if(diferencia>0){
    pdf.text(`Falta: $${diferencia.toLocaleString()}`, 10, y);
}

if(diferencia<0){
    pdf.text(`Sobra: $${diferencia.toLocaleString()}`, 10, y);

}

if(diferencia==0){
    pdf.text(`CAJA EXACTA`, 10, y);

}
borrarhoraentrada()
borrarplayero()
    pdf.save('planilla_combustible.pdf');
}

function cargarEstado() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (!guardado) return;

    try {
        const estado = JSON.parse(guardado);

        if (estado.datos) {
            for (let i = 1; i <= 13; i++) {
                if (estado.datos[i]) {
                    datos[i].ini = estado.datos[i].ini;
                    datos[i].cie = estado.datos[i].cie;
                }
            }
        }

        if (estado.modo) modo = estado.modo;
        if (estado.expActual) expActual = estado.expActual;

    } catch (e) {
        console.error('Estado corrupto', e);
    }
}


function actualizarDato(id, campo, valor) {
    datos[id][campo] = valor === '' ? '' : parseFloat(valor);
    guardarEstado();  // 💾
    sumarTodo();

    // no llamar renderMangueras() directamente
    renderDebounce();
}
function calcularLitros(id) {
    const d = datos[id];
    return (d.cie > d.ini && d.ini > 0) ? (d.cie - d.ini).toFixed(2) : '0.00';
}

function calcularImporte(id) {
    const d = datos[id];
    return (d.cie > d.ini && d.ini > 0)
        ? ((d.cie - d.ini) * precios[id]).toLocaleString()
        : '0';
}

function setModo(m) {
        modo = m;
    guardarEstado();      // 💾
    document.getElementById('m-ini').classList.toggle('active', m === 'inicio');
    document.getElementById('m-cie').classList.toggle('active', m === 'cierre');
    renderMangueras();
    }

function cambiarExp(n) {
      expActual = n;
    guardarEstado();      // 💾
    document.getElementById('btn-exp1').classList.toggle('active', n === 1);
    document.getElementById('btn-exp2').classList.toggle('active', n === 2);
    document.getElementById('btn-exp3').classList.toggle('active', n === 3);

    renderMangueras();
}

function sumarTodo() {
    let totalDinero = 0;

    for (let i = 1; i <= 13; i++) {
        const ini = parseFloat(datos[i].ini) || 0;
        const cie = parseFloat(datos[i].cie) || 0;
        if (cie > ini) {
            const lts = cie - ini;
            totalDinero += lts * precios[i];
        }
    }

    document.getElementById('gran-total-dinero').innerText =
        '$ ' + totalDinero.toLocaleString();
}

document.getElementById('btn-exp1').onclick = () => cambiarExp(1);
document.getElementById('btn-exp2').onclick = () => cambiarExp(2);
document.getElementById('btn-exp3').onclick = () => cambiarExp(3);

function confirmarcambioturno(){
const seguro = confirm("Estas seguro que deseas continuar?");

if(seguro){
prepararNuevoTurno();
}

}


function prepararNuevoTurno() {
    // Copiar cierre a inicio para cada manguera
    for (let i = 1; i <= 13; i++) {
        const cierre = parseFloat(datos[i].cie) || 0;
        datos[i].ini = cierre;
        datos[i].cie = ''; // Reinicia cierre para el nuevo turno
    }

    // Guardar inmediatamente el nuevo estado antes de borrar localStorage
    guardarEstado();

    // Si querés borrar el localStorage para empezar fresco, descomentar:
    // localStorage.removeItem(STORAGE_KEY);

    // Renderizar la planilla con los cierres pasados como inicios
    renderMangueras();
    sumarTodo();
    
    alert('¡Nuevo turno preparado! Los cierres anteriores se copiaron como inicios.');
    window.location.reload()
}

let renderTimeout;

function renderDebounce() {
    // cancela cualquier render pendiente
    clearTimeout(renderTimeout);

    // programa un nuevo render después de 5 segundos
    renderTimeout = setTimeout(() => {
        renderMangueras();
    }, 5000);
}

function verificarCaja() {
    const totalVentas = parseFloat(document.getElementById('gran-total-dinero').innerText.replace(/\D/g, '')) || 0;
    const ventasQR = parseFloat(document.getElementById('ventas-qr').value) || 0;
    const pagoPosterior = parseFloat(document.getElementById('pago-posterior').value) || 0;
    const dineroInicial = parseFloat(document.getElementById('dinero-inicial').value) || 0;
    const dineroContado = parseFloat(document.getElementById('dinero-contado').value) || 0;

    const efectivoEsperado = totalVentas - ventasQR - pagoPosterior + dineroInicial;
    const diferencia = dineroContado - efectivoEsperado;

    const resultadoDiv = document.getElementById('resultado-caja');
    if (diferencia === 0) {
        resultadoDiv.innerHTML = `<span style="color:green">¡Caja correcta! Todo coincide.</span>`;
    } else {
        resultadoDiv.innerHTML = `<span style="color:red">Diferencia: $${diferencia.toFixed(2)}. Revisar caja.</span>`;
    }
}

cargarEstado();
renderMangueras();
sumarTodo();
 actualizarHeaderTurno()
