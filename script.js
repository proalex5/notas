function navegar(paso, valor) {
    if(paso === 'tipo') {
        localStorage.setItem('estudio_tipo', valor); // Guardamos si es uni o fp
        prepararPantallaCursos(valor);
        cambiarVista('step-anyo');
    }
}

function cambiarVista(idVista) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(idVista).classList.add('active');
}

function prepararPantallaCursos(tipo) {
    const container = document.getElementById('container-anyos');
    const label = document.getElementById('label-tipo-display');
    container.innerHTML = '';
    label.innerText = tipo === 'universidad' ? 'Grado Universitario' : 'FP';
    
    const nombres = tipo === 'universidad' ? ["Primero", "Segundo", "Tercero", "Cuarto"] : ["Primero", "Segundo"];

    nombres.forEach(nombre => {
        let btn = document.createElement('button');
        btn.className = 'btn-gradiente';
        btn.innerText = nombre;
        btn.onclick = () => {
            localStorage.setItem('estudio_anyo', nombre);
            const titulo = tipo === 'universidad' ? 'Universidad' : 'FP';
            document.getElementById('label-anyo-display').innerText = `Calificaciones ${titulo} ${nombre}`;
            switchTab('historial');
            cambiarVista('step-dashboard');
        };
        container.appendChild(btn);
    });
}

function switchTab(tab) {
    const hist = document.getElementById('content-historial');
    const añad = document.getElementById('content-añadir');
    const btnH = document.getElementById('tab-h');
    const btnA = document.getElementById('tab-a');

    if(tab === 'historial') {
        hist.style.display = 'block';
        añad.style.display = 'none';
        btnH.classList.add('active');
        btnA.classList.remove('active');
        renderHistorial();
    } else {
        hist.style.display = 'none';
        añad.style.display = 'block';
        btnH.classList.remove('active');
        btnA.classList.add('active');
        cargarComboAsignaturas();
    }
}

function abrirModalAsignatura() {
    const nombre = prompt("Nombre de la nueva asignatura:");
    if (nombre) {
        let asignaturas = JSON.parse(localStorage.getItem('mis_asignaturas') || "[]");
        // FILTRO CLAVE: Guardamos el tipo y el año
        asignaturas.push({ 
            id: Date.now(), 
            nombre: nombre, 
            anyo: localStorage.getItem('estudio_anyo'),
            tipo: localStorage.getItem('estudio_tipo') 
        });
        localStorage.setItem('mis_asignaturas', JSON.stringify(asignaturas));
        renderHistorial();
    }
}

function renderHistorial() {
    const lista = document.getElementById('lista-asignaturas');
    const anyoActual = localStorage.getItem('estudio_anyo');
    const tipoActual = localStorage.getItem('estudio_tipo');
    
    // Filtramos para que SOLO salgan las de este año Y este tipo (Uni o FP)
    const asignaturas = JSON.parse(localStorage.getItem('mis_asignaturas') || "[]")
                        .filter(a => a.anyo === anyoActual && a.tipo === tipoActual);
                        
    const todasLasNotas = JSON.parse(localStorage.getItem('mis_notas') || "[]");
    
    lista.innerHTML = '';
    asignaturas.forEach(asig => {
        const notasAsignatura = todasLasNotas.filter(n => n.idAsignatura == asig.id);
        
        let notasHTML = `
            <div class="notas-grid">
                <div><span class="label-historial">Fecha</span></div>
                <div><span class="label-historial">Nota</span></div>
                ${notasAsignatura.map(n => `
                    <div class="dato-historial">${formatearFecha(n.fecha)}</div>
                    <div class="dato-historial">${n.valor}</div>
                `).join('')}
            </div>
        `;

        lista.innerHTML += `
            <div class="asignatura-contenedor">
                <button class="btn-asignatura" onclick="toggleNotas(${asig.id})">
                    ${asig.nombre} <span id="flecha-${asig.id}">▼</span>
                </button>
                <div id="notas-${asig.id}" class="notas-desplegable" style="display:none">
                    ${notasAsignatura.length > 0 ? notasHTML : '<p style="opacity:0.5; padding:10px; text-align:center;">No hay notas</p>'}
                </div>
            </div>
        `;
    });
}

function toggleNotas(id) {
    const panel = document.getElementById(`notas-${id}`);
    const flecha = document.getElementById(`flecha-${id}`);
    const isHidden = panel.style.display === "none";
    panel.style.display = isHidden ? "block" : "none";
    flecha.innerText = isHidden ? "▲" : "▼";
}

function cargarComboAsignaturas() {
    const select = document.getElementById('select-asignatura');
    const anyoActual = localStorage.getItem('estudio_anyo');
    const tipoActual = localStorage.getItem('estudio_tipo');
    
    const data = JSON.parse(localStorage.getItem('mis_asignaturas') || "[]")
                 .filter(a => a.anyo === anyoActual && a.tipo === tipoActual);
                 
    select.innerHTML = data.map(asig => `<option value="${asig.id}">${asig.nombre}</option>`).join('');
}

function guardarNota() {
    const idAsig = document.getElementById('select-asignatura').value;
    const fecha = document.getElementById('input-fecha').value;
    const valor = document.getElementById('input-nota').value;

    if (!idAsig || !fecha || !valor) return alert("Rellena todos los campos");

    let notas = JSON.parse(localStorage.getItem('mis_notas') || "[]");
    notas.push({ idAsignatura: idAsig, fecha, valor });
    localStorage.setItem('mis_notas', JSON.stringify(notas));
    
    switchTab('historial');
}

function formatearFecha(fechaStr) {
    if(!fechaStr) return "";
    const partes = fechaStr.split("-");
    return `${partes[2]}/${partes[1]}/${partes[0].substr(-2)}`;
}

function volver() {
    const currentView = document.querySelector('.view.active').id; 
    
    if(currentView === 'step-anyo') {
        cambiarVista('step-tipo');
    }
    else if(currentView === 'step-dashboard') {
        // Antes de volver, podemos refrescar la pantalla de cursos 
        // por si el tipo de estudio cambió.
        const tipoActual = localStorage.getItem('estudio_tipo');
        prepararPantallaCursos(tipoActual);
        cambiarVista('step-anyo');
    }  
}