// Tu configuración Firebase aquí (reemplaza con la tuya)
const firebaseConfig = {
  apiKey: "AIzaSyDheCHQE6mK1-ztpy9fZELiMeoroBfirz0",
  authDomain: "proyectomascotas-80047.firebaseapp.com",
  databaseURL: "https://proyectomascotas-80047-default-rtdb.firebaseio.com",
  projectId: "proyectomascotas-80047",
  storageBucket: "proyectomascotas-80047.firebasestorage.app",
  messagingSenderId: "778175912806",
  appId: "1:778175912806:web:612725c488d67861efc6a7",
  measurementId: "G-WCNJV3QLL1"
};

// ⚡️ Filtro corregido - Asegúrate que el botón de playas tiene data-filter="playasCaninas"
const filterMap = {
  todos: "todos",
  areasCaninas: "AreasCaninas",
  guarderias: "GuarderiasMascotas",
  veterinarias: "Veterinarios",
  tiendas: "TiendasMascotas",
  playasCaninas: "PlayasCaninas"  // <-- nodo y filtro deben coincidir exactamente
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// ====================================================================================================
// REFERENCIAS Y UTILIDADES DEL DOM
// ====================================================================================================
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const messageDiv = document.getElementById("message");
var formulario_login = document.querySelector(".formulario__login");
var formulario_register = document.querySelector(".formulario__register");
var contenedor_login_register = document.querySelector(".contenedor__login-register");
var caja_trasera_login = document.querySelector(".caja__trasera-login");
var caja_trasera_register = document.querySelector(".caja__trasera-register");

const guardadosContent = document.getElementById('guardados-content');
const explorarContent = document.getElementById('explorar-content');
const mascotasContent = document.getElementById('mascotas-content');
const citasContent = document.getElementById('citas-content');
const perfilContent = document.getElementById('perfil-content');
const filterButtons = document.querySelectorAll('.filter-btn');

/**
 * Muestra un mensaje en el área de notificaciones.
 */
function showMessage(msg, isSuccess = false) {
  messageDiv.style.color = isSuccess ? "green" : "red";
  messageDiv.textContent = msg;
  setTimeout(() => {
    messageDiv.textContent = "";
  }, 4000);
}

// ====================================================================================================
// LOGIN/REGISTER/RESIZE
// ====================================================================================================

document.getElementById("btn__iniciar-sesion").addEventListener("click", iniciarSesion);
document.getElementById("btn__registrarse").addEventListener("click", register);
window.addEventListener("resize", anchoPage);

function anchoPage(){
  if (window.innerWidth > 850){
    caja_trasera_register.style.display = "block";
    caja_trasera_login.style.display = "block";
  }else{
    caja_trasera_register.style.display = "block";
    caja_trasera_register.style.opacity = "1";
    caja_trasera_login.style.display = "none";
    formulario_login.style.display = "block";
    contenedor_login_register.style.left = "0px";
    formulario_register.style.display = "none";
  }
}
anchoPage();

function iniciarSesion(){
  if (window.innerWidth > 850){
    formulario_login.style.display = "block";
    contenedor_login_register.style.left = "10px";
    formulario_register.style.display = "none";
    caja_trasera_register.style.opacity = "1";
    caja_trasera_login.style.opacity = "0";
  }else{
    formulario_login.style.display = "block";
    contenedor_login_register.style.left = "0px";
    formulario_register.style.display = "none";
    caja_trasera_register.style.display = "block";
    caja_trasera_login.style.display = "none";
  }
}
function register(){
  if (window.innerWidth > 850){
    formulario_register.style.display = "block";
    contenedor_login_register.style.left = "410px";
    formulario_login.style.display = "none";
    caja_trasera_register.style.opacity = "0";
    caja_trasera_login.style.opacity = "1";
  }else{
    formulario_register.style.display = "block";
    contenedor_login_register.style.left = "0px";
    formulario_login.style.display = "none";
    caja_trasera_register.style.display = "none";
    caja_trasera_login.style.display = "block";
    caja_trasera_login.style.opacity = "1";
  }
}

// ====================================================================================================
// AUTENTICACIÓN Y CARGA INICIAL
// ====================================================================================================

document.getElementById("formulario__register").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const passwordRepeat = document.getElementById("register-password-repeat").value;
  const keepSession = document.getElementById("register-keep-session").checked;
  if (password !== passwordRepeat) {
    showMessage("Las contraseñas no coinciden.");
    return;
  }
  const persistence = keepSession ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
  auth.setPersistence(persistence).then(() => {
    return auth.createUserWithEmailAndPassword(email, password);
  }).then(userCredential => {
    const user = userCredential.user;

    // Guardar datos básicos
    return db.ref('Usuarios/' + user.uid).set({
      Nombre: name,
      Email: email,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
    }).then(() => {
      // MOSTRAR FORMULARIO EXTRA EN VEZ DE ENTRAR A LA APP
      document.getElementById("formulario__register").reset();
      document.getElementById("register-keep-session").checked = true;
      mostrarFormularioDatosAdicionales(user.uid); // <-- nueva función
    });
  }).catch(error => {
    showMessage(error.message);
  });
});

