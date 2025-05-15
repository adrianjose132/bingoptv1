const API_BASE = 'https://script.google.com/macros/s/…/exec';

export class Modal {
  static open(imgUrl) {
    const m = document.getElementById('modal');
    m.querySelector('img').src = imgUrl;
    m.hidden = false;
    m.querySelector('.modal-close').focus();
  }
  static close() {
    document.getElementById('modal').hidden = true;
  }
}

export class UI {
  static initUserFlow() {
    const form = document.getElementById('userForm');
    const btn = document.getElementById('btnStep1');
    const tel = document.getElementById('telefono');
    tel.addEventListener('input', () => {
      btn.disabled = !tel.checkValidity();
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      this.showSection(2);
      this.updateResumen();
      this.startTimer();
    });
    document.getElementById('adminIcon').addEventListener('click', () => {
      Admin.togglePanel();
    });
    document.querySelector('#modal .modal-close').addEventListener('click', Modal.close);
  }

  static initCartonGrid() {
    this.selected = new Set();
    document.getElementById('btnConfirm').addEventListener('click', () => {
      this.showSection(3);
    });
    this.renderGrid();
  }

  static renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const rango = Admin.config.rango;
    for (let i = 1; i <= rango; i++) {
      const d = document.createElement('div');
      d.className = 'carton';
      d.textContent = i;
      d.tabIndex = 0;
      d.addEventListener('click', () => this.toggleCarton(i, d));
      d.addEventListener('dblclick', () => {
        const idx = String(i - 1).padStart(2, '0');
        Modal.open(`/cartones/${idx}.jpg`);
      });
      grid.appendChild(d);
    }
  }

  static toggleCarton(num, el) {
    if (this.selected.has(num)) {
      this.selected.delete(num);
      el.classList.remove('selected');
    } else if (this.selected.size < 18) {
      this.selected.add(num);
      el.classList.add('selected');
    } else {
      alert('Máximo 18 cartones.');
    }
    document.getElementById('cnt').textContent = this.selected.size;
    document.getElementById('btnConfirm').disabled = this.selected.size === 0;
  }

  static initPaymentFlow() {
    const form = document.getElementById('paymentForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      UI.sendPayment();
    });
  }

  static startTimer() {
    clearInterval(this.timerInt);
    let s = 1200;
    this.timerInt = setInterval(() => {
      s--;
      if (s < 0) {
        clearInterval(this.timerInt);
        alert('Tiempo agotado');
        return this.showSection(1);
      }
      const m = String(Math.floor(s / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      document.getElementById('timer').textContent = `${m}:${sec}`;
    }, 1000);
  }

  static updateResumen() {
    const n = document.getElementById('nombre').value;
    const a = document.getElementById('apellido').value;
    const t = document.getElementById('telefono').value;
    const cartones = [...this.selected].join(',');
    const total = this.selected.size * Admin.config.precio;
    document.getElementById('resumen').innerHTML =
      `<strong>${n} ${a}</strong><br/>Tel: ${t}<br/>Cartones: ${cartones}<br/>Total: Bs${total}`;
  }

  static sendPayment() {
    const ref = document.getElementById('referencia').value.trim();
    if (!ref) return alert('Ingresa referencia.');
    alert('Pago enviado. ¡Gracias!');
    clearInterval(this.timerInt);
    this.showSection(4);
  }

  static showSection(n) {
    [1,2,3,4].forEach(i => {
      document.getElementById(`step${i}`).hidden = i !== n;
    });
  }
}

export class Admin {
  static config = { precio:5, rango:500, fechaSorteo:'', wsp:'' };

  static init() {
    document
      .getElementById('adminLoginForm')
      .addEventListener('submit', e => this.login(e));
    document
      .getElementById('configForm')
      .addEventListener('submit', e => this.saveConfig(e));
    document.getElementById('resetSorteo').addEventListener('click', () => {
      if (confirm('Resetear todas las ventas?')) location.reload();
    });
    document.getElementById('searchCompras')
      .addEventListener('input', () => this.renderCompras());
  }

  static togglePanel() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  }

  static async login(e) {
    e.preventDefault();
    this.togglePanel();
    document.getElementById('adminContent').hidden = false;
    this.loadConfig();
  }

  static loadConfig() {
    this.config = { precio:5, rango:500, fechaSorteo:'2025-06-01T20:00', wsp:'+584123456789' };
    document.getElementById('cfgPrecio').value = this.config.precio;
    document.getElementById('cfgRango').value = this.config.rango;
    document.getElementById('cfgFechaSorteo').value = this.config.fechaSorteo;
    document.getElementById('cfgWhats').value = this.config.wsp;
    document.getElementById('displayFechaSorteo').textContent =
      `📅 Sorteo: ${new Date(this.config.fechaSorteo).toLocaleString()}`;
    UI.renderGrid();
  }

  static async saveConfig(e) {
    e.preventDefault();
    this.config.precio = +document.getElementById('cfgPrecio').value;
    this.config.rango  = +document.getElementById('cfgRango').value;
    this.config.fechaSorteo = document.getElementById('cfgFechaSorteo').value;
    this.config.wsp     = document.getElementById('cfgWhats').value.trim();
    alert('Configuración guardada');
    document.getElementById('displayFechaSorteo').textContent =
      `📅 Sorteo: ${new Date(this.config.fechaSorteo).toLocaleString()}`;
    UI.renderGrid();
  }

  static renderCompras() {
    const cont = document.getElementById('adminCompras');
    cont.innerHTML = '<p>No hay compras en esta demo.</p>';
    document.getElementById('totalVendidos').textContent = '0';
    document.getElementById('totalRecaudado').textContent = '0.00';
  }
}
