/**
 * MV.ai — Authentication & Credits State (100% Free / Sem Mensalidades)
 */

const MV_AUTH = {
  isLoggedIn: true,
  userId: 'mv-user-free-lifetime',
  userName: 'Membro VIP MV.ai',
  userRole: 'vip_lifetime',
  credits: Infinity,

  init() {
    if (!localStorage.getItem('mv_user_id')) {
      localStorage.setItem('mv_user_id', this.userId);
      localStorage.setItem('mv_user_name', this.userName);
      localStorage.setItem('mv_auth_token', 'lifetime-free-access');
    }
    this.updateUI();
  },

  updateUI() {
    const sidebarName = document.getElementById('user-display-name-sidebar');
    const mobileName = document.getElementById('user-display-name-mobile');
    const sidebarCredits = document.getElementById('credits-balance-display-sidebar');
    const mobileCredits = document.getElementById('credits-balance-display-mobile');

    const name = localStorage.getItem('mv_user_name') || this.userName;
    if (sidebarName) sidebarName.textContent = name;
    if (mobileName) mobileName.textContent = name;

    const creditBadge = `<span class="badge-vip"><i class="fas fa-infinity mr-1"></i> Créditos Ilimitados</span>`;
    if (sidebarCredits) sidebarCredits.innerHTML = creditBadge;
    if (mobileCredits) mobileCredits.innerHTML = creditBadge;
  }
};

// Sempre retorna sucesso e permite todas as ações sem cobrar
async function consumeCreditAction(actionType) {
  console.log(`[MV.ai] Ação autorizada sem custo: ${actionType}`);
  return true;
}

async function refundCreditAction(actionType, amount) {
  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  MV_AUTH.init();
});