function mostrarFormularioDatosAdicionales(uid) {
  const extraContainer = document.getElementById("extra-data-container");
  authContainer.style.display = "none";
  appContainer.style.display = "none";
  extraContainer.style.display = "flex";      // flex para centrar
  extraContainer.style.minHeight = "100vh";
  extraContainer.style.alignItems = "center";
  extraContainer.style.justifyContent = "center";
  extraContainer.style.padding = "20px";

  db.ref('Usuarios/' + uid).once('value').then(snapshot => {
    const userData = snapshot.val() || {};

    extraContainer.innerHTML = `
      <div class="card" style="margin:0 auto;">
        <div style="color: #FF7753;">
          <h3 style="text-align:center;margin-bottom:18px;">Completa tus datos</h3>

          <p><strong>Nombre:</strong>
            <span style="color:#FDF6EC;">${userData.Nombre || ''}</span>
          </p>

          <p style="margin-top:10px;"><strong>Apellido:</strong></p>
          <input type="text" id="extra-apellido" placeholder="Apellido" required
                 style="width:100%;margin-top:6px;padding:8px;border-radius:6px;border:2px solid var(--textview-borde);background:var(--textview-bg);color:var(--textview-text);">
          <small id="msg-apellido" style="color:#FF0000;display:none;">El apellido es obligatorio.</small>

          <p style="margin-top:14px;"><strong>Email:</strong>
            <span style="color:#FDF6EC;">${userData.Email || ''}</span>
          </p>

          <p style="margin-top:10px;"><strong>Teléfono:</strong></p>
          <input type="tel" id="extra-telefono" placeholder="Teléfono" required
                 style="width:100%;margin-top:6px;padding:8px;border-radius:6px;border:2px solid var(--textview-borde);background:var(--textview-bg);color:var(--textview-text);">
          <small id="msg-telefono" style="color:#FF0000;display:none;">El teléfono es obligatorio.</small>

          <p style="margin-top:14px;"><strong>Usuario:</strong></p>
          <input type="text" id="extra-usuario" placeholder="Nombre de usuario" required
                 style="width:100%;margin-top:6px;padding:8px;border-radius:6px;border:2px solid var(--textview-borde);background:var(--textview-bg);color:var(--textview-text);">
          <small id="msg-usuario" style="color:#FF0000;display:none;">El nombre de usuario es obligatorio.</small>

          <button type="button" id="extra-submit-btn"
            style="
              padding:10px 40px;
              margin-top:25px;
              border:2px solid #FF7753;   /* melocotón */
              font-size:14px;
              background:#2F2E41;        /* navy */
              color:#FF7753;             /* melocotón */
              font-weight:600;
              cursor:pointer;
              outline:none;
              border-radius:8px;
              width:100%;
              transition:all 0.2s;
            ">
            Guardar y continuar
          </button>
        </div>
      </div>
    `;

    const submitBtn = document.getElementById("extra-submit-btn");

    submitBtn.addEventListener("mouseout", () => {
      submitBtn.style.background = "#2F2E41";
      submitBtn.style.color = "#FF7753";
      submitBtn.style.borderColor = "#FF7753";
    });

    submitBtn.addEventListener("mouseover", () => {
      submitBtn.style.background = "#ADFF2F";  // lima
      submitBtn.style.color = "#2F2E41";      // navy
      submitBtn.style.borderColor = "#ADFF2F";
    });

    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const apellido = document.getElementById("extra-apellido").value.trim();
      const nombreUsuario = document.getElementById("extra-usuario").value.trim();
      const telefono = document.getElementById("extra-telefono").value.trim();

      const msgApellido = document.getElementById("msg-apellido");
      const msgTelefono = document.getElementById("msg-telefono");
      const msgUsuario  = document.getElementById("msg-usuario");

      // reset mensajes
      msgApellido.style.display = "none";
      msgTelefono.style.display = "none";
      msgUsuario.style.display  = "none";

      let valido = true;
      if (!apellido) {
        msgApellido.style.display = "block";
        valido = false;
      }
      if (!telefono) {
        msgTelefono.style.display = "block";
        valido = false;
      }
      if (!nombreUsuario) {
        msgUsuario.style.display = "block";
        valido = false;
      }

      if (!valido) {
        showMessage("Por favor, revisa los campos marcados.");
        return;
      }

      db.ref('Usuarios/' + uid).update({
        Apellido: apellido,
        NombreUsuario: nombreUsuario,
        Telefono: telefono
      }).then(() => {
        extraContainer.style.display = "none";
        authContainer.style.display = "none";
        appContainer.style.display = "block";

        const activeSectionBtn = document.querySelector('.menu-btn.active');
        const activeSectionId = activeSectionBtn ? activeSectionBtn.dataset.section : 'guardados';
        loadSectionContent(activeSectionId);
      }).catch(error => {
        showMessage(error.message);
      });
    });
  }).catch(error => {
    showMessage(error.message);
  });
}





document.getElementById("formulario__login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const keepSession = document.getElementById("login-keep-session").checked;
  const persistence = keepSession ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
  auth.setPersistence(persistence).then(() => {
    return auth.signInWithEmailAndPassword(email, password);
  }).then(userCredential => {
    showMessage(`Bienvenido, ${userCredential.user.email}`, true);
    document.getElementById("formulario__login").reset();
    document.getElementById("login-keep-session").checked = true;
  }).catch(error => {
    showMessage(error.message);
  });
});

// CARGA SECCIÓN SEGÚN MENÚ PRINCIPAL
auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    const activeSectionBtn = document.querySelector('.menu-btn.active');
    const activeSectionId = activeSectionBtn ? activeSectionBtn.dataset.section : 'guardados';
    loadSectionContent(activeSectionId); 
  } else {
    authContainer.style.display = "block";
    appContainer.style.display = "none";
  }
});

function cerrarSesion() {
  auth.signOut();
}

// Listener para el menú: Mueve la vista y llama a la carga de contenido
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(secc => secc.classList.remove("visible"));
    this.classList.add("active");
    const sectionId = this.dataset.section;
    document.getElementById(sectionId).classList.add("visible");
    loadSectionContent(sectionId);
  });
});

// Listener para los botones de filtro de Explorar
filterButtons.forEach(button => {
  button.addEventListener('click', function() {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    const filter = this.getAttribute('data-filter');
    loadSectionContent('explorar', filter);
  });
});

/**
 * Función central para cargar el contenido de la sección activa.
 */
function loadSectionContent(sectionId, filter = 'todos') {
  switch (sectionId) {
    case 'guardados':
      loadGuardados();
      break;
    case 'explorar':
      loadExplorar(filter);
      break;
    case 'mascotas':
      loadMascotas();
      break;
    case 'citas':
      loadCitas();
      break;
    case 'perfil':
      loadUserProfile();
      break;
  }
}

