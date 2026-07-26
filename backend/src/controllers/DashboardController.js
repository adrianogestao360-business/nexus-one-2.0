const DashboardService = require("../services/DashboardService");

class DashboardController {
  async index(req, res) {
    const dashboard = await DashboardService.obterDashboard(
      req.usuario.empresaId,
    );

    return res.json(dashboard);
  }
}

module.exports = new DashboardController();
