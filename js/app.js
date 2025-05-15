import { UI, Admin } from './modules.js';

document.addEventListener('DOMContentLoaded', () => {
  UI.initUserFlow();
  UI.initCartonGrid();
  UI.initPaymentFlow();
  Admin.init();
});