// ===================================
//   PERFIL, GUARDADOS, MASCOTAS, CITAS
// ===================================
function loadUserProfile() {
  const user = auth.currentUser;
  if (!user) {
    perfilContent.innerHTML = "<p>Debes iniciar sesión.</p>";
    return;
  }
  perfilContent.innerHTML = '';
  const profilePhotoContainer = document.createElement('div');
  profilePhotoContainer.className = 'profile-photo-container';
  const profilePhotoImg = document.createElement('img');
  profilePhotoImg.className = 'profile-photo';
  profilePhotoImg.alt = 'Foto de perfil';
  const photoInput = document.createElement('input');
  photoInput.type = 'file';
  photoInput.id = 'photo-input';
  photoInput.accept = 'image/*';
  const changePhotoBtn = document.createElement('button');
  changePhotoBtn.className = 'change-photo-btn';
  changePhotoBtn.innerHTML = '&#9998 Seleccionar foto';
  const infoCard = document.createElement('div');
  infoCard.className = 'card';
  const logoutButton = document.createElement('button');
  logoutButton.textContent = 'Cerrar Sesión';
  logoutButton.onclick = cerrarSesion;
  profilePhotoContainer.appendChild(profilePhotoImg);
  profilePhotoContainer.appendChild(photoInput);
  profilePhotoContainer.appendChild(changePhotoBtn);
  perfilContent.appendChild(profilePhotoContainer);
  perfilContent.appendChild(infoCard);
  perfilContent.appendChild(logoutButton);


  db.ref('Usuarios/' + user.uid).once('value').then(snapshot => {
    let userData = snapshot.val() || {};
    const defaultPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
    profilePhotoImg.src = userData.photoURL || defaultPhoto;


   infoCard.innerHTML = `
  <div style="color: #FF7753;">
    <h3>Datos de Usuario</h3>
    <p><strong>Nombre:</strong> <span style="color: #FDF6EC;">${userData.Nombre || 'No especificado'}</span></p>
    <p><strong>Apellido:</strong> <span style="color: #FDF6EC;">${userData.Apellido || 'No especificado'}</span></p>
    <p><strong>Email:</strong> <span style="color: #FDF6EC;">${userData.Email || user.email}</span></p>
    <p><strong>Teléfono:</strong> <span style="color: #FDF6EC;">${userData.Telefono || 'No especificado'}</span></p>
    <p><strong>Usuario:</strong> <span style="color: #FDF6EC;">${userData.NombreUsuario || 'No especificado'}</span></p>
  </div>
`;


    changePhotoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', (e) => uploadProfilePhoto(e.target.files[0], user, profilePhotoImg));
  }).catch(error => {
    profilePhotoImg.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`;
    infoCard.innerHTML = `<p><strong>Email:</strong> ${user.email}</p><p>Error cargando datos adicionales.</p>`;
  });
}


// ===================================
//   CARGAR SUBIR PERFIL
// ===================================

function uploadProfilePhoto(file, user, imgElement) {
  if (!file) {
    showMessage('No se seleccionó ningún archivo.');
    return;
  }
  const storageRef = storage.ref(`profile_photos/${user.uid}/${file.name}`);
  const uploadTask = storageRef.put(file);
  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      showMessage(`Subiendo foto: ${Math.round(progress)}%`, true);
    }, 
    (error) => {
      showMessage(`Error al subir la foto: ${error.message}`);
    }, 
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        db.ref('Usuarios/' + user.uid).update({
          photoURL: downloadURL
        }).then(() => {
          imgElement.src = downloadURL;
          showMessage('Foto de perfil actualizada con éxito.', true);
        });
      }).catch((error) => {
        showMessage('Error al obtener la URL o actualizar la DB: ' + error.message);
      });
    }
  );
}

// ===================================
//   CARGAR GUARDADOS
// ===================================


function loadGuardados() {
  const user = auth.currentUser;
  if (!user) {
    guardadosContent.innerHTML = "<p>Debes iniciar sesión para ver tus guardados.</p>";
    return;
  }
  guardadosContent.innerHTML = '<h3 style="color:#2F2E41;">Cargando elementos guardados...</h3>';
  db.ref('Usuarios/' + user.uid + '/Guardados').once('value').then(snapshot => {
    let html = '';
    if (!snapshot.exists()) {
      guardadosContent.innerHTML = "<p style='color:#2F2E41;'>No tienes elementos guardados.</p>";
      return;
    }
    snapshot.forEach(childSnapshot => {
      const data = childSnapshot.val();
      const nombre = childSnapshot.key;
      const fotoUrl = data.foto || data.fotoUrl || 'https://cdn-icons-png.flaticon.com/512/484/484167.png';
      
      html += `
        <div class="guardado-card" style="background: #2F2E41; border-radius: 16px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div class="guardado-main" style="display: flex; align-items: center; padding: 20px; gap: 16px; cursor: pointer;">
            <div style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid #FF7753; display: flex; align-items: center; justify-content: center; background: #2F2E41;">
              <img src="${fotoUrl}" alt="Foto de ${nombre}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 50%;">
            </div>
            <h3 style="margin: 0; color: #FF7753; font-size: 1.3em;">${nombre}</h3>
            <span class="flecha-guardado" style="margin-left: auto; color: #FF7753; font-size: 1.8em;">&#x25B2;</span>
          </div>
          <div class="guardado-card-details" style="max-height: 0; overflow: hidden; background: #2F2E41; color: #FDF6EC; padding: 0 20px; transition: max-height 0.4s, padding 0.3s;">
            <div style="padding: 10px 0 20px 0;">
              ${data.Categoria ? `<p><strong style="color:#FF7753;">Categoría:</strong> <span style="color:#FDF6EC;">${data.Categoria}</span></p>` : ''}
              ${data.Direccion ? `<p><strong style="color:#FF7753;">Dirección:</strong> <span style="color:#FDF6EC;">${data.Direccion}</span></p>` : ''}
              ${data.Horario ? `<p><strong style="color:#FF7753;">Horario:</strong> <span style="color:#FDF6EC;">${data.Horario}</span></p>` : ''}
              ${data.Telefono ? `<p><strong style="color:#FF7753;">Teléfono:</strong> <span style="color:#FDF6EC;">${data.Telefono}</span></p>` : ''}
              
              <!-- Botón eliminar de guardados -->
              <div style="margin-top: 15px; text-align: center;">
                <button class="btn-eliminar-guardado" data-guardado-id="${nombre}" style="
                  background: #2F2E41;
                  border: 2px solid #FF0000;
                  border-radius: 8px;
                  color: #FF0000;
                  padding: 10px 25px;
                  font-size: 0.9em;
                  cursor: pointer;
                  transition: all 0.3s;
                ">🗑️ Quitar de Guardados</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    guardadosContent.innerHTML = html;
    activateGuardadoCardListeners();

  }).catch(error => {
    guardadosContent.innerHTML = "<p style='color:#2F2E41;'>Error: " + error.message + "</p>";
  });
}

function activateGuardadoCardListeners() {
  document.querySelectorAll('.guardado-card').forEach(card => {
    const header = card.querySelector('.guardado-main');
    const details = card.querySelector('.guardado-card-details');
    const flecha = card.querySelector('.flecha-guardado');
    
    header.onclick = function() {
      card.classList.toggle('expanded');
      
      if (card.classList.contains('expanded')) {
        details.style.maxHeight = '400px';
        details.style.padding = '10px 20px 20px 20px';
        flecha.innerHTML = '&#x25BC;';
      } else {
        details.style.maxHeight = '0';
        details.style.padding = '0 20px';
        flecha.innerHTML = '&#x25B2;';
      }
    };
    
    details.onclick = function(e) {
      e.stopPropagation();
    };
  });
  
  // Botones eliminar guardado
  document.querySelectorAll('.btn-eliminar-guardado').forEach(btn => {
    btn.onmousedown = function() {
      this.style.background = '#FF0000';
      this.style.color = '#FFFFFF';
      this.style.borderColor = '#FFFFFF';
    };
    btn.onmouseup = function() {
      this.style.background = '#2F2E41';
      this.style.color = '#FF0000';
      this.style.borderColor = '#FF0000';
    };
    btn.onmouseleave = function() {
      this.style.background = '#2F2E41';
      this.style.color = '#FF0000';
      this.style.borderColor = '#FF0000';
    };
    
    btn.onclick = function(e) {
      e.stopPropagation();
      const guardadoId = this.getAttribute('data-guardado-id');
      
      if (confirm('¿Quieres quitar "' + guardadoId + '" de tus guardados?')) {
        eliminarGuardado(guardadoId);
      }
    };
  });
}

function eliminarGuardado(guardadoId) {
  const user = auth.currentUser;
  if (!user) {
    alert('Debes iniciar sesión.');
    return;
  }
  
  const btn = document.querySelector('[data-guardado-id="' + guardadoId + '"]');
  if (btn) {
    btn.innerHTML = '⏳ Eliminando...';
    btn.disabled = true;
  }
  
  db.ref('Usuarios/' + user.uid + '/Guardados/' + guardadoId).remove()
    .then(() => {
      alert('✅ Eliminado de guardados correctamente.');
      loadGuardados();
    })
    .catch(error => {
      alert('❌ Error al eliminar: ' + error.message);
      if (btn) {
        btn.innerHTML = '🗑️ Quitar de Guardados';
        btn.disabled = false;
      }
    });
}


// =================================================================
//   CARGAR MASCOTAS + BOTÓN Y FORMULARIO AÑADIR MASCOTA
// =================================================================


// Añade este HTML para el botón y el modal (puedes agregarlo a tu contenedor de mascotas)
function loadMascotas() {
  const user = auth.currentUser;
  if (!user) {
    mascotasContent.innerHTML = "<p>Debes iniciar sesión para ver tus mascotas.</p>";
    return;
  }
  
  // Botón añadir mascota + contenedor de mascotas
  let html = `
    <div style="display: flex; justify-content: center; margin-bottom: 20px;">
      <button id="btnAnadirMascota" style="
        background: #2F2E41;
        border: 2px solid #ADFF2F;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ADFF2F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
    <div id="listaMascotas"></div>
  `;

  // Modal para añadir mascota
  html += `
    <div id="modalMascota" style="
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      justify-content: center;
      align-items: center;
    ">
      <div style="
        background: #2F2E41;
        border-radius: 20px;
        padding: 30px;
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <h2 style="color: #FF7753; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #FF7753; padding-bottom: 10px;">Añadir Mascota</h2>
        
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <label for="inputFotoMascota" style="
            width: 80px;
            height: 80px;
            border: 2px solid #FF7753;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
          ">
            <img id="previewFoto" src="" style="display: none; width: 100%; height: 100%; object-fit: cover;">
            <svg id="iconoFoto" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF7753" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </label>
          <input type="file" id="inputFotoMascota" accept="image/*" style="display: none;">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="color: #FF7753; font-size: 0.9em;">NOMBRE :</label>
          <input type="text" id="inputNombre" placeholder="Nombre" style="
            width: 100%;
            padding: 12px;
            margin-top: 5px;
            background: #3D3C4D;
            border: none;
            border-radius: 8px;
            color: #FDF6EC;
            font-size: 1em;
          ">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="color: #FF7753; font-size: 0.9em;">RAZA :</label>
          <input type="text" id="inputRaza" placeholder="Raza" style="
            width: 100%;
            padding: 12px;
            margin-top: 5px;
            background: #3D3C4D;
            border: none;
            border-radius: 8px;
            color: #FDF6EC;
            font-size: 1em;
          ">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="color: #FF7753; font-size: 0.9em;">EDAD :</label>
          <input type="text" id="inputEdad" placeholder="Edad" style="
            width: 100%;
            padding: 12px;
            margin-top: 5px;
            background: #3D3C4D;
            border: none;
            border-radius: 8px;
            color: #FDF6EC;
            font-size: 1em;
          ">
        </div>

        <div style="margin-bottom: 15px;">
          <label style="color: #FF7753; font-size: 0.9em;">TAMAÑO :</label>
          <input type="text" id="inputTamano" placeholder="Tamaño" style="
            width: 100%;
            padding: 12px;
            margin-top: 5px;
            background: #3D3C4D;
            border: none;
            border-radius: 8px;
            color: #FDF6EC;
            font-size: 1em;
          ">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="color: #FF7753; font-size: 0.9em;">MICROCHIP :</label>
          <input type="text" id="inputMicrochip" placeholder="Microchip" style="
            width: 100%;
            padding: 12px;
            margin-top: 5px;
            background: #3D3C4D;
            border: none;
            border-radius: 8px;
            color: #FDF6EC;
            font-size: 1em;
          ">
        </div>

      <div style="display: flex; gap: 10px;">
  <button id="btnCancelar" style="
    flex: 1;
    padding: 12px;
    background: #2F2E41;
    border: 2px solid #FF0000;
    border-radius: 8px;
    color: #FF0000;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s;
  " onmousedown="this.style.background='#FF0000'; this.style.color='#FFFFFF'; this.style.borderColor='#FFFFFF';"
     onmouseup="this.style.background='#2F2E41'; this.style.color='#FF0000'; this.style.borderColor='#FF0000';"
     onmouseleave="this.style.background='#2F2E41'; this.style.color='#FF0000'; this.style.borderColor='#FF0000';">
    Cancelar
  </button>
  
  <button id="btnGuardar" style="
    flex: 1;
    padding: 12px;
    background: #2F2E41;
    border: 2px solid #ADFF2F;
    border-radius: 8px;
    color: #ADFF2F;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s;
  " onmousedown="this.style.background='#ADFF2F'; this.style.color='#2F2E41'; this.style.borderColor='#2F2E41';"
     onmouseup="this.style.background='#2F2E41'; this.style.color='#ADFF2F'; this.style.borderColor='#ADFF2F';"
     onmouseleave="this.style.background='#2F2E41'; this.style.color='#ADFF2F'; this.style.borderColor='#ADFF2F';">
    Guardar
  </button>
</div>

      </div>
    </div>
  `;

  mascotasContent.innerHTML = html;

  // Cargar lista de mascotas
  cargarListaMascotas(user.uid);

  // Eventos
  document.getElementById('btnAnadirMascota').onclick = () => {
    document.getElementById('modalMascota').style.display = 'flex';
  };

  document.getElementById('btnCancelar').onclick = () => {
    document.getElementById('modalMascota').style.display = 'none';
    limpiarFormulario();
  };

  // Preview de foto
  document.getElementById('inputFotoMascota').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('previewFoto').src = ev.target.result;
        document.getElementById('previewFoto').style.display = 'block';
        document.getElementById('iconoFoto').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar mascota
  document.getElementById('btnGuardar').onclick = () => {
    guardarMascota(user.uid);
  };
}

// =================================================================
//   CARGAR LISTA MASCOTAS 
// =================================================================

function cargarListaMascotas(uid) {
  const listaMascotas = document.getElementById('listaMascotas');
  listaMascotas.innerHTML = '<p style="color:#FDF6EC; text-align:center;">Cargando mascotas...</p>';

  db.ref('Usuarios/' + uid + '/mascotas').once('value').then(snapshot => {
    let html = '';
    if (!snapshot.exists()) {
      listaMascotas.innerHTML = "<p style='color:#FDF6EC; text-align:center;'>No tienes mascotas registradas.</p>";
      return;
    }
    snapshot.forEach(childSnapshot => {
      const data = childSnapshot.val();
      const fotoUrl = data.fotoUrl || 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
      html += `
        <div class="pet-card" style="background: #2F2E41; border-radius: 16px; margin-bottom: 16px; cursor: pointer; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div class="pet-main" style="display: flex; align-items: center; padding: 20px; gap:16px;">
            <div style="width:60px; height:60px; border-radius:50%; border:3px solid #FF7753; display:flex; align-items:center; justify-content:center; background:#2F2E41;">
              <img src="${fotoUrl}" alt="Foto de ${data.nombre || 'mascota'}" style="width:54px; height:54px; object-fit:cover; border-radius:50%;">
            </div>
            <h3 style="margin:0; color:#FF7753; font-size:1.3em;">${data.nombre || 'Sin nombre'}</h3>
            <span class="flecha" style="margin-left:auto; color: #FF7753; font-size:1.8em; transition:transform 0.3s;">&#x25B2;</span>
          </div>
          <div class="pet-card-details" style="max-height:0; overflow:hidden; background:#2F2E41; color:#FDF6EC; padding:0 20px; transition:max-height 0.4s, padding 0.3s;">
            <div style="padding: 10px 0;">
              ${data.raza ? `<p><strong style="color:#FF7753;">Raza:</strong> <span style="color:#FDF6EC;">${data.raza}</span></p>` : ''}
              ${data.edad ? `<p><strong style="color:#FF7753;">Edad:</strong> <span style="color:#FDF6EC;">${data.edad}</span></p>` : ''}
              ${data.tamano ? `<p><strong style="color:#FF7753;">Tamaño:</strong> <span style="color:#FDF6EC;">${data.tamano}</span></p>` : ''}
              ${data.microchip ? `<p><strong style="color:#FF7753;">Microchip:</strong> <span style="color:#FDF6EC;">${data.microchip}</span></p>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    listaMascotas.innerHTML = html;

    // Expansión de tarjetas
    document.querySelectorAll('.pet-card').forEach(card => {
      card.onclick = function() {
        this.classList.toggle('expanded');
        const details = this.querySelector('.pet-card-details');
        const flecha = this.querySelector('.flecha');
        if(this.classList.contains('expanded')){
          details.style.maxHeight = '300px';
          details.style.padding = '10px 20px 20px 20px';
          flecha.innerHTML = '&#x25BC;';
        } else {
          details.style.maxHeight = '0';
          details.style.padding = '0 20px';
          flecha.innerHTML = '&#x25B2;';
        }
      };
    });
  });
}

// =================================================================
//   GUARDAR MASCOTAS
// =================================================================

function guardarMascota(uid) {
  const nombre = document.getElementById('inputNombre').value.trim();
  const raza = document.getElementById('inputRaza').value.trim();
  const edad = document.getElementById('inputEdad').value.trim();
  const tamano = document.getElementById('inputTamano').value.trim();
  const microchip = document.getElementById('inputMicrochip').value.trim();
  const inputFoto = document.getElementById('inputFotoMascota');

  if (!nombre) {
    alert('Por favor, introduce el nombre de la mascota.');
    return;
  }

  const nuevaMascotaRef = db.ref('Usuarios/' + uid + '/mascotas').push();

  if (inputFoto.files[0]) {
    // Subir imagen a Firebase Storage
    const file = inputFoto.files[0];
    const storageRef = storage.ref('mascotas/' + uid + '/' + nuevaMascotaRef.key + '.jpg');
    storageRef.put(file).then(snapshot => {
      return snapshot.ref.getDownloadURL();
    }).then(fotoUrl => {
      return nuevaMascotaRef.set({
        nombre: nombre,
        raza: raza,
        edad: edad,
        tamano: tamano,
        microchip: microchip,
        fotoUrl: fotoUrl
      });
    }).then(() => {
      document.getElementById('modalMascota').style.display = 'none';
      limpiarFormulario();
      cargarListaMascotas(uid);
    }).catch(error => {
      alert('Error al guardar: ' + error.message);
    });
  } else {
    // Sin foto
    nuevaMascotaRef.set({
      nombre: nombre,
      raza: raza,
      edad: edad,
      tamano: tamano,
      microchip: microchip,
      fotoUrl: ''
    }).then(() => {
      document.getElementById('modalMascota').style.display = 'none';
      limpiarFormulario();
      cargarListaMascotas(uid);
    }).catch(error => {
      alert('Error al guardar: ' + error.message);
    });
  }
}

function limpiarFormulario() {
  document.getElementById('inputNombre').value = '';
  document.getElementById('inputRaza').value = '';
  document.getElementById('inputEdad').value = '';
  document.getElementById('inputTamano').value = '';
  document.getElementById('inputMicrochip').value = '';
  document.getElementById('inputFotoMascota').value = '';
  document.getElementById('previewFoto').src = '';
  document.getElementById('previewFoto').style.display = 'none';
  document.getElementById('iconoFoto').style.display = 'block';
}


// ===================================
//   CARGAR CITAS
// ===================================


function loadCitas() {
  const user = auth.currentUser;
  if (!user) {
    citasContent.innerHTML = "<p>Debes iniciar sesión para ver tus citas.</p>";
    return;
  }
  citasContent.innerHTML = '<h3 style="color:#2F2E41;">Cargando citas...</h3>';
  
  db.ref('Usuarios/' + user.uid + '/Citas').once('value').then(snapshot => {
    let html = '';
    if (!snapshot.exists()) {
      citasContent.innerHTML = "<p style='color:#2F2E41;'>No hay citas próximas.</p>";
      return;
    }
    
    snapshot.forEach(childSnapshot => {
      const data = childSnapshot.val();
      const citaId = childSnapshot.key;
      
      html += `
        <div class="cita-card" style="background:#2F2E41; border-radius:16px; margin-bottom:16px; overflow:hidden;">
          <div class="cita-main" style="display:flex; align-items:center; padding:20px; gap:16px; cursor:pointer;">
            <div style="width:50px; height:50px; border-radius:50%; background:#FF7753; display:flex; align-items:center; justify-content:center;">
              <span style="font-size:1.5em;">📅</span>
            </div>
            <div style="flex:1;">
              <h3 style="margin:0; color:#FDF6EC; font-size:1.2em;">${data.Lugar || 'Sin lugar'}</h3>
              <p style="margin:5px 0 0 0; color:#FF7753; font-size:0.9em;">${data.Hora || 'Sin fecha'}</p>
            </div>
            <span class="flecha-cita" style="color:#FF7753; font-size:1.8em;">&#9650;</span>
          </div>
          <div class="cita-card-details" style="max-height:0; overflow:hidden; padding:0 20px; transition:max-height 0.4s, padding 0.3s;">
            <div style="padding:10px 0 20px 0;">
              ${data.Categoria ? `<p><strong style="color:#FF7753;">Categoría:</strong> <span style="color:#FDF6EC;">${data.Categoria}</span></p>` : ''}
              ${data.Direccion ? `<p><strong style="color:#FF7753;">Dirección:</strong> <span style="color:#FDF6EC;">${data.Direccion}</span></p>` : ''}
              ${data.Hora ? `<p><strong style="color:#FF7753;">Fecha y Hora:</strong> <span style="color:#FDF6EC;">${data.Hora}</span></p>` : ''}
              ${data.Telefono && data.Telefono !== 'Sin teléfono' ? `<p><strong style="color:#FF7753;">Teléfono:</strong> <span style="color:#FDF6EC;">${data.Telefono}</span></p>` : ''}
              
              <div style="margin-top:15px; text-align:center;">
                <button class="btn-cancelar-cita" data-cita-id="${citaId}" style="
                  background:#2F2E41;
                  border:2px solid #FF0000;
                  border-radius:8px;
                  color:#FF0000;
                  padding:10px 25px;
                  cursor:pointer;
                  transition: all 0.3s;
                ">🗑️ Cancelar Cita</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    citasContent.innerHTML = html;
    activateCitaCardListeners();
    
  }).catch(error => {
    citasContent.innerHTML = "<p style='color:#2F2E41;'>Error: " + error.message + "</p>";
  });
}

function activateCitaCardListeners() {
  document.querySelectorAll('.cita-card').forEach(card => {
    const header = card.querySelector('.cita-main');
    const details = card.querySelector('.cita-card-details');
    const flecha = card.querySelector('.flecha-cita');
    
    if (header) {
      header.onclick = function() {
        card.classList.toggle('expanded');
        
        if (card.classList.contains('expanded')) {
          details.style.maxHeight = '400px';
          details.style.padding = '10px 20px 20px 20px';
          flecha.innerHTML = '&#9660;';
        } else {
          details.style.maxHeight = '0';
          details.style.padding = '0 20px';
          flecha.innerHTML = '&#9650;';
        }
      };
    }
    
    if (details) {
      details.onclick = function(e) {
        e.stopPropagation();
      };
    }
  });
  
  // Botones cancelar cita
  const botones = document.querySelectorAll('.btn-cancelar-cita');
  console.log('Botones encontrados:', botones.length);
  
  botones.forEach((btn, index) => {
    console.log('Configurando botón', index, 'con ID:', btn.getAttribute('data-cita-id'));
    
    btn.onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      
      const citaId = this.getAttribute('data-cita-id');
      console.log('Click en cancelar, citaId:', citaId);
      
      if (!citaId) {
        console.log('ERROR: citaId es null o undefined');
        alert('Error: No se pudo obtener el ID de la cita');
        return;
      }
      
      const confirmar = confirm('¿Estás seguro de que quieres cancelar esta cita?');
      console.log('Confirmación:', confirmar);
      
      if (confirmar) {
        cancelarCita(citaId);
      }
    };
  });
}

function cancelarCita(citaId) {
  console.log('=== INICIANDO CANCELACIÓN ===');
  console.log('citaId recibido:', citaId);
  
  const user = auth.currentUser;
  console.log('Usuario actual:', user ? user.uid : 'NO HAY USUARIO');
  
  if (!user) {
    alert('Debes iniciar sesión.');
    return;
  }
  
  const rutaCita = 'Usuarios/' + user.uid + '/Citas/' + citaId;
  console.log('Ruta a eliminar:', rutaCita);
  
  // Mostrar loading en botón
  const btn = document.querySelector('[data-cita-id="' + citaId + '"]');
  console.log('Botón encontrado:', btn);
  
  if (btn) {
    btn.innerHTML = '⏳ Cancelando...';
    btn.disabled = true;
  }
  
  // Primero verificar que existe la cita
  db.ref(rutaCita).once('value')
    .then(snapshot => {
      console.log('¿Existe la cita?:', snapshot.exists());
      console.log('Datos de la cita:', snapshot.val());
      
      if (!snapshot.exists()) {
        alert('La cita no existe en la base de datos.');
        return Promise.reject('Cita no existe');
      }
      
      // Ahora sí eliminar
      console.log('Eliminando cita...');
      return db.ref(rutaCita).remove();
    })
    .then(() => {
      console.log('✅ Cita eliminada correctamente de Firebase');
      alert('✅ Cita cancelada correctamente.');
      
      console.log('Recargando lista de citas...');
      loadCitas();
    })
    .catch(error => {
      console.log('❌ ERROR:', error);
      console.log('Tipo de error:', typeof error);
      console.log('Mensaje:', error.message || error);
      
      alert('❌ Error al cancelar: ' + (error.message || error));
      
      if (btn) {
        btn.innerHTML = '🗑️ Cancelar Cita';
        btn.disabled = false;
      }
    });
}






// ===================================
//  SISTEMA DE RESEÑAS
// ===================================



function renderStars(rating) {
  const maxStars = 5;
  let html = '';
  for (let i = 1; i <= maxStars; i++) {
    html += `<span style="color:${i <= rating ? '#FFD700' : '#888'};font-size:1.3em;">★</span>`;
  }
  return html;
}

function renderResenas(resenasObj) {
  if (!resenasObj) return '<p style="color:#FF0000;"><strong>No hay reseñas.</strong></p>';
  let html = '<div style="margin-top:10px;"><strong>Reseñas:</strong></div>';
  Object.entries(resenasObj).forEach(([user, data]) => {
    const estrellas = parseFloat(data.Estrellas || data.estrellas || 0);
    html += `
      <div style="margin-bottom:10px;">
        ${renderStars(estrellas)} 
        <span style="margin-left:6px;"><strong>${user}:</strong> ${data.Valoracion || data.valoracion || ""}</span>
      </div>
    `;
  });
  return html;
}
function activateLugarCardListeners() {
  document.querySelectorAll('.lugar-card').forEach(card => {
    card.addEventListener('click', function() {
      const details = card.querySelector('.lugar-details');
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });
  });
}


// ===================================
//   CARGAR EXPLORAR + FILTROS
// ===================================

function loadExplorar(filter = 'todos') {
  explorarContent.innerHTML = `<h3>Cargando lugares (${filter === 'todos' ? 'Todos' : filter})...</h3>`;
  db.ref('Explorar').once('value').then(snapshot => {
    let html = '';
    if (!snapshot.exists()) {
      explorarContent.innerHTML = "<p>No hay elementos para explorar.</p>";
      return;
    }
    let foundItems = false;
    let mapIndex = 0;
    
    snapshot.forEach(mainCategorySnapshot => {
      const categoryKey = mainCategorySnapshot.key;
      if (filter === 'todos' || categoryKey === filterMap[filter]) {
        mainCategorySnapshot.forEach(itemSnapshot => {
          foundItems = true;
          const itemKey = itemSnapshot.key;
          const itemData = itemSnapshot.val();
          
          const citas = itemData.Citas || {};
          const direccion = citas.Direccion || itemData.Direccion || 'Sin dirección';
          const horario = citas.Horario || itemData.Horario || 'Sin horario';
          const telefono = citas.NumTelefono || itemData.NumTelefono || null;
          
          let lat = null;
          let lng = null;
          const coordsString = citas.Coordenadas || itemData.Coordenadas || null;
          if (coordsString && typeof coordsString === 'string') {
            const parts = coordsString.split(',');
            if (parts.length === 2) {
              lat = parseFloat(parts[0].trim());
              lng = parseFloat(parts[1].trim());
            }
          }
          
          html += `
            <div class="card lugar-card" style="background:#2F2E41; border-radius:16px; margin-bottom:16px; overflow:hidden;">
              <div class="lugar-main" style="display:flex; align-items:center; padding:20px; gap:16px; cursor:pointer;">
                <h4 style="margin:0; color:#FF7753; font-size:1.3em; flex:1;">${itemKey}</h4>
                
                <button class="btn-guardar-lugar" 
                        data-lugar="${itemKey}"
                        data-categoria="${categoryKey}"
                        data-direccion="${direccion}"
                        data-horario="${horario}"
                        data-telefono="${telefono || ''}"
                        style="
                          background: transparent;
                          border: none;
                          font-size: 1.5em;
                          cursor: pointer;
                          padding: 5px;
                        "
                        title="Guardar">🔖</button>
                
                <span class="flecha-lugar" style="color:#FF7753; font-size:1.8em;">&#x25B2;</span>
              </div>
              <div class="lugar-details" style="max-height:0; overflow:hidden; padding:0 20px; transition:max-height 0.4s, padding 0.3s;">
                <div style="padding:10px 0;">
                  <p>
                    <span style="color:#FF7753;font-weight:bold;">Dirección:</span>
                    <span style="color:#FDF6EC;">${direccion}</span>
                  </p>
                  <p>
                    <span style="color:#FF7753;font-weight:bold;">Horario:</span>
                    <span style="color:#FDF6EC;">${horario}</span>
                  </p>
                  ${telefono ? `
                  <p>
                    <span style="color:#FF7753;font-weight:bold;">Teléfono:</span>
                    <span style="color:#FDF6EC;">${telefono}</span>
                  </p>
                  ` : ''}
                  
                  ${lat && lng ? `
                    <div style="margin-top:15px;">
                      <p style="color:#FF7753;font-weight:bold;margin-bottom:10px;">Ubicación:</p>
                      <div id="map-${mapIndex}" class="mapa-container" 
                           data-lat="${lat}" 
                           data-lng="${lng}" 
                           data-nombre="${itemKey}"
                           style="width:100%; height:200px; border-radius:12px; border:2px solid #FF7753; overflow:hidden;">
                      </div>
                    </div>
                  ` : ''}
                  
                  <div style="margin-top:20px; text-align:center;">
                    <button class="btn-reservar-cita" 
                            data-lugar="${itemKey}" 
                            data-categoria="${categoryKey}"
                            data-horario="${horario}"
                            data-direccion="${direccion}"
                            data-telefono="${telefono || 'Sin teléfono'}"
                            style="
                              background: #2F2E41;
                              border: 2px solid #ADFF2F;
                              border-radius: 8px;
                              color: #ADFF2F;
                              padding: 12px 30px;
                              font-size: 1em;
                              cursor: pointer;
                            ">📅 Reservar Cita</button>
                  </div>
                  
                  <hr style="border-color:#FF7753; margin:15px 0;">
                  ${renderResenas(itemData.Resenas)}
                </div>
              </div>
            </div>
          `;
          mapIndex++;
        });
      }
    });
    
    html += `
      <div id="modalReservarCita" style="
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 1000;
        justify-content: center;
        align-items: center;
      ">
        <div style="
          background: #2F2E41;
          border-radius: 20px;
          padding: 30px;
          width: 90%;
          max-width: 400px;
        ">
          <h2 id="modalLugarNombre" style="color: #FF7753; text-align: center; margin-bottom: 5px;"></h2>
          <p id="modalLugarHorario" style="color: #FDF6EC; text-align: center; margin-bottom: 20px; font-size: 0.9em;"></p>
          
          <div style="margin-bottom: 15px;">
            <label style="color: #FF7753; font-size: 0.9em;">FECHA :</label>
            <input type="date" id="inputFechaCita" style="
              width: 100%;
              padding: 12px;
              margin-top: 5px;
              background: #3D3C4D;
              border: none;
              border-radius: 8px;
              color: #FDF6EC;
              font-size: 1em;
            ">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="color: #FF7753; font-size: 0.9em;">HORA :</label>
            <input type="time" id="inputHoraCita" style="
              width: 100%;
              padding: 12px;
              margin-top: 5px;
              background: #3D3C4D;
              border: none;
              border-radius: 8px;
              color: #FDF6EC;
              font-size: 1em;
            ">
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button id="btnCancelarCita" style="
              flex: 1;
              padding: 12px;
              background: #2F2E41;
              border: 2px solid #FF0000;
              border-radius: 8px;
              color: #FF0000;
              font-size: 1em;
              cursor: pointer;
            ">Cancelar</button>
            <button id="btnConfirmarCita" style="
              flex: 1;
              padding: 12px;
              background: #ADFF2F;
              border: none;
              border-radius: 8px;
              color: #2F2E41;
              font-size: 1em;
              font-weight: bold;
              cursor: pointer;
            ">RESERVAR</button>
          </div>
        </div>
      </div>
    `;
    
    if (!foundItems) {
      explorarContent.innerHTML = `<p>No hay lugares en la categoría: <strong>${filter}</strong>.</p>`;
    } else {
      explorarContent.innerHTML = html;
      activateLugarCardListeners();
      activateReservarCitaListeners();
    }
  }).catch(error => {
    explorarContent.innerHTML = "<p>Error: " + error.message + "</p>";
  });
}


// *** UNA SOLA FUNCIÓN activateLugarCardListeners ***
function activateLugarCardListeners() {
  document.querySelectorAll('.lugar-card').forEach(card => {
    const header = card.querySelector('.lugar-main');
    const details = card.querySelector('.lugar-details');
    const flecha = card.querySelector('.flecha-lugar');
    const btnGuardar = card.querySelector('.btn-guardar-lugar');
    
    // BOTÓN GUARDAR - con stopPropagation
    if (btnGuardar) {
      btnGuardar.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const lugarData = {
          nombre: this.getAttribute('data-lugar'),
          categoria: this.getAttribute('data-categoria'),
          direccion: this.getAttribute('data-direccion'),
          horario: this.getAttribute('data-horario'),
          telefono: this.getAttribute('data-telefono')
        };
        
        guardarLugar(lugarData, this);
      });
    }
    
    // HEADER - expandir/contraer
    header.addEventListener('click', function(e) {
      // Si click fue en botón guardar, salir
      if (e.target.closest('.btn-guardar-lugar')) {
        return;
      }
      
      card.classList.toggle('expanded');
      
      if (card.classList.contains('expanded')) {
        details.style.maxHeight = '800px';
        details.style.padding = '10px 20px 20px 20px';
        flecha.innerHTML = '&#x25BC;';
        
        const mapaContainer = details.querySelector('.mapa-container');
        if (mapaContainer && !mapaContainer.dataset.loaded) {
          const lat = parseFloat(mapaContainer.dataset.lat);
          const lng = parseFloat(mapaContainer.dataset.lng);
          const nombre = mapaContainer.dataset.nombre;
          initMap(mapaContainer.id, lat, lng, nombre);
          mapaContainer.dataset.loaded = 'true';
        }
      } else {
        details.style.maxHeight = '0';
        details.style.padding = '0 20px';
        flecha.innerHTML = '&#x25B2;';
      }
    });
    
    // DETALLES - evitar propagación
    details.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });
}


function guardarLugar(lugar, btn) {
  const user = auth.currentUser;
  if (!user) {
    alert('Debes iniciar sesión para guardar lugares.');
    return;
  }
  
  const iconoOriginal = btn.innerHTML;
  btn.innerHTML = '⏳';
  btn.disabled = true;
  
  db.ref('Usuarios/' + user.uid + '/Guardados/' + lugar.nombre).set({
    Categoria: lugar.categoria,
    Direccion: lugar.direccion,
    Horario: lugar.horario,
    Telefono: lugar.telefono || 'Sin teléfono'
  }).then(() => {
    btn.innerHTML = '✅';
    alert('✅ "' + lugar.nombre + '" guardado correctamente.');
    setTimeout(() => {
      btn.innerHTML = '🔖';
      btn.disabled = false;
    }, 1500);
  }).catch(error => {
    btn.innerHTML = iconoOriginal;
    btn.disabled = false;
    alert('❌ Error al guardar: ' + error.message);
  });
}


function activateReservarCitaListeners() {
  const modal = document.getElementById('modalReservarCita');
  const btnCancelar = document.getElementById('btnCancelarCita');
  const btnConfirmar = document.getElementById('btnConfirmarCita');
  
  let lugarSeleccionado = {};
  
  document.querySelectorAll('.btn-reservar-cita').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      lugarSeleccionado = {
        nombre: this.dataset.lugar,
        categoria: this.dataset.categoria,
        horario: this.dataset.horario,
        direccion: this.dataset.direccion,
        telefono: this.dataset.telefono
      };
      
      document.getElementById('modalLugarNombre').textContent = lugarSeleccionado.nombre;
      document.getElementById('modalLugarHorario').textContent = lugarSeleccionado.horario;
      document.getElementById('inputFechaCita').value = '';
      document.getElementById('inputHoraCita').value = '';
      
      modal.style.display = 'flex';
    });
  });
  
  btnCancelar.onclick = function() {
    modal.style.display = 'none';
  };
  
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  btnConfirmar.onclick = function() {
    const fecha = document.getElementById('inputFechaCita').value;
    const hora = document.getElementById('inputHoraCita').value;
    
    if (!fecha) {
      alert('Por favor, selecciona una fecha.');
      return;
    }
    if (!hora) {
      alert('Por favor, selecciona una hora.');
      return;
    }
    
    guardarCita(lugarSeleccionado, fecha, hora);
  };
}


function guardarCita(lugar, fecha, hora) {
  const user = auth.currentUser;
  if (!user) {
    alert('Debes iniciar sesión para reservar una cita.');
    return;
  }
  
  const fechaObj = new Date(fecha + 'T' + hora);
  const dia = String(fechaObj.getDate()).padStart(2, '0');
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const anio = fechaObj.getFullYear();
  const horaFormateada = `${dia}/${mes}/${anio} ${hora}`;
  
  const nuevaCitaRef = db.ref('Usuarios/' + user.uid + '/Citas').push();
  nuevaCitaRef.set({
    Categoria: lugar.categoria,
    Direccion: lugar.direccion,
    Hora: horaFormateada,
    Lugar: lugar.nombre,
    Telefono: lugar.telefono || 'Sin teléfono'
  }).then(() => {
    alert('✅ ¡Cita reservada con éxito!');
    document.getElementById('modalReservarCita').style.display = 'none';
  }).catch(error => {
    alert('❌ Error al reservar: ' + error.message);
  });
}


function initMap(containerId, lat, lng, nombre) {
  const map = L.map(containerId).setView([lat, lng], 15);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  L.marker([lat, lng]).addTo(map)
    .bindPopup(`<b>${nombre}</b>`)
    .openPopup();
}


// ===================================
//   CARGA INICIAL EN DOM
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  if (auth.currentUser) {
    const activeSectionBtn = document.querySelector('.menu-btn.active');
    const activeSectionId = activeSectionBtn ? activeSectionBtn.dataset.section : 'guardados';
    loadSectionContent(activeSectionId);
  }
});

